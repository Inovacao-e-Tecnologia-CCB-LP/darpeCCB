async function mostrarAdmin() {
  setTitle("Área Administrativa");
  backButton.style.display = "block";
  conteudo.innerHTML = await getComponent('painel-admin');
}

function irParaCrudLocais() {
  navigateTo(abrirCrudLocais);
}

function irParaCrudInstrumentos() {
  navigateTo(abrirCrudInstrumentos);
}

async function abrirCrudLocais() {
  setTitle("Admin • Locais");
  conteudo.innerHTML = await getComponent('painel-locais');
  carregarLocais();
}

async function carregarLocais() {
  const lista = document.getElementById("listaLocais");

  try {
    lista.innerHTML = `
      <div class="text-center my-4">
        <div class="spinner-border text-dark"></div>
      </div>
    `;

    const data = await appScriptApi.bootstrap()

    const locais = data.locais || [];

    if (!locais.length) {
      lista.innerHTML = `
        <div class="alert alert-secondary text-center">
          Nenhum local cadastrado
        </div>
      `;
      return;
    }

    let html = `
      <div class="table-responsive rounded shadow-sm overflow-hidden">
        <table class="table table-bordered align-middle mb-0">
          <thead class="table-dark">
            <tr>
              <th>Nome</th>
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
            <button class="btn btn-sm btn-outline-dark me-1"
              onclick="editarLocal(${l.id})">
              <i class="bi bi-pencil"></i>
            </button>

            <button class="btn btn-sm btn-outline-danger"
              onclick="excluirLocal(${l.id})">
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
  } catch (err) {
    console.error(err);
    lista.innerHTML = `
      <div class="alert alert-danger text-center">
        Erro ao carregar locais
      </div>
    `;
  }
}

function mostrarLoading(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;

  el.innerHTML = `
    <div class="text-center my-4">
      <div class="spinner-border text-dark"></div>
    </div>
  `;
}

function getTipoRadioSelecionado() {
  const radio = document.querySelector('input[name="instrumentoTipo"]:checked');
  return radio ? radio.value : "";
}

function marcarTipoRadio(tipo) {
  const radio = document.querySelector(
    `input[name="instrumentoTipo"][value="${tipo}"]`,
  );
  if (radio) radio.checked = true;
}
