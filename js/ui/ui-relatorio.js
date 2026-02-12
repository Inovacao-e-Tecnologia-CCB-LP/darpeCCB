/* =========================
   STATE
========================= */

const RelatorioState = {
  localId: null,
  programacaoId: null,
  programacaoAdicionarId: null,
  modoEdicao: false,
  historicoRemocoes: [],

  reset() {
    this.localId = null;
    this.programacaoId = null;
    this.modoEdicao = false;
    this.historicoRemocoes = [];
  },
};

/* =========================
   RENDER (UI HELPERS)
========================= */

const UiRelatorios = {
  loading() {
    return `
      <div class="text-center my-4">
        <div class="spinner-border text-dark"></div>
      </div>
    `;
  },

  alerta(tipo, texto) {
    return `
      <div class="alert alert-${tipo} text-center py-2">
        ${texto}
      </div>
    `;
  },

  cardLocal(local, onClick) {
    const item = document.createElement("div");
    item.className =
      "list-group-item d-flex justify-content-between align-items-center local-item";
    item.style.cursor = "pointer";

    item.innerHTML = `
      <span class="fw-semibold">${local.nome}</span>
      <i class="bi bi-check-circle-fill opacity-0"></i>
    `;

    item.onclick = () => onClick(item);
    return item;
  },

  cardProgramacao(p, onClick) {
    const card = document.createElement("div");
    card.className =
      "border rounded-3 p-3 d-flex justify-content-between align-items-start programacao-item";
    card.style.cursor = "pointer";

    card.innerHTML = `
      <div>
        <div class="fw-semibold mb-1">
          ${p.tipo_visita} – ${formatarData(p.data)}
        </div>
        <div class="small text-muted lh-sm">
          ${p.descricao} (${p.horario?.replace(/'/g, "")})
        </div>
      </div>
      <i class="bi bi-check-circle-fill fs-5 opacity-0"></i>
    `;

    card.onclick = () => onClick(card);
    return card;
  },
};

function obterValoresFormularioRelatorio() {
  return {
    responsavel: document.getElementById("responsavel")?.value?.trim() || "",
    qtdInternos: Number(document.getElementById("qtdInternos")?.value || 0),
    palavra: document.getElementById("palavra")?.value || "",
    observacoes: document.getElementById("observacoes")?.value || "",
  };
}

/* =========================
   CONTROLLER (ENTRADA)
========================= */

async function abrirTelaRelatorios() {
  setTitle("Relatórios");
  conteudo.innerHTML = UiRelatorios.loading();

  try {
    inscritos = await inscricoesService.listar();
    initMaps();

    conteudo.innerHTML = Ui.PainelRelatorio();
    RelatorioState.reset();

    document
      .getElementById("formRelatorio")
      ?.addEventListener("submit", function (e) {
        e.preventDefault();
      });

    carregarLocaisRelatorio();
  } catch (err) {
    console.error(err);
    conteudo.innerHTML = UiRelatorios.alerta(
      "danger",
      "❌ Erro ao carregar dados dos relatórios",
    );
  }
}

/* =========================
   LOCAIS
========================= */

function carregarLocaisRelatorio() {
  const lista = document.getElementById("listaLocais");
  const collapseEl = document.getElementById("collapseLocais");
  const header = document.getElementById("localSelecionadoHeader");
  const headerNome = document.getElementById("localSelecionadoNome");
  const btnToggle = document.getElementById("btnToggleLocais");

  if (!lista) return;

  lista.innerHTML = "";
  header?.classList.add("d-none");
  collapseEl?.classList.remove("fechado");

  dataStore.locais.forEach((local) => {
    lista.appendChild(
      UiRelatorios.cardLocal(local, (item) => {
        lista.querySelectorAll(".local-item").forEach((el) => {
          el.classList.remove("bg-dark", "text-white");
          el.querySelector("i")?.classList.add("opacity-0");
        });

        item.classList.add("bg-dark", "text-white");
        item.querySelector("i").classList.remove("opacity-0");

        RelatorioState.localId = local.id;
        RelatorioState.programacaoId = null;

        headerNome.textContent = local.nome;
        header.classList.remove("d-none");
        collapseEl.classList.add("fechado");

        carregarProgramacoesRelatorio(local.id);
      }),
    );
  });

  btnToggle?.addEventListener("click", () => {
    collapseEl.classList.toggle("fechado");
  });
}

/* =========================
   PROGRAMAÇÕES
========================= */

