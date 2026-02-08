/* =========================
   UI • INSTRUMENTOS
========================= */

function abrirTelaInstrumentos() {
  setTitle("Admin • Instrumentos");
  conteudo.innerHTML = Ui.PainelInstrumentos();
  carregarInstrumentos((firstTime = true));
}

/* =========================
   LISTAGEM
========================= */

async function carregarInstrumentos(firstTime = false) {
  const lista = document.getElementById("listaInstrumentos");

  try {
    mostrarLoading("listaInstrumentos");

    let instrumentos = firstTime
      ? dataStore.instrumentos
      : await instrumentosService.listar();

    if (instrumentos?.error) {
      throw new Error(instrumentos.error);
    }

    instrumentos = instrumentos || [];
    dataStore.instrumentos = instrumentos;

    if (!instrumentos.length) {
      lista.innerHTML = `
        <div class="alert alert-secondary text-center">
          Nenhum instrumento cadastrado
        </div>
      `;
      return;
    }

    // 🔥 ORDENAÇÃO:
    // 1️⃣ Corda primeiro
    // 2️⃣ Sopro depois
    // 3️⃣ Ordem alfabética
    instrumentos.sort((a, b) => {
      if (a.tipo !== b.tipo) {
        return a.tipo === "corda" ? -1 : 1;
      }
      return a.nome.localeCompare(b.nome, "pt-BR");
    });

    renderTabelaInstrumentos(instrumentos);
  } catch (err) {
    console.error(err);
    lista.innerHTML = `
      <div class="alert alert-danger text-center">
        Erro ao carregar instrumentos
      </div>
    `;
  }
}

