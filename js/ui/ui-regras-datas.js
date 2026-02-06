async function abrirTelaRegrasDatas() {
  setTitle("Admin • Regras de Datas");
  conteudo.innerHTML = Ui.PainelRegrasDatas();
  carregarRegrasDatas();
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
    const descricaoQuando = formatarQuando(r.dia_semana, r.ordinal);

    html += `
          <tr>
            <td>${nomeLocal}</td>
            <td>${r.tipo_visita}</td>
            <td>${descricaoQuando}</td>
            <td class="text-center">${formatarHorario(r.horario)}</td>
            <td class="text-center">
              ${
                r.ativo
                  ? '<span class="badge bg-success">Ativo</span>'
                  : '<span class="badge bg-secondary">Inativo</span>'
              }
            </td>
            <td class="text-center">
              <button class="btn btn-sm btn-outline-dark me-1 editar-btn"
                onclick="editarRegra(${r.id}, this)">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger excluir-btn"
                onclick="excluirRegra(${r.id}, this)">
                <i class="bi bi-trash"></i>
              </button>
            </td>
          </tr>
        `;
  });

  html += `
          </tbody>
        </table>
      </div>
    `;

  document.getElementById("listaRegrasDatas").innerHTML = html;
}

function renderCardsRegrasDatas(regras) {
  let html = `<div class="d-grid gap-3">`;

  regras.forEach((r) => {
    const local = dataStore.locais.find((l) => l.id == r.local_id);
    const nomeLocal = local ? local.nome : "Local excluído";
    const descricaoQuando = formatarQuando(r.dia_semana, r.ordinal);

    html += `
          <div class="card shadow-sm">
            <div class="modal-header bg-dark text-white rounded-top p-2">
              <h6 class="mb-0">${nomeLocal}</h6>
            </div>

            <div class="card-body">
              <p class="mb-1"><strong>Tipo:</strong> ${r.tipo_visita}</p>
              <p class="mb-1"><strong>Quando:</strong> ${descricaoQuando}</p>
              <p class="mb-1">
                <strong>Horário:</strong> ${formatarHorario(r.horario)}
              </p>

              <p class="mb-3">
                <strong>Status:</strong>
                ${
                  r.ativo
                    ? '<span class="badge bg-success">Ativo</span>'
                    : '<span class="badge bg-secondary">Inativo</span>'
                }
              </p>

              <div class="d-flex gap-2">
                <button class="btn btn-sm btn-outline-dark w-50"
                  onclick="editarRegra(${r.id}, this)">
                  <i class="bi bi-pencil"></i> Editar
                </button>

                <button class="btn btn-sm btn-outline-danger w-50"
                  onclick="excluirRegra(${r.id}, this)">
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

async function carregarRegrasDatas() {
  const lista = document.getElementById("listaRegrasDatas");

  try {
    lista.innerHTML = `
            <div class="text-center my-4">
                <div class="spinner-border text-dark"></div>
            </div>
        `;

    const data = await regrasDatasService.listar();
    const regras = data || [];

    if (!regras.length) {
      lista.innerHTML = `
                <div class="alert alert-secondary text-center">
                    Nenhuma regra cadastrada
                </div>
            `;
      return;
    }

    // Ordenar por Local e depois por Dia
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

  if (Number(ordinal) === 0) return `Todas: ${nomeDia}`;
  if (Number(ordinal) === -1) return `Última ${nomeDia}`;
  return `${ordinal}ª ${nomeDia}`;
}

function abrirModalNovaRegra() {
  document.getElementById("modalRegraTitulo").innerText = "Nova Regra";
  document.getElementById("regraId").value = "";

  // Reset fields
  document.getElementById("regraTipo").value = "";
  document.getElementById("regraDiaSemana").value = "1";
  document.getElementById("regraOrdinal").value = "0";
  document.getElementById("regraHorario").value = "";
  document.getElementById("regraAtivo").checked = true;

  // Populate Locais
  const selectLocal = document.getElementById("regraLocal");
  selectLocal.innerHTML = '<option value="">Selecione...</option>';
  dataStore.locais.forEach((l) => {
    const opt = document.createElement("option");
    opt.value = l.id;
    opt.text = l.nome;
    selectLocal.appendChild(opt);
  });

  document.getElementById("btnSalvarRegra").onclick = () => salvarRegra();
  new bootstrap.Modal(document.getElementById("modalRegra")).show();
}

async function editarRegra(id, btn) {
  const textoOriginal = btn.innerHTML;
  let salvou = false;

  try {
    desabilitarBotaoRegra();
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span>`;

    const data = await regrasDatasService.listar();
    const regra = (data || []).find((r) => Number(r.id) === Number(id));

    if (!regra) {
      abrirModalAviso("Erro", "Regra não encontrada");
      btn.disabled = false;
      btn.innerHTML = textoOriginal;
      return;
    }

    document.getElementById("modalRegraTitulo").innerText = "Editar Regra";
    document.getElementById("regraId").value = regra.id;
    document.getElementById("regraTipo").value = regra.tipo_visita;
    document.getElementById("regraDiaSemana").value = regra.dia_semana;
    document.getElementById("regraOrdinal").value = regra.ordinal;
    document.getElementById("regraHorario").value = formatarHorario(
      regra.horario,
    );
    document.getElementById("regraAtivo").checked = regra.ativo;

    // Populate Locais
    const selectLocal = document.getElementById("regraLocal");
    selectLocal.innerHTML = '<option value="">Selecione...</option>';
    dataStore.locais.forEach((l) => {
      const opt = document.createElement("option");
      opt.value = l.id;
      opt.text = l.nome;
      if (Number(l.id) === Number(regra.local_id)) opt.selected = true;
      selectLocal.appendChild(opt);
    });

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

    const btnSalvar = document.getElementById("btnSalvarRegra");
    btnSalvar.onclick = null;

    btnSalvar.onclick = async () => {
      salvou = true;
      await salvarRegra(modal, btn, textoOriginal, (action = "update"));
      habilitarBotaoRegra();
    };
    
    await appScriptApi.bootstrap();
    

    modal.show();
  } catch (err) {
    console.error(err);
    abrirModalAviso("Erro", "Erro ao carregar regra");
    btn.disabled = false;
    btn.innerHTML = textoOriginal;
  }
}

async function salvarRegra(
  modalInstance = null,
  btnEdit = null,
  txtEdit = null,
  action = "create",
) {
  if (modalInstance && typeof modalInstance.hide !== "function") {
    modalInstance = null;
  }

  const id = document.getElementById("regraId").value;
  const localId = document.getElementById("regraLocal").value;
  const tipo = document.getElementById("regraTipo").value.trim();
  const dia = document.getElementById("regraDiaSemana").value;
  const ordinal = document.getElementById("regraOrdinal").value;
  const horario = document.getElementById("regraHorario").value;
  const ativo = document.getElementById("regraAtivo").checked;

  if (!localId || !tipo || !horario) {
    abrirModalAviso("Aviso", "Preencha todos os campos obrigatórios");
    return;
  }

  const payload = {
    entity: "regras-datas",
    password: senhaDigitada,
    local_id: Number(localId),
    tipo_visita: tipo,
    dia_semana: Number(dia),
    ordinal: Number(ordinal),
    horario: String(horario),
    ativo: ativo,
  };

  const btn = document.getElementById("btnSalvarRegra");
  const textoOriginal = btn.innerHTML;

  try {
    desabilitarBotaoRegra();
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> Salvando`;

    if (!modalInstance) mostrarLoading("listaRegrasDatas");

    const data =
      action === "create"
        ? await regrasDatasService.criar(payload, senhaDigitada)
        : await regrasDatasService.atualizar({ id, ...payload }, senhaDigitada);

    if (data?.error) {
      abrirModalAviso("Erro", data.error);
      return;
    }

    if (modalInstance) {
      modalInstance.hide();
    } else {
      bootstrap.Modal.getInstance(document.getElementById("modalRegra")).hide();
    }

    await carregarRegrasDatas();

    if (btnEdit) {
      btnEdit.disabled = false;
      btnEdit.innerHTML = txtEdit;
    }
    habilitarBotaoRegra();
    appScriptApi.bootstrap();
  } catch (err) {
    habilitarBotaoRegra();
    console.error(err);
    abrirModalAviso("Erro", "Erro ao salvar regra");
  } finally {
    btn.disabled = false;
    btn.innerHTML = textoOriginal;
  }
}

async function excluirRegra(id, btnTrash) {
  const textoOriginal = btnTrash.innerHTML;

  document.getElementById("confirmTitle").innerText = "Excluir Regra";
  document.getElementById("confirmMessage").innerText =
    "Deseja realmente excluir esta regra? A programação futura gerada por ela será removida.";

  const btnOk = document.getElementById("confirmOk");
  btnOk.onclick = null;

  btnOk.onclick = async () => {
    const textoOk = btnOk.innerHTML;

    try {
      desabilitarBotaoRegra();
      btnOk.disabled = true;
      btnOk.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> Excluindo`;

      btnTrash.disabled = true;
      btnTrash.innerHTML = `<span class="spinner-border spinner-border-sm"></span>`;

      const data = await regrasDatasService.excluir(id, senhaDigitada);

      if (data?.error) {
        abrirModalAviso("Erro", data.error);
        return;
      }

      bootstrap.Modal.getInstance(
        document.getElementById("confirmModal"),
      ).hide();
      await carregarRegrasDatas();
      await appScriptApi.bootstrap();
    } catch (err) {
      console.error(err);
      abrirModalAviso("Erro", "Erro de comunicação com o servidor");
    } finally {
      habilitarBotaoRegra();
      btnOk.disabled = false;
      btnOk.innerHTML = textoOk;
      btnTrash.disabled = false;
      btnTrash.innerHTML = textoOriginal;
    }
  };

  new bootstrap.Modal(document.getElementById("confirmModal")).show();
}

function desabilitarBotaoRegra() {
  const btn = document.getElementById("novaRegraBtn");
  if (!btn.hasAttribute('disabled')) btn.setAttribute('disabled', '');

  const editBtns = document.querySelectorAll('.editar-btn');
  const deleteBtns = document.querySelectorAll('.excluir-btn');

  editBtns.forEach(btn => {
    btn.setAttribute('disabled', '');
  });

  deleteBtns.forEach(btn => {
    btn.setAttribute('disabled', '');
  });
}

function habilitarBotaoRegra() {
  const btn = document.getElementById("novaRegraBtn");
  if (btn.hasAttribute('disabled')) btn.removeAttribute('disabled');

  const editBtns = document.querySelectorAll('.editar-btn');
  const deleteBtns = document.querySelectorAll('.excluir-btn');

  editBtns.forEach(btn => {
    btn.removeAttribute('disabled');
  });

  deleteBtns.forEach(btn => {
    btn.removeAttribute('disabled');
  });
}