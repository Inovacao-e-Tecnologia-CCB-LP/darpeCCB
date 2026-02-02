let locaisMap = {};
let programacaoMap = {};
let inscritosPorProgramacao = {};

function initMaps() {
  locaisMap = {};
  dataStore.locais.forEach((l) => {
    locaisMap[l.id] = l;
  });

  programacaoMap = {};
  dataStore.programacao.forEach((p) => {
    programacaoMap[p.id] = p;
  });

  inscritosPorProgramacao = {};
  inscritos.forEach((i) => {
    if (!inscritosPorProgramacao[i.programacao_id]) {
      inscritosPorProgramacao[i.programacao_id] = [];
    }
    inscritosPorProgramacao[i.programacao_id].push(i);
  });
}

async function showInscritos() {
  setTitle("Visualizar Inscrições");

  conteudo.innerHTML = `
        <div class="spinner-border text-dark" role="status">
            <span class="visually-hidden">Carregando...</span>
        </div>`;

  abortController = new AbortController();

  try {
    inscritos = await listarInscricoes();

    initMaps();

    const grupos = {};

    inscritos.forEach((i) => {
      if (!i.local) return;
      if (!grupos[i.local]) grupos[i.local] = {};
      if (!grupos[i.local][i.programacao_id])
        grupos[i.local][i.programacao_id] = [];
      grupos[i.local][i.programacao_id].push(i);
    });

    let html = '<div class="accordion" id="accordionInscritos">';
    let index = 0;

    for (const local in grupos) {
      const primeiroPid = Object.keys(grupos[local])[0];
      const p = programacaoMap[primeiroPid];
      if (!p) continue;

      const localObj = locaisMap[p.local_id];

      html += `
            <div class="accordion-item border-dark">

            <h2 class="accordion-header" id="heading-${index}">
                <button class="accordion-button collapsed bg-dark text-white"
                data-bs-toggle="collapse"
                data-bs-target="#collapse-${index}">
                ${local}
                </button>
            </h2>

            <div id="collapse-${index}" class="accordion-collapse collapse">

            <p class="link-mapa copy-text" 
            data-localid="${p.local_id}" 
            title="Copiar endereço e abrir mapa">
              <i class="bi bi-geo-alt-fill me-1"></i>
              ${localObj?.endereco ?? "Endereço não informado"}
            </p>

            <div class="accordion-body bg-light">`;

      for (const pid in grupos[local]) {
        const p = programacaoMap[pid];
        if (!p) continue;

        html += `
                <div class="card mb-3 border-dark">
                    <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                        <b>${p.tipo_visita} - ${formatarData(p.data)} – ${p.descricao} (${formatarHorario(p.horario)})</b>
                        <button class="btn btn-dark"
                            onclick="compartilhar(${pid})">
                            <i class="bi bi-whatsapp"></i>
                        </button>
                    </div>
                    <ul class="list-group list-group-flush">`;

        grupos[local][pid].forEach((i) => {
          const auth = buscarAutorizacao(i.id);
          html += `
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        <span>
                            ${i.nome}
                            <span class="text-muted">(${i.instrumento})</span>
                        </span>
                        ${
                          auth
                            ? `<button class="btn btn-sm btn-outline-danger"
                            onclick="excluirInscricao(${i.id}, this)">
                            <i class="bi bi-trash"></i></button>`
                            : ""
                        }
                    </li>`;
        });

        html += `</ul></div>`;
      }

      html += `</div></div></div>`;
      index++;
    }

    html += "</div>";
    conteudo.innerHTML = html;

    copiarTexto(conteudo);
  } catch (err) {
    console.error(err);
    conteudo.innerHTML = `
            <div class="alert alert-dark text-center">
                ❌ Erro ao carregar inscrições
            </div>`;
  }
}

function compartilhar(pid) {
  const p = programacaoMap[pid];
  if (!p) {
    alert("Programação não encontrada");
    return;
  }

  const localObj = locaisMap[p.local_id];
  if (!localObj) {
    alert("Local não encontrado");
    return;
  }

  const inscritosProg = inscritosPorProgramacao[pid] || [];

  const dataFormatada = new Date(p.data).toLocaleDateString("pt-BR");

  let mensagem = `*${localObj.nome}*\n\n`;
  mensagem += `📍 _${localObj.endereco}_\n`;
  mensagem += `🎶 *${p.tipo_visita}*\n`;
  mensagem += `📆 ${dataFormatada}\n`;
  mensagem += `🕒 ${formatarHorario(p.horario)}\n\n`;
  mensagem += `👥 *Inscritos* (${inscritosProg.length}/${localObj.limite}):\n`;

  inscritosProg.forEach((i) => {
    mensagem += `• ${i.nome} _(${i.instrumento})_\n`;
  });

  mensagem = encodeURIComponent(mensagem);

  window.open(
    `https://api.whatsapp.com/send?text=${mensagem}`,
    "_blank",
    "noopener,noreferrer",
  );
}
