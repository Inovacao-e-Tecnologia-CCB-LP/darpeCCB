/* =========================
   UI • LOCAIS
========================= */

async function abrirTelaLocais() {
  setTitle("Admin • Locais");
  conteudo.innerHTML = Ui.PainelLocais();
  carregarLocais();
}

/* =========================
   LISTAGEM
========================= */

async function carregarLocais() {
  const lista = document.getElementById("listaLocais");

  try {
    mostrarLoading("listaLocais");

    let locais = await locaisService.listar();

    if (locais?.error) {
      throw new Error(locais.error);
    }

    locais = locais || [];
    dataStore.locais = locais;

    if (!locais.length) {
      lista.innerHTML = `
        <div class="alert alert-secondary text-center">
          Nenhum local cadastrado
        </div>
      `;
      return;
    }

    if (isMobile()) {
      renderCardsLocais(locais);
    } else {
      renderTabelaLocais(locais);
    }
  } catch (err) {
    console.error(err);
    lista.innerHTML = `
      <div class="alert alert-danger text-center">
        Erro ao carregar locais
      </div>
    `;
  }
}

function renderTabelaLocais(locais) {
  let html = `
    <div class="table-responsive rounded shadow-sm overflow-hidden">
      <table class="table table-bordered align-middle mb-0">
        <thead class="table-dark">
          <tr>
            <th>Nome</th>
            <th class="text-center">Endereço</th>
            <th class="text-center">Cordas</th>
            <th class="text-center">Sopros</th>
            <th class="text-center">Limite</th>
            <th class="text-center" width="120">Ações</th>
          </tr>
        </thead>
        <tbody>
  `;

  locais.forEach((l) => {
    html += `
  <tr>
    <td>${l.nome}</td>

    <td>
      <span
        class="d-inline-block text-truncate"
        style="max-width: 280px"
        title="${l.endereco || ""}"
      >
        ${l.endereco || "-"}
      </span>
    </td>

    <td class="text-center">
      ${
        l.permite_cordas
          ? '<i class="bi bi-check-circle-fill text-success"></i>'
          : '<i class="bi bi-x-circle-fill text-danger"></i>'
      }
    </td>

    <td class="text-center">
      ${
        l.permite_sopros
          ? '<i class="bi bi-check-circle-fill text-success"></i>'
          : '<i class="bi bi-x-circle-fill text-danger"></i>'
      }
    </td>

    <td class="text-center">${l.limite}</td>

    <td class="text-center">
      <button class="btn btn-sm btn-outline-dark me-1 editar-btn"
        onclick="editarLocal(${l.id}, this)">
        <i class="bi bi-pencil"></i>
      </button>
      <button class="btn btn-sm btn-outline-danger excluir-btn"
        onclick="excluirLocal(${l.id}, this)">
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

  document.getElementById("listaLocais").innerHTML = html;
}

function renderCardsLocais(locais) {
  let html = `<div class="d-grid gap-3">`;

  locais.forEach((l) => {
    html += `
      <div class="card shadow-sm">
        <div class="modal-header bg-dark text-white rounded-top p-2">
          <h5 class="card-title mt-0 mb-0">${l.nome}</h5>
        </div>
        <div class="card-body">

          <p class="mb-2 text-muted">
            <i class="bi bi-geo-alt"></i>
            ${l.endereco || "-"}
          </p>

          <div class="d-flex justify-content-between mb-2">
            <span>
              Cordas:
              ${
                l.permite_cordas
                  ? '<i class="bi bi-check-circle-fill text-success"></i>'
                  : '<i class="bi bi-x-circle-fill text-danger"></i>'
              }
            </span>

            <span>
              Sopros:
              ${
                l.permite_sopros
                  ? '<i class="bi bi-check-circle-fill text-success"></i>'
                  : '<i class="bi bi-x-circle-fill text-danger"></i>'
              }
            </span>
          </div>

          <p class="mb-3">
            <strong>Limite:</strong> ${l.limite}
          </p>

          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-outline-dark w-50"
              onclick="editarLocal(${l.id}, this)">
              <i class="bi bi-pencil"></i> Editar
            </button>

            <button class="btn btn-sm btn-outline-danger w-50"
              onclick="excluirLocal(${l.id}, this)">
              <i class="bi bi-trash"></i> Excluir
            </button>
          </div>
        </div>
      </div>
    `;
  });

  html += `</div>`;

  document.getElementById("listaLocais").innerHTML = html;
}

/* =========================
   HELPERS
========================= */

function montarPayloadLocal() {
  const id = document.getElementById("localId").value;
  const nome = document.getElementById("localNome").value.trim();
  const limite = document.getElementById("localLimite").value;
  const endereco = document.getElementById("localEndereco").value.trim();

  const permiteCordas = document.querySelector(
    'input[name="permiteCordas"]:checked',
  )?.value;

  const permiteSopros = document.querySelector(
    'input[name="permiteSopros"]:checked',
  )?.value;

  if (
    !nome ||
    !limite ||
    !endereco ||
    permiteCordas === undefined ||
    permiteSopros === undefined
  ) {
    abrirModalAviso("Aviso", "Preencha corretamente todos os campos");
    return null;
  }

  return {
    id: id ? Number(id) : null,
    nome,
    limite,
    endereco,
    permite_cordas: permiteCordas,
    permite_sopros: permiteSopros,
  };
}

function preencherFormularioLocal(local) {
  document.getElementById("localId").value = local.id;
  document.getElementById("localNome").value = local.nome;
  document.getElementById("localLimite").value = local.limite;
  document.getElementById("localEndereco").value = local.endereco || "";

  document.querySelector(
    `input[name="permiteCordas"][value="${local.permite_cordas}"]`,
  ).checked = true;

  document.querySelector(
    `input[name="permiteSopros"][value="${local.permite_sopros}"]`,
  ).checked = true;
}

async function reloadLocais() {
  mostrarLoading("listaLocais");
  await carregarLocais();
}

/* =========================
   MODAL • NOVO / EDITAR
========================= */

function abrirModalNovoLocal() {
  document.getElementById("modalLocalTitulo").innerText = "Novo Local";
  limparFormularioLocal();
  document.getElementById("btnSalvarLocal").onclick = salvarLocal;
  new bootstrap.Modal(document.getElementById("modalLocal")).show();
}

function limparFormularioLocal() {
  document.getElementById("localId").value = "";
  document.getElementById("localNome").value = "";
  document.getElementById("localLimite").value = "";
  document.getElementById("localEndereco").value = "";

  document
    .querySelectorAll(
      'input[name="permiteCordas"], input[name="permiteSopros"]',
    )
    .forEach((r) => (r.checked = false));
}

/* =========================
   SALVAR
========================= */

async function salvarLocal() {
  const payload = montarPayloadLocal();
  if (!payload) return;

  if (payload.nome.trim() !== '' && !isNaN(payload.nome)) return abrirModalAviso("Erro", "Nome do local não pode ser vazio ou um número");

  const btn = document.getElementById("btnSalvarLocal");
  const textoOriginal = btn.innerHTML;

  try {
    desabilitarBotaoLocal();
    btn.disabled = true;
    btn.innerHTML = `
      <span class="spinner-border spinner-border-sm"></span> Salvando
    `;

    let r;

    if (payload.id) {
      r = await locaisService.atualizar(payload, senhaDigitada);
    } else {
      r = await locaisService.criar(payload, senhaDigitada);
    }

    if (r?.error) {
      abrirModalAviso("Aviso", r.error);
      return;
    }

    bootstrap.Modal.getInstance(document.getElementById("modalLocal")).hide();

    mostrarLoading("listaLocais");
    await reloadLocais();

    const mensagemSucesso = payload.id
      ? "Local editado com sucesso!"
      : "Local criado com sucesso!";

    abrirModalAviso("Sucesso", mensagemSucesso);
  } catch (err) {
    console.error(err);
    abrirModalAviso("Erro", "Erro ao salvar local");
  } finally {
    habilitarBotaoLocal();
    btn.disabled = false;
    btn.innerHTML = textoOriginal;
  }
}

/* =========================
   EDITAR
========================= */

async function editarLocal(id, btn) {
  let salvou = false;
  const textoOriginal = btn.innerHTML;

  try {
    desabilitarBotaoLocal();
    btn.disabled = true;
    btn.innerHTML = `
      <span class="spinner-border spinner-border-sm"></span>
    `;

    const locais = await locaisService.listar();
    const local = (locais || []).find((l) => Number(l.id) === Number(id));

    if (!local) {
      abrirModalAviso("Erro", "Local não encontrado");
      return;
    }

    preencherFormularioLocal(local);

    document.getElementById("modalLocalTitulo").innerText = "Editar Local";
    document.getElementById("btnSalvarLocal").onclick = async () => {
      salvou = true
      await salvarLocal();
    };

    const modalEl = document.getElementById("modalLocal");
    const modal = new bootstrap.Modal(modalEl);

    modalEl.addEventListener(
      "hidden.bs.modal",
      () => {
        if (!salvou) {
          btn.disabled = false;
          btn.innerHTML = textoOriginal;
          habilitarBotaoLocal();
        }
      },
      { once: true },
    );
    modal.show();
  } catch (err) {
    habilitarBotaoLocal();
    console.error(err);
    abrirModalAviso("Erro", "Erro ao carregar local");
  } finally {
    btn.disabled = false;
    btn.innerHTML = textoOriginal;
  }
}

/* =========================
   EXCLUIR
========================= */

function excluirLocal(id, btnTrash) {
  document.getElementById("confirmTitle").innerText = "Excluir Local";
  document.getElementById("confirmMessage").innerText =
    "Deseja realmente excluir este local?";

  const btnOk = document.getElementById("confirmOk");

  btnOk.onclick = async () => {
    const textoOk = btnOk.innerHTML;
    const textoTrash = btnTrash.innerHTML;

    try {
      desabilitarBotaoLocal();
      btnOk.disabled = true;
      btnTrash.disabled = true;
      btnOk.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2"></span>
        Excluindo
      `;

      const r = await locaisService.excluir(id, senhaDigitada);

      if (r?.error) {
        abrirModalAviso("Aviso", r.error);
        return;
      }

      mostrarLoading("listaLocais");

      await reloadLocais();

      abrirModalAviso("Sucesso", "Local excluído com sucesso!");
    } catch (err) {
      console.error(err);
      abrirModalAviso("Erro", "Erro ao excluir local");
    } finally {
      habilitarBotaoLocal();
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

function desabilitarBotaoLocal() {
  const btn = document.getElementById("novoLocalBtn");
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

function habilitarBotaoLocal() {
  const btn = document.getElementById("novoLocalBtn");
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