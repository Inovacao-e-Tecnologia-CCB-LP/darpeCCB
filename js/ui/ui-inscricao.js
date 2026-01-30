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
    obs.innerHTML = Ui.ObservacaoTrajes();

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
    conteudo.innerHTML = Ui.ConfirmarPresenca();
}