function setTitle(text) {
    document.getElementById('titulo').innerText = text;
}

function showMenuInicial() {
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
    g.className = 'd-grid gap-2 col-md-8 mx-auto';

    dataStore.programacao
        .filter(p => p.local_id == escolha.local.id)
        .forEach(p => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-outline-dark btn-lg';
            btn.innerHTML = `${p.tipo_visita} - ${formatarData(p.data)} – ${p.descricao} (${p.horario})`;
            btn.onclick = () => selecionarData(p);
            g.appendChild(btn);
        });

    conteudo.innerHTML = '';
    conteudo.appendChild(g);
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
                        placeholder="Digite seu nome completo">
                </div>
                <div class="d-grid">
                    <button class="btn btn-dark btn-lg" onclick="salvar()">
                        Confirmar
                    </button>
                </div>
            </div>
        </div>`;
}

async function showInscritos() {
    setTitle('Visualizar Inscrições');
    conteudo.innerHTML = `
        <div class="spinner-border text-dark" role="status">
            <span class="visually-hidden">Carregando...</span>
        </div>`;

    try {
        const inscritos = await fetch(`${API}?action=inscricoes`).then(r => r.json());

        const progMap = {};
        dataStore.programacao.forEach(p => progMap[p.id] = p);

        const grupos = {};
        inscritos.forEach(i => {
            if (!grupos[i.local]) grupos[i.local] = {};
            if (!grupos[i.local][i.programacao_id]) {
                grupos[i.local][i.programacao_id] = [];
            }
            grupos[i.local][i.programacao_id].push(i);
        });

        let html = '<div class="accordion" id="accordionInscritos">';
        let index = 0;

        for (const local in grupos) {
            html += `
            <div class="accordion-item border-dark">
                <h2 class="accordion-header" id="heading-${index}">
                    <button class="accordion-button collapsed bg-dark text-white" type="button"
                        data-bs-toggle="collapse" data-bs-target="#collapse-${index}"
                        aria-expanded="false" aria-controls="collapse-${index}">
                        ${local}
                    </button>
                </h2>
                <div id="collapse-${index}" class="accordion-collapse collapse"
                    aria-labelledby="heading-${index}" data-bs-parent="#accordionInscritos">
                    <div class="accordion-body bg-light">`;

            for (const pid in grupos[local]) {
                const p = progMap[pid];
                if (p) {
                    html += `
                        <div class="card mb-3 border-dark">
                            <div class="card-header bg-dark text-white">
                                <b>${p.tipo_visita} - ${formatarData(p.data)} – ${p.descricao} (${p.horario})</b>
                            </div>
                            <ul class="list-group list-group-flush">
                                ${grupos[local][pid]
                            .map(i => `
                                        <li class="list-group-item">
                                            ${i.nome}
                                            <span class="text-muted">(${i.instrumento})</span>
                                        </li>`)
                            .join('')}
                            </ul>
                        </div>`;
                }
            }

            html += `</div></div></div>`;
            index++;
        }

        html += '</div>';
        conteudo.innerHTML = html;

    } catch (error) {
        console.error('Error fetching inscriptions:', error);
        conteudo.innerHTML = `
            <div class="alert alert-dark text-center">
                ❌ Erro ao carregar as inscrições.
            </div>`;
    }
}