function carregarProgramacoesRelatorio(localId) {
  const lista = document.getElementById("listaProgramacoes");
  const camposEv = document.getElementById("camposEvangelizacao");

  if (!lista) return;

  lista.innerHTML = "";
  camposEv?.classList.add("d-none");

  const programacoes = relatoriosService.filtrarProgramacoesComInscritos(
    localId,
    inscritosPorProgramacao,
  );

  if (!programacoes.length) {
    lista.innerHTML = UiRelatorios.alerta(
      "warning",
      "Nenhuma programação com inscritos para este local.",
    );
    return;
  }

  programacoes.forEach((p) => {
    lista.appendChild(
      UiRelatorios.cardProgramacao(p, (card) => {
        lista.querySelectorAll(".programacao-item").forEach((el) => {
          el.classList.remove("bg-dark", "text-white");
          el.querySelector("i")?.classList.add("opacity-0");
        });

        card.classList.add("bg-dark", "text-white");
        card.querySelector("i").classList.remove("opacity-0");

        RelatorioState.programacaoId = p.id;
        document.getElementById("dataRelatorio").value = p.data;

        if (p.tipo_visita === "Evangelização") {
          camposEv?.classList.remove("d-none");
        } else {
          camposEv?.classList.add("d-none");
          document.getElementById("palavra").value = "";
          document.getElementById("qtdInternos").value = "";
        }

        carregarMusicosRelatorio(p.id);
      }),
    );
  });
}

/* =========================
   MÚSICOS
========================= */

function carregarMusicosRelatorio(programacaoId) {
  const container = document.getElementById("listaMusicos");
  if (!container) return;

  container.innerHTML = "";
  const inscritosProg = inscritosPorProgramacao[programacaoId] || [];

  if (!inscritosProg.length) {
    container.innerHTML = `
      <div class="text-muted fst-italic text-center">
        Nenhum músico nesta programação.
      </div>
    `;
    return;
  }

  let modoEdicao = false;

  const header = document.createElement("div");
  header.className = "d-flex justify-content-between align-items-center mb-2";
  header.innerHTML = `
  `;

  const ul = document.createElement("ul");
  ul.className = "list-unstyled mb-0";

  inscritosProg.forEach((i, index) => {
    let instNome = i.instrumento;
    if (i.instrumento_id && instrumentosMap[i.instrumento_id]) {
      instNome = instrumentosMap[i.instrumento_id].nome;
    }

    const li = document.createElement("li");
    li.className = "d-flex justify-content-between align-items-center mb-1";

    li.innerHTML = `
    <span>${i.nome}${instNome ? ` (${instNome})` : ""}</span>
    <button 
      type="button"
      class="btn btn-sm btn-outline-danger ms-2"
      title="Remover"
    >
      <i class="bi bi-trash"></i>
    </button>
  `;

    const btnRemover = li.querySelector("button");

    btnRemover.onclick = async (e) => {
      e.stopPropagation();

      const confirmado = await abrirModalConfirmacao(
        "Deseja excluir o músico?",
        "Confirmar",
      );

      if (!confirmado) return;

      inscritosProg.splice(index, 1);
      carregarMusicosRelatorio(programacaoId);
    };

    ul.appendChild(li);
  });

  container.append(header, ul);

  container.onclick = () => {
    modoEdicao = !modoEdicao;
    ul.querySelectorAll("button").forEach((b) =>
      b.classList.toggle("d-none", !modoEdicao),
    );
  };

  const inputMusicos = document.getElementById("qtdMusicos");
  if (inputMusicos) {
    inputMusicos.value = inscritosProg.length;
  }

  const btnAdicionar = document.createElement("button");
  btnAdicionar.type = "button";
  btnAdicionar.className = "btn btn-outline-primary btn-sm mt-2";
  btnAdicionar.innerHTML = '<i class="bi bi-plus"></i> Adicionar';

  btnAdicionar.onclick = (e) => {
    e.stopPropagation();
    abrirModalAdicionarMusico(programacaoId);
  };

  container.appendChild(btnAdicionar);
}

function abrirModalAdicionarMusico(programacaoId) {
  RelatorioState.programacaoAdicionarId = programacaoId;

  document.getElementById("nomeMusicoModal").value = "";
  document.getElementById("instrumentoMusicoModal").value = "";

  limparErroCampo("erroValidacaoCamposMusico");

  const modal = new bootstrap.Modal(
    document.getElementById("modalAdicionarMusico"),
  );

  modal.show();

  // Foco automático no nome
  setTimeout(() => {
    document.getElementById("nomeMusicoModal").focus();
  }, 300);
}

