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