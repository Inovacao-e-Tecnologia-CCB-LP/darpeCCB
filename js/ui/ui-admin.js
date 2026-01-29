function mostrarAdmin() {
  setTitle('Área Administrativa');
  backButton.style.display = 'block';
  
  conteudo.innerHTML = `
    <div class="row g-4">

      <div class="col-md-4">
        <div class="card shadow-sm admin-card h-100 cursor-pointer" onclick="irParaCrudLocais()">
          <div class="card-body text-center">
            <i class="bi bi-geo-alt fs-1"></i>
            <h5>Locais</h5>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card shadow-sm admin-card" onclick="abrirCrudInstrumentos()">
          <div class="card-body text-center">
            <i class="bi bi-music-note-list fs-1"></i>
            <h5>Instrumentos</h5>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card shadow-sm admin-card" onclick="abrirAdminInscricoes()">
          <div class="card-body text-center">
            <i class="bi bi-journal-text fs-1"></i>
            <h5>Relatórios</h5>
          </div>
        </div>
      </div>

    </div>
  `;
}

function irParaCrudLocais() {
  navigateTo(abrirCrudLocais);
}

function irParaCrudInstrumentos() {
  navigateTo(abrirCrudInstrumentos);
}

function abrirCrudLocais() {
  setTitle('Admin • Locais');

  conteudo.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0">Locais cadastrados</h5>

      <button class="btn btn-dark btn-sm" onclick="abrirModalNovoLocal()">
        <i class="bi bi-plus-circle"></i> Novo Local
      </button>
    </div>

    <div id="listaLocais">
      <div class="text-center my-4">
        <div class="spinner-border text-dark"></div>
      </div>
    </div>
  `;

  carregarLocais();
}

async function carregarLocais() {
  const lista = document.getElementById('listaLocais');

  try {
    lista.innerHTML = `
      <div class="text-center my-4">
        <div class="spinner-border text-dark"></div>
      </div>
    `;

    const res = await fetch(`${API}?action=bootstrap`);
    const data = await res.json();

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

    locais.forEach(l => {
      html += `
        <tr>
          <td>${l.nome}</td>

          <td class="text-center">
            ${l.permite_cordas
              ? '<i class="bi bi-check-circle-fill text-success"></i>'
              : '<i class="bi bi-x-circle-fill text-danger"></i>'}
          </td>

          <td class="text-center">
            ${l.permite_sopros
              ? '<i class="bi bi-check-circle-fill text-success"></i>'
              : '<i class="bi bi-x-circle-fill text-danger"></i>'}
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

function abrirCrudInstrumentos() {
  setTitle('Admin • Instrumentos');

  // empilha navegação (voltar retorna pra área admin)
  navigateTo(renderCrudInstrumentos);
}

function renderCrudInstrumentos() {
  conteudo.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0">Instrumentos cadastrados</h5>

      <button class="btn btn-dark btn-sm" onclick="abrirModalNovoInstrumento()">
        <i class="bi bi-plus-circle"></i> Novo Instrumento
      </button>
    </div>

    <div id="listaInstrumentos">
      <div class="text-center my-4">
        <div class="spinner-border text-dark"></div>
      </div>
    </div>
  `;

  carregarInstrumentos();
}

async function carregarInstrumentos() {
  const lista = document.getElementById('listaInstrumentos');

  try {
    const res = await fetch(`${API}?action=bootstrap`);
    const data = await res.json();

    const instrumentos = data.instrumentos || [];

    if (!instrumentos.length) {
      lista.innerHTML = `
        <div class="alert alert-secondary text-center">
          Nenhum instrumento cadastrado
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
              <th class="text-center">Tipo</th>
              <th class="text-center" width="120">Ações</th>
            </tr>
          </thead>
          <tbody>
    `;

    instrumentos.forEach(i => {
      html += `
        <tr>
          <!-- NOME (coluna nome) -->
          <td>${i.nome}</td>

         
          <td class="text-center">
            <span class="badge ${i.tipo === 'corda' ? 'bg-primary' : 'bg-success'}">
              ${i.tipo}
            </span>
          </td>

          <!-- AÇÕES (coluna id) -->
          <td class="text-center">
            <button
              class="btn btn-sm btn-outline-dark me-1"
              onclick="editarInstrumento(${i.id})">
              <i class="bi bi-pencil"></i>
            </button>

            <button
              class="btn btn-sm btn-outline-danger"
              onclick="excluirInstrumento(${i.id})">
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
        Erro ao carregar instrumentos
      </div>
    `;
  }
}

async function abrirModalNovoInstrumento() {
  const nome = prompt('Nome do instrumento:');
  if (!nome) return;

  const tipo = prompt('Tipo do instrumento (corda ou sopro):');
  if (!tipo || !['corda', 'sopro'].includes(tipo.toLowerCase())) {
    alert('Tipo inválido. Use "corda" ou "sopro".');
    return;
  }

  await criarInstrumento(nome.trim(), tipo.toLowerCase());
}

async function criarInstrumento(nome, tipo) {
  const res = await fetch(API, {
    method: 'POST',
    body: JSON.stringify({
      entity: 'instrumentos',
      action: 'create',
      password: senhaDigitada,
      nome: nome,
      tipo: tipo
    })
  });

  const data = await res.json();

  if (data.error) {
    alert(data.error);
    return;
  }

  carregarInstrumentos();
}



async function editarInstrumento(id) {
  try {
    const res = await fetch(`${API}?action=bootstrap`);
    const data = await res.json();

    const instrumento = (data.instrumentos || []).find(i => i.id === id);

    if (!instrumento) {
      alert('Instrumento não encontrado');
      return;
    }

    // simples e funcional (pode virar modal depois)
    const novoNome = prompt('Nome do instrumento:', instrumento.nome);
    if (!novoNome) return;

    const novoTipo = prompt(
      'Tipo do instrumento (corda ou sopro):',
      instrumento.tipo
    );

    if (!novoTipo || !['corda', 'sopro'].includes(novoTipo.toLowerCase())) {
      alert('Tipo inválido');
      return;
    }

    await fetch(API, {
      method: 'POST',
      body: JSON.stringify({
        entity: 'instrumentos',
        action: 'update',
        id: id,
        password: senhaDigitada,
        nome: novoNome.trim(),
        tipo: novoTipo.toLowerCase()
      })
    });

    carregarInstrumentos();

  } catch (err) {
    console.error(err);
    alert('Erro ao editar instrumento');
  }
}


function excluirInstrumento(id) {
  document.getElementById('confirmTitle').innerText = 'Excluir Instrumento';
  document.getElementById('confirmMessage').innerText =
    'Deseja realmente excluir este instrumento?';

  const btnOk = document.getElementById('confirmOk');

  // remove handlers antigos
  btnOk.onclick = null;

  btnOk.onclick = async () => {
    const textoOriginal = btnOk.innerHTML;

    try {
      btnOk.disabled = true;
      btnOk.innerHTML = `
        <span class="spinner-border spinner-border-sm"></span> Excluindo
      `;

      const response = await fetch(API, {
        method: 'POST',
        headers: {
          // ✅ Apps Script
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          entity: 'instrumentos',
          action: 'delete',
          id: id,
          password: senhaDigitada, // 🔑 valida no back
        }),
      });

      const data = await response.json();

      // ❌ erro vindo do back
      if (data.error) {
        alert(`❌ ${data.error}`);
        return;
      }

      // ✅ sucesso
      if (data.success === true) {
        bootstrap.Modal.getInstance(
          document.getElementById('confirmModal')
        ).hide();

        carregarInstrumentos();
      }

    } catch (err) {
      console.error(err);
      alert('Erro de comunicação com o servidor');

    } finally {
      btnOk.disabled = false;
      btnOk.innerHTML = textoOriginal;
    }
  };

  new bootstrap.Modal(
    document.getElementById('confirmModal')
  ).show();
}