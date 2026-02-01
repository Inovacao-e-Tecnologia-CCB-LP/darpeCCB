/* ================= LOCAL STORAGE DELETE CONTROL ================= */

const LS_KEY = "inscricoes_autorizadas";

function buscarAutorizacao(id) {
  try {
    const lista = JSON.parse(localStorage.getItem(LS_KEY)) || [];
    return lista.find((item) => item.id === id) || null;
  } catch (e) {
    console.error("Erro ao ler autorizações do localStorage:", e);
    return null;
  }
}

function salvarAutorizacao(id, token) {
  try {
    const lista = JSON.parse(localStorage.getItem(LS_KEY)) || [];
    const novaLista = lista.filter((item) => item.id !== id);

    novaLista.push({ id, token });

    localStorage.setItem(LS_KEY, JSON.stringify(novaLista));
  } catch (e) {
    console.error("Erro ao salvar autorização:", e);
  }
}

function removerAutorizacao(id) {
  try {
    let lista = JSON.parse(localStorage.getItem(LS_KEY)) || [];
    lista = lista.filter((item) => item.id !== id);
    localStorage.setItem(LS_KEY, JSON.stringify(lista));
  } catch (e) {
    console.error("Erro ao remover autorização:", e);
  }
}

/* ================= API CALLS ================= */

async function salvar() {
  const btn = document.getElementById("btnConfirmar");
  const nome = document.getElementById("nome").value.trim();

  if (!nome) {
    abrirModalAviso("Aviso", "Informe o nome");
    return;
  }

  const originalHTML = btn.innerHTML;

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';

  const payload = {
    local_id: escolha.local.id,
    local_nome: escolha.local.nome,
    programacao_id: escolha.programacao.id,
    tipo_visita: escolha.programacao.tipo_visita,
    instrumento: escolha.instrumento,
    nome,
  };

  try {
    const r = await appScriptApi.post(payload);

    if (!r) {
      throw new Error("Resposta vazia do servidor");
    }

    if (r.error) {
      abrirModalAviso("Aviso", r.error);
      return;
    }

    // Salvar autorização de delete
    if (r.id && r.delete_token) {
      salvarAutorizacao(r.id, r.delete_token);
    }

    abrirModalAviso("Sucesso", "Inscrição confirmada! Deus abençoe");
    resetAndGoHome();
  } catch (e) {
    console.error("Erro ao salvar inscrição: ", e);
    abrirModalAviso("Erro", "Ocorreu um erro ao salvar a inscrição.");
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHTML;
  }
}

async function excluirInscricao(id, btn) {
  const auth = buscarAutorizacao(id);

  if (!auth) {
    abrirModalAviso(
      "Erro",
      "❌ Você não tem permissão para excluir esta inscrição.",
    );
    return;
  }

  const confirmou = await abrirModalConfirmacao(
    "Deseja realmente excluir esta inscrição?",
    "Excluir",
  );

  if (!confirmou) return;

  const originalHTML = btn.innerHTML;
  const originalClass = btn.className;

  btn.disabled = true;
  btn.className = "btn btn-danger btn-sm";
  btn.innerHTML = `
    <span class="spinner-border spinner-border-sm text-light"></span>
  `;

  try {
    const r = await appScriptApi.post({
      entity: "inscricoes",
      action: "delete",
      id,
      delete_token: auth.token,
    });

    if (!r || r.success !== true) {
      console.error("Falha ao excluir inscrição:", r);
      throw r;
    }

    removerAutorizacao(id);
    abrirModalAviso("Sucesso", "Inscrição excluída com sucesso!");
    showInscritos();
  } catch (err) {
    console.error("Erro real ao excluir inscrição: ", err);
    abrirModalAviso("Erro", "Ocorreu um erro ao excluir a inscrição.");
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHTML;
  }
}