function salvarMusicoModal() {
  const nome = document.getElementById("nomeMusicoModal").value.trim();
  const instrumento = document
    .getElementById("instrumentoMusicoModal")
    .value.trim();

  if (!nome || !instrumento) {
    mostrarErroCampo(
      "erroValidacaoCamposMusico",
      "Preencha todos os campos obrigatórios.",
    );
    return;
  }

  const programacaoId = RelatorioState.programacaoAdicionarId;

  const novo = {
    nome,
    instrumento,
    instrumentoNome: instrumento || "",
  };

  if (!inscritosPorProgramacao[programacaoId]) {
    inscritosPorProgramacao[programacaoId] = [];
  }

  inscritosPorProgramacao[programacaoId].push(novo);

  // Atualiza lista
  carregarMusicosRelatorio(programacaoId);

  // Atualiza contador
  const inputMusicos = document.getElementById("qtdMusicos");
  if (inputMusicos) {
    inputMusicos.value = inscritosPorProgramacao[programacaoId].length;
  }

  // Fecha modal
  bootstrap.Modal.getInstance(
    document.getElementById("modalAdicionarMusico"),
  ).hide();
}

/* =========================
   DADOS + PDF + WHATSAPP
========================= */

function montarDadosRelatorio() {
  const { localId, programacaoId } = RelatorioState;
  const form = obterValoresFormularioRelatorio();

  if (!localId || !programacaoId || !form.responsavel) {
    abrirModalAviso(
      "Dados obrigatórios",
      "Selecione o local, programação e informe o responsável.",
    );
    return null;
  }

  const local = dataStore.locais.find((l) => l.id == localId);
  const programacao = dataStore.programacao.find((p) => p.id == programacaoId);

  const musicosRaw = inscritosPorProgramacao[programacaoId] || [];

  const musicos = musicosRaw.map((c) => ({
    ...c,
    instrumentoNome:
      c.instrumento_id && instrumentosMap[c.instrumento_id]
        ? instrumentosMap[c.instrumento_id].nome
        : c.instrumento || "",
  }));

  const qtdMusicosManual = Number(
    document.getElementById("qtdMusicos")?.value || musicos.length,
  );

  return {
    responsavel: form.responsavel,
    local,
    programacao,
    musicos,
    qtdMusicos: qtdMusicosManual,
    qtdInternos: form.qtdInternos,
    observacoes: form.observacoes,
    evangelizacao:
      programacao.tipo_visita === "Evangelização"
        ? { palavra: form.palavra || "-" }
        : null,
  };
}

