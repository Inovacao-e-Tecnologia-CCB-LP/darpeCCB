

function setTitle(text) {
    document.getElementById('titulo').innerText = text;
}

function showMenuInicial() {
    mostrarBotaoAdmin()
    setTitle('DARPE - Lençóis Paulista');
    conteudo.innerHTML = `
        <div class="text-center mb-4">
            <img src="logo-ccb-light.png" alt="CCB Logo" style="max-width: 200px;">
        </div>
        <h2 class="h4 mb-4">Escolha uma das opções abaixo para continuar:</h2>
        <div class="d-grid gap-2 col-md-6 mx-auto">
            <button class="btn btn-dark btn-lg" onclick="navigateTo(showEscolherLocal)">
                Confirmar presença
            </button>
            <button class="btn btn-outline-dark btn-lg" onclick="verInscritos()">
                Visualizar inscrições
            </button>
        </div>`;
}

const adminButton = document.getElementById('adminButton');

function esconderBotaoAdmin() {
    adminButton.style.display = 'none';
    backButton.style.display = 'none'
}

function mostrarBotaoAdmin() {

    adminButton.style.display = 'inline-block';
}

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

/* ================= ESCOLHAS ================= */

function showEscolherLocal() {
    setTitle(' Escolha o local');
    const g = document.createElement('div');
    g.className = 'd-grid gap-2 col-md-6 mx-auto';

    dataStore.locais.forEach(l => {
        const btn = document.createElement('button');
        btn.className = 'btn btn-outline-dark btn-lg';
        btn.textContent = l.nome;
        btn.onclick = () => selecionarLocal(l);
        g.appendChild(btn);
    });

    conteudo.innerHTML = '';
    conteudo.appendChild(g);
}

function showEscolherData() {
    setTitle(' Escolha a data');

    const g = document.createElement('div');
    g.className = 'd-grid gap-2 col-md-8 mx-auto mb-4';

    dataStore.programacao
        .filter(p => p.local_id == escolha.local.id)
        .forEach(p => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-outline-dark btn-lg';
            btn.innerHTML = `${p.tipo_visita} - ${formatarData(p.data)} – ${p.descricao} (${p.horario})`;
            btn.onclick = () => selecionarData(p);
            g.appendChild(btn);
        });

    const obs = document.createElement('div');
    obs.className = 'col-md-8 mx-auto';
    obs.innerHTML = `
        <div class="alert alert-light border rounded">
            <h6 class="mb-3 text-center fw-bold">
                <i class="bi bi-info-circle me-1"></i> Trajes
            </h6>
            <div class="d-flex align-items-center mb-2">
                <i class="bi bi-book fs-4 me-2"></i>
                <span><strong>Evangelização:</strong> Terno</span>
            </div>
            <div class="d-flex align-items-center">
                <i class="bi bi-music-note-beamed fs-4 me-2"></i>
                <span><strong>Música:</strong> Camisa branca, calça preta</span>
            </div>
        </div>`;

    conteudo.innerHTML = '';
    conteudo.appendChild(g);
    conteudo.appendChild(obs);
}

function showEscolherInstrumento() {
    setTitle(' Escolha o instrumento');
    const g = document.createElement('div');
    g.className = 'd-grid gap-2 col-md-6 mx-auto';

    dataStore.instrumentos.forEach(i => {
        if (
            (i.tipo === 'corda' && escolha.local.permite_cordas) ||
            (i.tipo === 'sopro' && escolha.local.permite_sopros)
        ) {
            const btn = document.createElement('button');
            btn.className = 'btn btn-outline-dark btn-lg';
            btn.textContent = i.nome;
            btn.onclick = () => selecionarInstrumento(i.nome);
            g.appendChild(btn);
        }
    });

    conteudo.innerHTML = '';
    conteudo.appendChild(g);
}

function showConfirmar() {
    setTitle(' Confirmar presença');
    conteudo.innerHTML = `
        <div class="row justify-content-center">
            <div class="col-md-6">
                <div class="mb-3">
                    <input 
                        id="nome" 
                        type="text" 
                        class="form-control form-control-lg" 
                        placeholder="Nome e Sobrenome">
                </div>
                <div class="d-grid">
                    <button 
                        id="btnConfirmar"
                        class="btn btn-dark btn-lg"
                        onclick="salvar()">
                        Confirmar
                    </button>
                </div>
            </div>
        </div>`;
}

/* ================= INSCRITOS (COM EXCLUSÃO) ================= */

async function showInscritos() {
    setTitle('Visualizar Inscrições');
    
    conteudo.innerHTML = `
        <div class="spinner-border text-dark" role="status">
            <span class="visually-hidden">Carregando...</span>
        </div>`;

    abortController = new AbortController();
    const signal = abortController.signal;

    try {
        const inscritos = await fetch(`${API}?action=inscricoes`, { signal }).then(r => r.json());

        const progMap = {};
        dataStore.programacao.forEach(p => progMap[p.id] = p);

        const grupos = {};
        inscritos.forEach(i => {
            if (!grupos[i.local]) grupos[i.local] = {};
            if (!grupos[i.local][i.programacao_id]) grupos[i.local][i.programacao_id] = [];
            grupos[i.local][i.programacao_id].push(i);
        });

        let html = '<div class="accordion" id="accordionInscritos">';
        let index = 0;

        for (const local in grupos) {
            html += `
            <div class="accordion-item border-dark">
                <h2 class="accordion-header" id="heading-${index}">
                    <button class="accordion-button collapsed bg-dark text-white"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapse-${index}">
                        ${local}
                    </button>
                </h2>
                <div id="collapse-${index}" class="accordion-collapse collapse"
                    data-bs-parent="#accordionInscritos">
                    <div class="accordion-body bg-light">`;

            for (const pid in grupos[local]) {
                const p = progMap[pid];
                if (!p) continue;

                html += `
                <div class="card mb-3 border-dark">
                    <div class="card-header bg-dark text-white">
                        <b>${p.tipo_visita} - ${formatarData(p.data)} – ${p.descricao} (${p.horario})</b>
                    </div>
                    <ul class="list-group list-group-flush">`;

                grupos[local][pid].forEach(i => {
                    const auth = podeDeletar(i.id);
                    html += `
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            <span>
                                ${i.nome}
                                <span class="text-muted">(${i.instrumento})</span>
                            </span>
                            ${auth ? `
                                <button class="btn btn-sm btn-outline-danger"
                                    onclick="excluirInscricao(${i.id}, this)">
                                                            <i class="bi bi-trash"></i></button>` : ''}
                        </li>`;
                });

                html += `
                    </ul>
                </div>`;
            }

            html += `</div></div></div>`;
            index++;
        }

        html += '</div>';
        conteudo.innerHTML = html;

    } catch (error) {
        if (error.name === 'AbortError') return;

        console.error(error);
        conteudo.innerHTML = `
            <div class="alert alert-dark text-center">
                ❌ Erro ao carregar as inscrições.
            </div>`;
    }
}
