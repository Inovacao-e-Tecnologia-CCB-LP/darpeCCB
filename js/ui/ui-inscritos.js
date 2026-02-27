let locaisMap = {};
let programacaoMap = {};
let instrumentosMap = {};
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

  instrumentosMap = {};
  if (dataStore.instrumentos) {
    dataStore.instrumentos.forEach((i) => {
      instrumentosMap[i.id] = i;
    });
  }

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

  travarUI();
  try {
    inscritos = await inscricoesService.listar();

    inscritos = inscritos || [];

    if (inscritos.length === 0) {
      conteudo.innerHTML = `
        <div class="alert alert-secondary text-center">
          Nenhuma inscrição encontrada
        </div>
      `;
      return; 
    }

    initMaps();

    const grupos = {};

    inscritos.forEach((i) => {
      let localNome = i.local;
      if (i.local_id && locaisMap[i.local_id]) {
        localNome = locaisMap[i.local_id].nome;
      } else if (locaisMap[i.local]) {
        // Se o campo 'local' for o próprio ID
        localNome = locaisMap[i.local].nome;
      }

      if (!localNome) return;
      if (!grupos[localNome]) grupos[localNome] = {};
      if (!grupos[localNome][i.programacao_id])
        grupos[localNome][i.programacao_id] = [];
      grupos[localNome][i.programacao_id].push(i);
    });

    if (isMobile()) {
      // ── MOBILE: Cards bonitos ────────────────────────────
      let html = '<div class="inscritos-mobile-wrapper">';

      for (const local in grupos) {
        const primeiroPid = Object.keys(grupos[local])[0];
        const p = programacaoMap[primeiroPid];
        if (!p) continue;
        const localObj = locaisMap[p.local_id];

        html += `
          <div class="inscritos-local-section">
            <div class="inscritos-local-header">
              <div class="d-flex align-items-center gap-2">
                <div class="inscritos-local-icon">
                  <i class="bi bi-geo-alt-fill"></i>
                </div>
                <div>
                  <div class="fw-bold">${local}</div>
                  <div class="inscritos-local-endereco link-mapa copy-text" data-localid="${p.local_id}" title="Copiar endereço">
                    <i class="bi bi-map me-1"></i>${localObj?.endereco ?? "Endereço não informado"}
                  </div>
                </div>
              </div>
            </div>`;

        for (const pid in grupos[local]) {
          const prog = programacaoMap[pid];
          if (!prog) continue;
          const inscritosDoProg = grupos[local][pid];

          html += `
            <div class="inscritos-prog-card">
              <div class="inscritos-prog-header">
                <div>
                  <div class="inscritos-prog-titulo">${prog.tipo_visita}</div>
                  <div class="inscritos-prog-subtitulo">
                    <i class="bi bi-calendar3 me-1"></i>${formatarData(prog.data)}
                    &nbsp;·&nbsp;
                    <i class="bi bi-clock me-1"></i>${formatarHorario(prog.horario)}
                  </div>
                  <div class="inscritos-prog-desc">${prog.descricao}</div>
                </div>
                <button class="inscritos-share-btn" onclick="compartilhar(${pid})">
                  <i class="bi bi-whatsapp"></i>
                </button>
              </div>
              <div class="inscritos-prog-badge">
                <i class="bi bi-people-fill me-1"></i>${inscritosDoProg.length} inscrito${inscritosDoProg.length !== 1 ? "s" : ""}
              </div>
              <div class="inscritos-pessoas-lista">`;

          inscritosDoProg.forEach((i, idx) => {
            const auth = localStorageService.buscarAutorizacao(i.id);
            let instNome = i.instrumento;
            if (i.instrumento_id && instrumentosMap[i.instrumento_id]) {
              instNome = instrumentosMap[i.instrumento_id].nome;
            } else if (instrumentosMap[i.instrumento]) {
              instNome = instrumentosMap[i.instrumento].nome;
            }
            const iniciais = (i.nome || "?").split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();

            html += `
                <div class="inscrito-pessoa-card">
                  <div class="inscrito-avatar">${iniciais}</div>
                  <div class="inscrito-info">
                    <div class="inscrito-nome">${i.nome}</div>
                    <div class="inscrito-instrumento">
                      <i class="bi bi-music-note me-1"></i>${instNome}
                    </div>
                  </div>
                  ${auth ? `
                    <button class="inscrito-excluir-btn" onclick="excluirInscricao(${i.id}, this)" title="Remover inscrição">
                      <i class="bi bi-trash"></i>
                    </button>` : ""}
                </div>`;
          });

          html += `</div></div>`;
        }

        html += `</div>`;
      }

      html += '</div>';
      conteudo.innerHTML = html;

    } else {
      // ── DESKTOP: Accordion original ──────────────────────
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
                      <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center gap-2 py-3">
                          <div class="text-start">
                            <div class="fw-semibold fs-6">${p.tipo_visita} &bull; ${formatarData(p.data)}</div>
                            <div class="small opacity-75">${p.descricao} &bull; ${formatarHorario(p.horario)}</div>
                          </div>
                          <button class="btn btn-sm btn-outline-light flex-shrink-0"
                              onclick="compartilhar(${pid})">
                              <i class="bi bi-whatsapp me-1"></i>Compartilhar
                          </button>
                      </div>
                      <ul class="list-group list-group-flush">`;

          grupos[local][pid].forEach((i) => {
            const auth = localStorageService.buscarAutorizacao(i.id);

            let instNome = i.instrumento;
            if (i.instrumento_id && instrumentosMap[i.instrumento_id]) {
              instNome = instrumentosMap[i.instrumento_id].nome;
            } else if (instrumentosMap[i.instrumento]) {
              instNome = instrumentosMap[i.instrumento].nome;
            }

            html += `
                      <li class="list-group-item d-flex justify-content-between align-items-center gap-2 py-3">
                          <span class="d-flex flex-column align-items-start">
                            <span class="fw-semibold">${i.nome}</span>
                            <span class="text-muted small">${instNome}</span>
                          </span>
                          ${
                            auth
                              ? `<button class="btn btn-sm btn-outline-danger flex-shrink-0"
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
    }

    copiarTexto(conteudo);
  } catch (err) {
    console.error(err);
    conteudo.innerHTML = `
            <div class="alert alert-dark text-center">
                 Erro ao carregar inscrições
            </div>`;
  } finally {
    liberarUI();
  }
}

function compartilhar(pid) {
  const p = programacaoMap[pid];
  if (!p) {
    abrirModalAviso("Erro", "Programação não encontrada.");
    return;
  }

  const localObj = locaisMap[p.local_id];
  if (!localObj) {
    abrirModalAviso("Erro", "Local não encontrado.");
    return;
  }

  const inscritosProg = inscritosPorProgramacao[pid] || [];

  const dataFormatada = new Date(p.data).toLocaleDateString("pt-BR");

  let mensagem = `*${localObj.nome}*\n\n`;
  mensagem += ` _${localObj.endereco}_\n`;
  mensagem += ` *${p.tipo_visita}*\n`;
  mensagem += ` ${dataFormatada}\n`;
  mensagem += ` ${formatarHorario(p.horario)}\n\n`;
  mensagem += ` *Inscritos* (${inscritosProg.length}/${localObj.limite}):\n`;

  inscritosProg.forEach((i) => {
    let instNome = i.instrumento;
    if (i.instrumento_id && instrumentosMap[i.instrumento_id]) {
      instNome = instrumentosMap[i.instrumento_id].nome;
    } else if (instrumentosMap[i.instrumento]) {
      instNome = instrumentosMap[i.instrumento].nome;
    }
    mensagem += `• ${i.nome} _(${instNome})_\n`;
  });

  mensagem = encodeURIComponent(mensagem);

  window.open(
    `https://api.whatsapp.com/send?text=${mensagem}`,
    "_blank",
    "noopener,noreferrer",
  );
}