function renderTabelaInstrumentos(instrumentos) {
  const lista = document.getElementById("listaInstrumentos");

  let html = `
    <div class="table-responsive rounded shadow-sm overflow-hidden">
      <table class="table table-bordered align-middle mb-0">
        <thead class="table-dark">
          <tr>
            <th>Nome</th>
            <th class="text-center">Tipo</th>
            <th class="text-center" width="120">Ações</th>
          </tr>
        </thead>
        <tbody>
  `;

  instrumentos.forEach((i) => {
    const tipoFormatado =
      i.tipo.charAt(0).toUpperCase() + i.tipo.slice(1) + "s";

    html += `
      <tr>
        <td>${i.nome}</td>
        <td class="text-center">
          <span class="badge ${
            i.tipo === "corda" ? "bg-primary" : "bg-success"
          }">
            ${tipoFormatado}
          </span>
        </td>
        <td class="text-center">
          <button
            class="btn btn-sm btn-outline-dark me-1 editar-btn"
            onclick="editarInstrumento(${i.id}, this)">
            <i class="bi bi-pencil"></i>
          </button>

          <button
            class="btn btn-sm btn-outline-danger excluir-btn"
            onclick="excluirInstrumento(${i.id}, this)">
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

  lista.innerHTML = html;
}

async function renderCrudInstrumentos() {
  conteudo.innerHTML = Ui.PainelInstrumentos();
  carregarInstrumentos();
}

/* =========================
   HELPERS
========================= */

function montarPayloadInstrumento() {
  const id = document.getElementById("instrumentoId").value;
  const nome = document.getElementById("instrumentoNome").value.trim();

  const tipo = document.querySelector(
    'input[name="instrumentoTipo"]:checked',
  )?.value;

  if (!nome || !tipo) {
    mostrarErroCampo(
      "erroValidacaoCamposInstrumento",
      "Preencha todos os campos corretamente",
    );
    return null;
  }

  return {
    id: id ? Number(id) : null,
    nome,
    tipo,
  };
}

function preencherFormularioInstrumento(instrumento) {
  document.getElementById("instrumentoId").value = instrumento.id ?? "";
  document.getElementById("instrumentoNome").value = instrumento.nome ?? "";

  document
    .querySelectorAll('input[name="instrumentoTipo"]')
    .forEach((r) => (r.checked = false));

  if (instrumento.tipo) {
    const radio = document.querySelector(
      `input[name="instrumentoTipo"][value="${instrumento.tipo}"]`,
    );

    if (radio) radio.checked = true;
  }
}

async function reloadInstrumentos() {
  mostrarLoading("listaInstrumentos");
  carregarInstrumentos();
}

/* =========================
   MODAL • NOVO / EDITAR
========================= */

function abrirModalNovoInstrumento() {
  limparErrosCamposInstrumento();

  document.getElementById("modalInstrumentoTitulo").innerText =
    "Novo Instrumento";

  document.getElementById("instrumentoId").value = "";
  document.getElementById("instrumentoNome").value = "";

  document
    .querySelectorAll('input[name="instrumentoTipo"]')
    .forEach((r) => (r.checked = false));

  document.getElementById("btnSalvarInstrumento").onclick = salvarInstrumento;

  new bootstrap.Modal(document.getElementById("modalInstrumento")).show();
}

/* =========================
   SALVAR
========================= */

async function salvarInstrumento() {
  limparErrosCamposInstrumento();

  const btn = document.getElementById("btnSalvarInstrumento");
  const textoOriginal = btn.innerHTML;

  const payload = montarPayloadInstrumento();
  if (!payload) {
    btn.disabled = false;
    btn.innerHTML = textoOriginal;
    habilitarBotaoInstrumentos();
    return;
  }

  try {
    desabilitarBotaoInstrumentos();
    btn.disabled = true;
    btn.innerHTML = `
      <span class="spinner-border spinner-border-sm"></span> Salvando
    `;

    let r;

    if (payload.id) {
      r = await instrumentosService.atualizar(payload, senhaDigitada);
    } else {
      r = await instrumentosService.criar(payload, senhaDigitada);
    }

    if (r?.error) {
      limparErrosCamposInstrumento();
      mostrarErroCampo("erroInstrumentoNome", r.error);
      habilitarBotaoInstrumentos();
      return;
    }

    bootstrap.Modal.getInstance(
      document.getElementById("modalInstrumento"),
    ).hide();

    mostrarLoading("listaInstrumentos");

    abrirModalAviso("Sucesso", "Instrumento salvo com sucesso!");
    await reloadInstrumentos();
  } catch (err) {
    console.error(err);
    abrirModalAviso("Erro", "Erro ao salvar instrumento");
  } finally {
    habilitarBotaoInstrumentos();
    btn.disabled = false;
    btn.innerHTML = textoOriginal;
  }
}

/* =========================
   EDITAR
========================= */

async function editarInstrumento(id, btn) {
  limparErrosCamposInstrumento();

  const textoOriginal = btn.innerHTML;
  let salvou = false;

  try {
    desabilitarBotaoInstrumentos();
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span>`;

    const instrumentos = await instrumentosService.listar();
    const instrumento = (instrumentos || []).find(
      (i) => Number(i.id) === Number(id),
    );

    if (!instrumento) {
      abrirModalAviso("Erro", "Instrumento não encontrado");
      return;
    }

    preencherFormularioInstrumento(instrumento);

    document.getElementById("modalInstrumentoTitulo").innerText =
      "Editar Instrumento";

    const modalEl = document.getElementById("modalInstrumento");
    const modal = new bootstrap.Modal(modalEl);

    modalEl.addEventListener(
      "hidden.bs.modal",
      () => {
        if (!salvou) {
          btn.disabled = false;
          btn.innerHTML = textoOriginal;
          habilitarBotaoInstrumentos();
        }
      },
      { once: true },
    );

    const btnSalvar = document.getElementById("btnSalvarInstrumento");
    btnSalvar.onclick = async () => {
      limparErrosCamposInstrumento();

      const payload = montarPayloadInstrumento();
      if (!payload) {
        btn.disabled = false;
        btn.innerHTML = textoOriginal;
        habilitarBotaoInstrumentos();
        return;
      }

      const textoSalvar = btnSalvar.innerHTML;

      try {
        salvou = true;
        desabilitarBotaoInstrumentos();

        btnSalvar.disabled = true;
        btnSalvar.innerHTML = `
          <span class="spinner-border spinner-border-sm me-2"></span>
          Salvando
        `;

        const r = await instrumentosService.atualizar(payload, senhaDigitada);

        if (r?.error) {
          limparErrosCamposInstrumento();
          mostrarErroCampo("erroInstrumentoNome", r.error);
          habilitarBotaoInstrumentos();
          salvou = false;
          return;
        }

        modal.hide();

        mostrarLoading("listaInstrumentos");
        abrirModalAviso("Sucesso", "Instrumento editado com sucesso!");
        await reloadInstrumentos();

        btn.disabled = false;
        btn.innerHTML = textoOriginal;
      } catch (err) {
        console.error(err);
        abrirModalAviso("Erro", "Erro ao editar instrumento");
        salvou = false;
      } finally {
        habilitarBotaoInstrumentos();
        btnSalvar.disabled = false;
        btnSalvar.innerHTML = textoSalvar;
      }
    };

    modal.show();
  } catch (err) {
    console.error(err);
    abrirModalAviso("Erro", "Erro ao carregar instrumento");
  } finally {
    btn.disabled = false;
    btn.innerHTML = textoOriginal;
  }
}

/* =========================
   EXCLUIR
========================= */

function excluirInstrumento(id, btnTrash) {
  document.getElementById("confirmTitle").innerText = "Excluir Instrumento";
  document.getElementById("confirmMessage").innerText =
    "Deseja realmente excluir este instrumento?";

  const btnOk = document.getElementById("confirmOk");
  btnOk.onclick = null;

  btnOk.onclick = async () => {
    const textoOk = btnOk.innerHTML;
    const textoTrash = btnTrash.innerHTML;

    try {
      desabilitarBotaoInstrumentos();
      btnOk.disabled = true;
      btnOk.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2"></span>
        Excluindo
      `;

      btnTrash.disabled = true;
      btnTrash.innerHTML = `
        <span class="spinner-border spinner-border-sm"></span>
      `;

      const r = await instrumentosService.excluir(id, senhaDigitada);

      if (r?.error) {
        abrirModalAviso("Aviso", r.error);
        return;
      }

      mostrarLoading("listaInstrumentos");

      abrirModalAviso("Sucesso", "Instrumento excluído com sucesso!");
      await reloadInstrumentos();
    } catch (err) {
      console.error(err);
      abrirModalAviso("Não foi possível excluir", err.message);
    } finally {
      btnOk.disabled = false;
      btnOk.innerHTML = textoOk;
      habilitarBotaoInstrumentos();
      btnTrash.disabled = false;
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

function desabilitarBotaoInstrumentos() {
  const btn = document.getElementById("novoInstrumentoBtn");
  if (!btn.hasAttribute("disabled")) btn.setAttribute("disabled", "");
  backButton.setAttribute("disabled", "");

  const editBtns = document.querySelectorAll(".editar-btn");
  const deleteBtns = document.querySelectorAll(".excluir-btn");

  editBtns.forEach((btn) => {
    btn.setAttribute("disabled", "");
  });

  deleteBtns.forEach((btn) => {
    btn.setAttribute("disabled", "");
  });
}

function habilitarBotaoInstrumentos() {
  const btn = document.getElementById("novoInstrumentoBtn");
  if (btn.hasAttribute("disabled")) btn.removeAttribute("disabled");
  backButton.removeAttribute("disabled");

  const editBtns = document.querySelectorAll(".editar-btn");
  const deleteBtns = document.querySelectorAll(".excluir-btn");

  editBtns.forEach((btn) => {
    btn.removeAttribute("disabled");
  });

  deleteBtns.forEach((btn) => {
    btn.removeAttribute("disabled");
  });
}

function limparErrosCamposInstrumento() {
  limparErroCampo("erroInstrumentoNome");
  limparErroCampo("erroValidacaoCamposInstrumento");
}
