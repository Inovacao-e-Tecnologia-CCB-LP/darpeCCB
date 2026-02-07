/* =========================
   UI • REGRAS DE DATAS
========================= */

async function abrirTelaRegrasDatas() {
  setTitle("Admin • Regras de Datas");
  conteudo.innerHTML = Ui.PainelRegrasDatas();
  carregarRegrasDatas();
}

/* =========================
   LISTAGEM
========================= */

async function carregarRegrasDatas() {
  const lista = document.getElementById("listaRegrasDatas");

  try {
    mostrarLoading("listaRegrasDatas");

    const data = await regrasDatasService.listar();
    let regras = data || [];

    if (!regras.length) {
      lista.innerHTML = `
        <div class="alert alert-secondary text-center">
          Nenhuma regra cadastrada
        </div>
      `;
      return;
    }

    // Ordenação: Local (A-Z) e depois Dia da Semana
    regras.sort((a, b) => {
      const localA =
        dataStore.locais.find((l) => l.id == a.local_id)?.nome || "";
      const localB =
        dataStore.locais.find((l) => l.id == b.local_id)?.nome || "";
      return localA.localeCompare(localB) || a.dia_semana - b.dia_semana;
    });

    if (isMobile()) {
      renderCardsRegrasDatas(regras);
    } else {
      renderTabelaRegrasDatas(regras);
    }
  } catch (err) {
    console.error(err);
    lista.innerHTML = `
      <div class="alert alert-danger text-center">
        Erro ao carregar regras
      </div>
    `;
  }
}