async function gerarPDF() {
  const dados = montarDadosRelatorio();
  if (!dados) return;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "mm", "a4");

  /* ================= CONFIGURAÇÕES GERAIS ================= */
  const MARGEM_ESQ = 20;
  const MARGEM_DIR = 190;
  const LARGURA_TEXTO = 170;

  const FONT_TITULO = 16;
  const FONT_SUBTITULO = 13;
  const FONT_LABEL = 12;
  const FONT_TEXTO = 11;

  let y = 20;

  /* ================= LOGO ================= */
  const logoUrl = "Img/logo-ccb.png";
  const logoImg = await carregarImagemBase64(logoUrl);
  doc.addImage(logoImg, "PNG", 80, y, 50, 22);
  y += 30; // ⬅ antes era 35

  /* ================= CABEÇALHO ================= */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(FONT_TITULO);
  doc.text("DARPE", 105, y, { align: "center" });
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(FONT_TEXTO);
  doc.text("Departamento de Assistência Religiosa para Evangelização", 105, y, {
    align: "center",
  });

  y += 8;
  doc.line(MARGEM_ESQ, y, MARGEM_DIR, y);
  y += 9;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(FONT_SUBTITULO);
  doc.text("Relatório de Atendimento", 105, y, { align: "center" });

  y += 8;
  doc.line(MARGEM_ESQ, y, MARGEM_DIR, y);
  y += 10;

  /* ================= FUNÇÃO LINHA ================= */
  function linha(label, valor) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(FONT_LABEL);
    doc.text(label, MARGEM_ESQ, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(FONT_TEXTO);
    doc.text(valor || "-", MARGEM_ESQ + 55, y);

    y += 7; // ⬅ antes era 9

    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  }

  /* ================= DADOS PRINCIPAIS ================= */
  linha("Nome do Responsável:", dados.responsavel);
  linha("Nome do Local:", dados.local.nome);
  linha(
    "Tipo de Visita:",
    `${dados.programacao.tipo_visita} – ${dados.programacao.descricao}`,
  );

  const horarioLimpo = dados.programacao.horario.replace(/'/g, "");
  linha(
    "Data e Hora:",
    `${formatarData(dados.programacao.data)} – ${horarioLimpo}`,
  );

  if (dados.qtdInternos > 0) {
    linha("Qtde. Internos:", String(dados.qtdInternos));
  }

  linha("Qtde. Músicos:", String(dados.qtdMusicos));

  /* ================= EVANGELIZAÇÃO ================= */
  if (dados.evangelizacao) {
    linha("Palavra:", dados.evangelizacao.palavra);
  }

  /* ================= OBSERVAÇÕES ================= */
  if (dados.observacoes?.trim()) {
    y += 3;
    doc.line(MARGEM_ESQ, y, MARGEM_DIR, y);
    y += 7;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(FONT_SUBTITULO);
    doc.text("Observações:", MARGEM_ESQ, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(FONT_TEXTO);

    const textoObs = doc.splitTextToSize(dados.observacoes, LARGURA_TEXTO);
    doc.text(textoObs, MARGEM_ESQ, y);
    y += textoObs.length * 5; // ⬅ antes era 6

    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  }

  /* ================= MÚSICOS ================= */
  y += 4;
  doc.line(MARGEM_ESQ, y, MARGEM_DIR, y);
  y += 7;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(FONT_SUBTITULO);
  doc.text("Nome/Instrumento dos Músicos", MARGEM_ESQ, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(FONT_TEXTO);

  if (!dados.musicos.length) {
    doc.text("Nenhum músico inscrito.", MARGEM_ESQ, y);
  } else {
    dados.musicos.forEach((c) => {
      let instNome = c.instrumento;

      if (c.instrumento_id && instrumentosMap[c.instrumento_id]) {
        instNome = instrumentosMap[c.instrumento_id].nome;
      }

      const texto = instNome ? `${c.nome} (${instNome})` : c.nome;

      doc.text("• " + texto, MARGEM_ESQ + 2, y);
      y += 5; // ⬅ antes era 6

      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });
  }

  /* ================= SALVAR ================= */
  const nomeArquivo = gerarNomeRelatorioPDF(dados);
  doc.save(nomeArquivo);
}

function gerarNomeRelatorioPDF(dados) {
  const local = dados.local?.nome || "Local";
  const data = dados.programacao?.data || "";

  // formata data yyyy-mm-dd → dd/mm/yyyy
  const dataFormatada = data ? data.split("-").reverse().join("/") : "";

  return `Relatório - ${local} - ${dataFormatada}.pdf`;
}

function gerarMensagemWhatsAppRelatorio(dados) {
  const linhas = [];

  linhas.push("*DARPE*");
  linhas.push("_Relatório de Atendimento_");
  linhas.push("");
  linhas.push("*📋 Dados Gerais*");
  linhas.push("");
  linhas.push(`👤 *Nome do Responsável:* _${dados.responsavel}_`);
  linhas.push(`📍 *Nome do Local:* _${dados.local?.nome || "-"}_`);
  linhas.push(`📆 *Data:* _${formatarData(dados.programacao?.data)}_`);
  linhas.push(
    `🕒 *Horário:* _${dados.programacao?.horario?.replace(/'/g, "") || "-"}_`,
  );
  linhas.push(
    `🎼 *Tipo de Visita:* _${dados.programacao?.tipo_visita} – ${dados.programacao?.descricao}_`,
  );
  if (dados.qtdInternos > 0) {
    linhas.push(`💠 *Qtde. Internos:* _${dados.qtdInternos}_`);
  }
  linhas.push(`🎶 *Qtde. Músicos:* _${dados.qtdMusicos}_`);
  if (dados.evangelizacao?.palavra) {
    linhas.push(`📖 *Palavra:* _${dados.evangelizacao.palavra}_`);
  }

  linhas.push("");

  // 📝 OBSERVAÇÕES
  if (dados.observacoes?.trim()) {
    linhas.push("*📝 Observações*");
    linhas.push("");
    linhas.push(`${dados.observacoes}`);
  }

  linhas.push("");

  // 👥 musicos
  if (dados.musicos?.length) {
    linhas.push("*👥 Nome/Instrumento dos Músicos*");
    linhas.push("");
    dados.musicos.forEach((c) => {
      linhas.push(
        `• _${c.nome}${c.instrumentoNome ? " (" + c.instrumentoNome + ")" : ""}_`,
      );
    });
  }
  linhas.push("");
  return encodeURIComponent(linhas.join("\n"));
}

function enviarWhatsAppRelatorio() {
  const dados = montarDadosRelatorio();
  if (!dados) return;

  const mensagem = gerarMensagemWhatsAppRelatorio(dados);

  window.open(
    `https://api.whatsapp.com/send?text=${mensagem}`,
    "_blank",
    "noopener,noreferrer",
  );
}
