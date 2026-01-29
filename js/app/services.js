/* ================= LOCAL STORAGE DELETE CONTROL ================= */

const LS_KEY = "inscricoes_autorizadas";
const MAX_IDS = 2;

function salvarAutorizacao(id, token) {
  let lista = JSON.parse(localStorage.getItem(LS_KEY)) || [];
  lista = lista.filter((item) => item.id !== id);
  lista.push({ id, token });

  if (lista.length > MAX_IDS) {
    lista = lista.slice(-MAX_IDS);
  }

  localStorage.setItem(LS_KEY, JSON.stringify(lista));
}

function podeDeletar(id) {
  const lista = JSON.parse(localStorage.getItem(LS_KEY)) || [];
  return lista.find((item) => item.id === id);
}

function removerAutorizacao(id) {
  let lista = JSON.parse(localStorage.getItem(LS_KEY)) || [];
  lista = lista.filter((item) => item.id !== id);
  localStorage.setItem(LS_KEY, JSON.stringify(lista));
}

/* ================= API CALLS ================= */

async function salvar() {
  const btn = document.getElementById("btnConfirmar");
  const nome = document.getElementById("nome").value.trim();

  if (!nome) {
    abrirModalAviso("Aviso", "Informe o nome");
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';

  const payload = {
    local: escolha.local.nome,
    programacao_id: escolha.programacao.id,
    tipo_visita: escolha.programacao.tipo_visita,
    instrumento: escolha.instrumento,
    nome,
    limite: escolha.local.limite,
  };

  try {
    const r = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    }).then((r) => r.json());

    if (r.error) throw r.error;

    // salva autorização de delete
    if (r.id && r.delete_token) {
      salvarAutorizacao(r.id, r.delete_token);
    }

    abrirModalAviso("Sucesso", " Inscrição confirmada! Deus Abençoe");
    resetAndGoHome();
  } catch (e) {
    abrirModalAviso("Erro", "❌ Erro ao salvar");
    btn.disabled = false;
    btn.innerHTML = "Confirmar";
  }
}

async function excluirInscricao(id, btn) {
  const auth = podeDeletar(id);
  if (!auth) {
    abrirModalAviso(
      "Erro",
      "❌ Você não tem permissão para excluir esta inscrição."
    );
    return;
  }

  const confirmou = await abrirModalConfirmacao(
    "Deseja realmente excluir esta inscrição?",
    "Excluir"
  );

  if (!confirmou) return;

  // guarda estado original do botão
  const originalHTML = btn.innerHTML;
  const originalClass = btn.className;

  // ativa loading
  btn.disabled = true;
  btn.className = "btn btn-danger btn-sm";
  btn.innerHTML = `
        <span class="spinner-border spinner-border-sm text-light"
              role="status"
              aria-hidden="true"></span>
    `;

  try {
    const r = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        entity: "inscricoes",
        action: "delete",
        id,
        delete_token: auth.token,
      }),
    }).then((r) => r.json());

    if (!r.success) throw new Error();

    removerAutorizacao(id);
    abrirModalAviso("Sucesso", "Inscrição excluída com sucesso !!");
    showInscritos();
  } catch (err) {
    abrirModalAviso("Erro", " Não foi possível excluir a inscrição.");

    // restaura botão se falhar
    btn.disabled = false;
    btn.className = originalClass;
    btn.innerHTML = originalHTML;
  }
}