function renderTabelaRegrasDatas(regras) {
  let html = `
    <div class="table-responsive rounded shadow-sm overflow-hidden">
      <table class="table table-bordered align-middle mb-0">
        <thead class="table-dark">
          <tr>
            <th>Local</th>
            <th>Tipo</th>
            <th>Quando</th>
            <th class="text-center">Horário</th>
            <th class="text-center">Status</th>
            <th class="text-center" width="120">Ações</th>
          </tr>
        </thead>
        <tbody>
  `;

  regras.forEach((r) => {
    const local = dataStore.locais.find((l) => l.id == r.local_id);
    const nomeLocal = local
      ? local.nome
      : '<span class="text-danger">Local excluído</span>';

    html += `
      <tr>
        <td>${nomeLocal}</td>
        <td>${r.tipo_visita}</td>
        <td>${formatarQuando(r.dia_semana, r.ordinal)}</td>
        <td class="text-center">${formatarHorario(r.horario)}</td>
        <td class="text-center">
          ${r.ativo
        ? '<span class="badge bg-success">Ativo</span>'
        : '<span class="badge bg-secondary">Inativo</span>'
      }
        </td>
        <td class="text-center">
          <button class="btn btn-sm btn-outline-dark me-1 editar-btn" onclick="editarRegra(${r.id}, this)">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger excluir-btn" onclick="excluirRegra(${r.id}, this)">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;
  });

  html += `</tbody></table></div>`;
  document.getElementById("listaRegrasDatas").innerHTML = html;
}

function renderCardsRegrasDatas(regras) {
  let html = `<div class="d-grid gap-3">`;

  regras.forEach((r) => {
    const local = dataStore.locais.find((l) => l.id == r.local_id);
    const nomeLocal = local ? local.nome : "Local excluído";

    html += `
      <div class="card shadow-sm">
        <div class="modal-header bg-dark text-white rounded-top p-2">
          <h6 class="mb-0">${nomeLocal}</h6>
        </div>
        <div class="card-body">
          <p class="mb-1"><strong>Tipo:</strong> ${r.tipo_visita}</p>
          <p class="mb-1"><strong>Quando:</strong> ${formatarQuando(r.dia_semana, r.ordinal)}</p>
          <p class="mb-2"><strong>Horário:</strong> ${formatarHorario(r.horario)}</p>
          <p class="mb-3">
            <strong>Status:</strong> ${r.ativo ? '<span class="badge bg-success">Ativo</span>' : '<span class="badge bg-secondary">Inativo</span>'}
          </p>
          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-outline-dark w-50 editar-btn" onclick="editarRegra(${r.id}, this)">
              <i class="bi bi-pencil"></i> Editar
            </button>
            <button class="btn btn-sm btn-outline-danger w-50 excluir-btn" onclick="excluirRegra(${r.id}, this)">
              <i class="bi bi-trash"></i> Excluir
            </button>
          </div>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  document.getElementById("listaRegrasDatas").innerHTML = html;
}

/* =========================
   HELPERS
========================= */

function montarPayloadRegra() {
  const id = document.getElementById("regraId").value;
  const localId = document.getElementById("regraLocal").value;
  const tipo = document.getElementById("regraTipo").value.trim();
  const dia = document.getElementById("regraDiaSemana").value;
  const ordinal = document.getElementById("regraOrdinal").value;
  const horario = document.getElementById("regraHorario").value;
  const ativo = document.getElementById("regraAtivo").checked;

  if (!localId || !tipo || !horario) {
    abrirModalAviso("Aviso", "Preencha corretamente todos os campos");
    return null;
  }

  return {
    id: id ? Number(id) : null,
    local_id: Number(localId),
    tipo_visita: tipo,
    dia_semana: Number(dia),
    ordinal: Number(ordinal),
    horario: String(horario),
    ativo: ativo,
  };
}

function preencherFormularioRegra(regra) {
  document.getElementById("regraId").value = regra.id;
  document.getElementById("regraTipo").value = regra.tipo_visita;
  document.getElementById("regraDiaSemana").value = regra.dia_semana;
  document.getElementById("regraOrdinal").value = regra.ordinal;
  document.getElementById("regraHorario").value = formatarHorario(
    regra.horario,
  );
  document.getElementById("regraAtivo").checked = regra.ativo;

  const selectLocal = document.getElementById("regraLocal");
  selectLocal.innerHTML = '<option value="">Selecione...</option>';
  dataStore.locais.forEach((l) => {
    const opt = document.createElement("option");
    opt.value = l.id;
    opt.text = l.nome;
    if (Number(l.id) === Number(regra.local_id)) opt.selected = true;
    selectLocal.appendChild(opt);
  });
}

function formatarQuando(dia, ordinal) {
  const dias = [
    "",
    "Domingo",
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
  ];
  const nomeDia = dias[dia] || "Dia?";
  if (Number(ordinal) === 0) return `Todas(os): ${nomeDia}`;
  if (Number(ordinal) === -1) return `Última ${nomeDia}`;
  return `${ordinal}ª ${nomeDia}`;
}

async function reloadRegras() {
  mostrarLoading("listaRegrasDatas");
  await carregarProgramacao();
  await carregarRegrasDatas();
}

/* =========================
   MODAL • NOVO / EDITAR
========================= */

function abrirModalNovaRegra() {
  document.getElementById("modalRegraTitulo").innerText = "Nova Regra";
  limparFormularioRegra();

  // Popular select de locais no novo registro
  const selectLocal = document.getElementById("regraLocal");
  selectLocal.innerHTML = '<option value="">Selecione...</option>';
  dataStore.locais.forEach((l) => {
    const opt = document.createElement("option");
    opt.value = l.id;
    opt.text = l.nome;
    selectLocal.appendChild(opt);
  });

  document.getElementById("btnSalvarRegra").onclick = salvarRegra;
  new bootstrap.Modal(document.getElementById("modalRegra")).show();
}

function limparFormularioRegra() {
  document.getElementById("regraId").value = "";
  document.getElementById("regraTipo").value = "";
  document.getElementById("regraDiaSemana").value = "1";
  document.getElementById("regraOrdinal").value = "0";
  document.getElementById("regraHorario").value = "";
  document.getElementById("regraAtivo").checked = true;
}

/* =========================
   SALVAR
========================= */

async function salvarRegra() {
  const payload = montarPayloadRegra();
  if (!payload) return;

  const btn = document.getElementById("btnSalvarRegra");
  const textoOriginal = btn.innerHTML;

  try {
    desabilitarBotaoRegra();
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> Salvando`;

    let r;
    if (payload.id) {
      r = await regrasDatasService.atualizar(payload, senhaDigitada);
    } else {
      r = await regrasDatasService.criar(payload, senhaDigitada);
    }

    if (r?.error) {
      abrirModalAviso("Aviso", r.error);
      return;
    }

    bootstrap.Modal.getInstance(document.getElementById("modalRegra")).hide();
    abrirModalAviso(
      "Sucesso",
      payload.id ? "Regra editada com sucesso!" : "Regra criada com sucesso!",
    );
    await reloadRegras();
  } catch (err) {
    console.error(err);
    abrirModalAviso("Erro", "Erro ao salvar regra");
  } finally {
    habilitarBotaoRegra();
    btn.disabled = false;
    btn.innerHTML = textoOriginal;
  }
}

/* =========================
   EDITAR
========================= */

async function editarRegra(id, btn) {
  let salvou = false;
  const textoOriginal = btn.innerHTML;

  try {
    desabilitarBotaoRegra();
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span>`;

    const data = await regrasDatasService.listar();
    const regra = (data || []).find((r) => Number(r.id) === Number(id));

    if (!regra) {
      abrirModalAviso("Erro", "Regra não encontrada");
      return;
    }

    preencherFormularioRegra(regra);

    document.getElementById("modalRegraTitulo").innerText = "Editar Regra";
    document.getElementById("btnSalvarRegra").onclick = async () => {
      salvou = true;
      await salvarRegra();
    };

    const modalEl = document.getElementById("modalRegra");
    const modal = new bootstrap.Modal(modalEl);

    modalEl.addEventListener(
      "hidden.bs.modal",
      () => {
        if (!salvou) {
          btn.disabled = false;
          btn.innerHTML = textoOriginal;
          habilitarBotaoRegra();
        }
      },
      { once: true },
    );

    modal.show();
  } catch (err) {
    habilitarBotaoRegra();
    console.error(err);
    abrirModalAviso("Erro", "Erro ao carregar regra");
  } finally {
    btn.disabled = false;
    btn.innerHTML = textoOriginal;
  }
}

/* =========================
   EXCLUIR
========================= */

function excluirRegra(id, btnTrash) {
  document.getElementById("confirmTitle").innerText = "Excluir Regra";
  document.getElementById("confirmMessage").innerText =
    "Deseja realmente excluir esta regra? A programação futura gerada por ela será removida.";

  const btnOk = document.getElementById("confirmOk");

  btnOk.onclick = async () => {
    const textoOk = btnOk.innerHTML;
    const textoTrash = btnTrash.innerHTML;

    try {
      desabilitarBotaoRegra();
      btnOk.disabled = true;
      btnTrash.disabled = true;
      btnOk.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> Excluindo`;

      const r = await regrasDatasService.excluir(id, senhaDigitada);

      if (r?.error) {
        abrirModalAviso("Aviso", r.error);
        return;
      }

      abrirModalAviso("Sucesso", "Regra excluída com sucesso!");
      await reloadRegras();

    } catch (err) {
      console.error(err);
      abrirModalAviso("Erro", "Erro ao excluir regra");
    } finally {
      habilitarBotaoRegra();
      btnOk.disabled = false;
      btnTrash.disabled = false;
      btnOk.innerHTML = textoOk;
      btnTrash.innerHTML = textoTrash;
      bootstrap.Modal.getInstance(
        document.getElementById("confirmModal"),
      ).hide();
    }
  };

  new bootstrap.Modal(document.getElementById("confirmModal")).show();
}

/* =========================
   ESTADOS DE INTERFACE
========================= */

function desabilitarBotaoRegra() {
  const btn = document.getElementById("novaRegraBtn");
  if (btn) btn.setAttribute("disabled", "");
  document
    .querySelectorAll(".editar-btn, .excluir-btn")
    .forEach((b) => b.setAttribute("disabled", ""));
}

function habilitarBotaoRegra() {
  const btn = document.getElementById("novaRegraBtn");
  if (btn) btn.removeAttribute("disabled");
  document
    .querySelectorAll(".editar-btn, .excluir-btn")
    .forEach((b) => b.removeAttribute("disabled"));
}

async function carregarProgramacao() {
  try {
    let programacao = await programacaoService.listar();

    if (programacao?.error) {
      throw new Error(programacao.error);
    }

    programacao = programacao || [];
    dataStore.programacao = programacao;
  } catch (err) {
    console.error(err);
  }
}