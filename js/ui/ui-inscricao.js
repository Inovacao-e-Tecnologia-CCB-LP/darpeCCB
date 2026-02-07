function showEscolherLocal() {
  setTitle(" Escolha o local");

  if (!dataStore.locais || dataStore.locais.length === 0) {
    conteudo.innerHTML = `
        <div class="alert alert-secondary text-center">
          Nenhum local encontrado.
        </div>
      `;
    return;
  }

  const g = document.createElement("div");
  g.className = "d-grid gap-2 col-md-6 mx-auto";

  dataStore.locais.forEach((l) => {
    const btn = document.createElement("button");
    btn.className = "btn btn-outline-dark btn-lg";
    btn.textContent = l.nome;
    btn.onclick = () => selecionarLocal(l);
    g.appendChild(btn);
  });

  conteudo.innerHTML = "";
  conteudo.appendChild(g);
}

function showEscolherData() {
  setTitle(" Escolha a data");

  const programacoesFiltradas = dataStore.programacao.filter(
    (p) => p.local_id == escolha.local.id,
  );

  if (programacoesFiltradas.length === 0) {
    conteudo.innerHTML = `
        <div class="alert alert-secondary text-center">
          Nenhuma data disponível para este local.
        </div>
      `;
    return;
  }

  const g = document.createElement("div");
  g.className = "d-grid gap-2 col-md-8 mx-auto mb-4";

  programacoesFiltradas.forEach((p) => {
    const btn = document.createElement("button");
    btn.className = "btn btn-outline-dark btn-lg";
    btn.innerHTML = `${p.tipo_visita} - ${formatarData(p.data)} – ${p.descricao} (${formatarHorario(p.horario)})`;
    btn.onclick = () => selecionarData(p);
    g.appendChild(btn);
  });

  const obs = document.createElement("div");
  obs.className = "col-md-8 mx-auto";
  obs.innerHTML = Ui.ObservacaoTrajes();

  conteudo.innerHTML = "";
  conteudo.appendChild(g);
  conteudo.appendChild(obs);
}

function showEscolherInstrumento() {
  setTitle(" Escolha o instrumento");

  // Filtramos primeiro para saber se haverá opções
  const instrumentosDisponiveis = dataStore.instrumentos.filter((i) => {
    return (
      (i.tipo === "corda" && escolha.local.permite_cordas) ||
      (i.tipo === "sopro" && escolha.local.permite_sopros)
    );
  });

  if (instrumentosDisponiveis.length === 0) {
    conteudo.innerHTML = `
        <div class="alert alert-secondary text-center">
          Não há instrumentos compatíveis com as regras deste local.
        </div>
      `;
    return;
  }

  const g = document.createElement("div");
  g.className = "d-grid gap-2 col-md-6 mx-auto";

  instrumentosDisponiveis.forEach((i) => {
    const btn = document.createElement("button");
    btn.className = "btn btn-outline-dark btn-lg";
    btn.textContent = i.nome;
    btn.onclick = () => selecionarInstrumento(i);
    g.appendChild(btn);
  });

  conteudo.innerHTML = "";
  conteudo.appendChild(g);
}

function showConfirmar() {
  setTitle(" Confirmar presença");
  conteudo.innerHTML = Ui.ConfirmarPresenca();
}

async function salvarInscricao() {
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
    local: escolha.local.id,
    local_id: escolha.local.id,
    programacao_id: escolha.programacao.id,
    tipo_visita: escolha.programacao.tipo_visita,
    instrumento: escolha.instrumento.id,
    instrumento_id: escolha.instrumento.id,
    nome,
  };

  try {
    const r = await inscricoesService.criar(payload);

    if (r?.error) {
      abrirModalAviso("Aviso", r.error);
      return;
    }

    if (r?.id && r?.delete_token) {
      localStorageService.salvarAutorizacao(r.id, r.delete_token);
    }

    abrirModalAviso("Sucesso", "Inscrição confirmada! Deus abençoe");
    resetAndGoHome();
  } catch (e) {
    console.error(e);
    abrirModalAviso("Erro", "Erro ao salvar inscrição");
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHTML;
  }
}

async function excluirInscricao(id, btn) {
  const auth = localStorageService.buscarAutorizacao(id);

  if (!auth) {
    abrirModalAviso(
      "Erro",
      "Você não tem permissão para excluir esta inscrição.",
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
  btn.className = "btn btn-sm btn-danger";
  btn.innerHTML =
    '<span class="spinner-border spinner-border-sm text-light"></span>';

  try {
    const r = await inscricoesService.excluir(id, auth.token);

    if (!r?.success) throw r;

    localStorageService.removerAutorizacao(id);
    abrirModalAviso("Sucesso", "Inscrição excluída com sucesso!");
    showInscritos();
  } catch (e) {
    console.error(e);
    abrirModalAviso("Erro", "Erro ao excluir inscrição");
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHTML;
  }
}
