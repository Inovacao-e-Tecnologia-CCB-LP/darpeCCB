let inscritos;

async function showInscritos() {
    setTitle('Visualizar Inscrições');

    conteudo.innerHTML = `
        <div class="spinner-border text-dark" role="status">
            <span class="visually-hidden">Carregando...</span>
        </div>`;

    abortController = new AbortController();
    const signal = abortController.signal;

    try {
        inscritos = await appScriptApi.action({ action: 'view', entity: 'inscricoes' });

        const progMap = {};
        dataStore.programacao.forEach(p => progMap[p.id] = p);

        const grupos = {};
        inscritos.forEach(i => {
            if (!i.local) return;
            if (!grupos[i.local]) grupos[i.local] = {};
            if (!grupos[i.local][i.programacao_id]) grupos[i.local][i.programacao_id] = [];
            grupos[i.local][i.programacao_id].push(i);
        });

        let html = '<div class="accordion" id="accordionInscritos">';
        let index = 0;

        for (const local in grupos) {
            // Verifica se existe alguma programação válida para este local
            const temProg = Object.keys(grupos[local]).some(pid => progMap[pid]);
            if (!temProg) continue;

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
                    <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                        <b>${p.tipo_visita} - ${formatarData(p.data)} – ${p.descricao} (${p.horario})</b>
                        <button type="button" class="btn btn-success" onclick="compartilhar(${pid}, '${local}')">
                            <i class="bi bi-whatsapp"></i>
                        </button>
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

async function compartilhar(pid, local) {
    const progMap = {};
    dataStore.programacao.forEach(p => progMap[p.id] = p);

    const p = progMap[pid];

    const grupos = {};
    inscritos.forEach(i => {
        if (!i.local) return;
        if (!grupos[i.local]) grupos[i.local] = {};
        if (!grupos[i.local][i.programacao_id]) grupos[i.local][i.programacao_id] = [];
        grupos[i.local][i.programacao_id].push(i);
    });
    console.log(p)
    console.log(local)

    const dataFormatada = new Date(p.data).toLocaleDateString("pt-BR")

    let mensagem = `📍 *${local}*\n\n`;
    mensagem += `🎵 *${p.tipo_visita}*\n`
    mensagem += `📅 ${dataFormatada}\n`
    mensagem += `⏰ ${p.horario}\n\n`
    mensagem += `👥 Inscritos:\n`

    grupos[local][pid].forEach(i => mensagem += `- ${i.nome} _(${i.instrumento})_\n`)

    mensagem = window.encodeURIComponent(mensagem)

    console.log(mensagem)

    window.location.href = `https://api.whatsapp.com/send?text=${mensagem}`
}