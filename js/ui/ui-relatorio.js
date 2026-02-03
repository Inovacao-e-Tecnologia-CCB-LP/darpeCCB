async function abrirRelatorios() {
  setTitle("Admin • Relatórios");

  conteudo.innerHTML = `
    <div class="spinner-border text-dark" role="status">
      <span class="visually-hidden">Carregando...</span>
    </div>
  `;

  try {
    // 🔥 busca inscritos
    inscritos = await inscricoesService.listar();

    // 🔥 monta os mapas
    initMaps();

    // agora sim monta a UI
    conteudo.innerHTML = Ui.PainelRelatorio();
    carregarLocaisRelatorio();
  } catch (err) {
    console.error(err);
    conteudo.innerHTML = `
      <div class="alert alert-danger text-center">
        ❌ Erro ao carregar dados dos relatórios
      </div>
    `;
  }
}

function carregarLocaisRelatorio() {
  const listaLocais = document.getElementById("listaLocais");
  const inputLocal = document.getElementById("localSelecionado");
  const header = document.getElementById("localSelecionadoHeader");
  const headerNome = document.getElementById("localSelecionadoNome");
  const collapseEl = document.getElementById("collapseLocais");
  const btnToggle = document.getElementById("btnToggleLocais");

  if (!listaLocais || !inputLocal || !collapseEl || !btnToggle) return;

  // reset
  listaLocais.innerHTML = "";
  inputLocal.value = "";
  header.classList.add("d-none");
  collapseEl.classList.remove("fechado");

  dataStore.locais.forEach((local) => {
    const item = document.createElement("div");
    item.className =
      "list-group-item d-flex justify-content-between align-items-center local-item";
    item.style.cursor = "pointer";

    item.innerHTML = `
      <span class="fw-semibold">${local.nome}</span>
      <i class="bi bi-check-circle-fill opacity-0"></i>
    `;

    const icon = item.querySelector("i");

    item.addEventListener("click", () => {
      // limpa seleção
      listaLocais.querySelectorAll(".local-item").forEach((el) => {
        el.classList.remove("bg-dark", "text-white");
        el.querySelector("i")?.classList.add("opacity-0");
      });

      // seleciona
      item.classList.add("bg-dark", "text-white");
      icon.classList.remove("opacity-0");

      // salva
      inputLocal.value = local.id;
      headerNome.textContent = local.nome;

      // mostra header
      header.classList.remove("d-none");

      // anima fechamento
      collapseEl.classList.add("fechado");

      console.log("Local selecionado:", local.nome);

      carregarProgramacoesRelatorio(local.id);
    });

    listaLocais.appendChild(item);
  });

  // reabrir lista
  btnToggle.addEventListener("click", () => {
    collapseEl.classList.toggle("fechado");
  });
}

function carregarProgramacoesRelatorio(localId) {
  const lista = document.getElementById("listaProgramacoes");
  const inputProg = document.getElementById("programacaoSelecionada");
  const camposEv = document.getElementById("camposEvangelizacao");
  const inputPalavra = document.getElementById("palavra");
  const inputQtd = document.getElementById("qtdInternos");

  if (!lista || !inputProg) return;

  lista.innerHTML = "";
  inputProg.value = "";

  // esconde evangelização ao trocar de local
  camposEv.classList.add("d-none");
  inputPalavra.value = "";
  inputQtd.value = "";

  /* ✅ FILTRA: local + tem inscritos */
  const programacoes = dataStore.programacao.filter((p) => {
    if (p.local_id != localId) return false;

    const inscritos = inscritosPorProgramacao[p.id] || [];
    return inscritos.length > 0; // 👈 REGRA PRINCIPAL
  });

  if (programacoes.length === 0) {
    lista.innerHTML = `
      <div class="col-12">
        <div class="alert alert-warning py-2 mb-0 small">
          Nenhuma programação com inscritos para este local.
        </div>
      </div>
    `;
    return;
  }

  programacoes.forEach((p) => {
    const col = document.createElement("div");
    col.className = "col-12";

    const card = document.createElement("div");
    card.className =
      "border rounded-3 p-3 d-flex justify-content-between align-items-start programacao-item";
    card.style.cursor = "pointer";

    card.innerHTML = `
      <div class="text-start">
        <div class="fw-semibold mb-1">
          ${p.tipo_visita} – ${formatarData(p.data)}
        </div>
        <div class="small text-muted lh-sm">
         ${p.descricao} (${p.horario?.replace(/'/g, "")})
        </div>
      </div>
      <i class="bi bi-check-circle-fill fs-5 opacity-0"></i>
    `;

    const icon = card.querySelector("i");

    card.addEventListener("click", () => {
      // limpa seleção anterior
      lista.querySelectorAll(".programacao-item").forEach((el) => {
        el.classList.remove("bg-dark", "text-white");
        el.querySelector("i")?.classList.add("opacity-0");
      });

      // seleciona atual
      card.classList.add("bg-dark", "text-white");
      icon.classList.remove("opacity-0");

      inputProg.value = p.id;

      // preenche data
      document.getElementById("dataRelatorio").value = p.data;

      // 👉 REGRA DA EVANGELIZAÇÃO (mantida)
      if (p.tipo_visita === "Evangelização") {
        camposEv.classList.remove("d-none");
      } else {
        camposEv.classList.add("d-none");
        inputPalavra.value = "";
        inputQtd.value = "";
      }

      carregarColaboradoresRelatorio(p.id);

      console.log("Programação selecionada:", p);
    });

    col.appendChild(card);
    lista.appendChild(col);
  });
}

function abrirModalAviso(mensagem, titulo = "Aviso") {
  const modalEl = document.getElementById("modalAviso");
  const tituloEl = document.getElementById("modalAvisoTitulo");
  const msgEl = document.getElementById("modalAvisoMensagem");

  if (!modalEl || !tituloEl || !msgEl) return;

  tituloEl.textContent = titulo;
  msgEl.innerHTML = mensagem; // permite <br>, <strong>, etc

  const modal = new bootstrap.Modal(modalEl);
  modal.show();
}

let historicoRemocoes = [];

function carregarColaboradoresRelatorio(programacaoId) {
  const container = document.getElementById("listaColaboradores");
  if (!container) return;

  container.innerHTML = "";

  const inscritosProg = inscritosPorProgramacao[programacaoId] || [];

  if (!inscritosProg.length) {
    container.innerHTML = `
      <div class="text-muted fst-italic text-center">
        Nenhum colaborador inscrito nesta programação.
      </div>
    `;
    container.dataset.qtdColaboradores = 0;
    return;
  }

  let modoEdicao = false;

  /* ===== HEADER ===== */
  const header = document.createElement("div");
  header.className =
    "d-flex justify-content-between align-items-center mb-2";

  const info = document.createElement("span");
  info.className = "text-primary small fst-italic";
  info.textContent = "Toque para editar";

  header.innerHTML = `
    <span class="fw-semibold">
      <i class="bi bi-people-fill"></i> Colaboradores DARPE
    </span>
  `;
  header.appendChild(info);

  /* ===== LISTA ===== */
  const ul = document.createElement("ul");
  ul.className = "list-unstyled mb-0";

  inscritosProg.forEach((i, index) => {
    const li = document.createElement("li");
    li.className =
      "d-flex justify-content-between align-items-center mb-1";

    const instrumento = i.instrumento ? ` (${i.instrumento})` : "";

    li.innerHTML = `
      <span>${i.nome}${instrumento}</span>
      <button
        type="button"
        class="btn btn-sm btn-outline-danger d-none"
        title="Excluir colaborador"
        data-index="${index}"
      >
        <i class="bi bi-trash"></i>
      </button>
    `;

    ul.appendChild(li);
  });

  container.appendChild(header);
  container.appendChild(ul);

  container.dataset.qtdColaboradores = inscritosProg.length;

  /* ===== TOQUE PARA EDITAR ===== */
  container.onclick = (e) => {
    if (e.target.closest("button")) return;

    modoEdicao = !modoEdicao;

    info.textContent = modoEdicao
      ? "Modo edição ativo"
      : "Toque para editar";

    ul.querySelectorAll("button").forEach((btn) => {
      btn.classList.toggle("d-none", !modoEdicao);
    });

    container.classList.toggle("modo-edicao", modoEdicao);
  };

  /* ===== EXCLUIR ===== */
  ul.querySelectorAll("button").forEach((btn) => {
    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();

      const index = Number(btn.dataset.index);
      const colaborador = inscritosProg[index];
      const nome = colaborador?.nome || "este colaborador";

      abrirConfirmacao(
        "Confirmar exclusão",
        `Deseja realmente remover <strong>${nome}</strong> do relatório?`,
        () => {
          historicoRemocoes.push({
            programacaoId,
            colaborador,
            index
          });

          inscritosProg.splice(index, 1);
          carregarColaboradoresRelatorio(programacaoId);
          mostrarBotaoDesfazer();

          // 🧠 espera o modal fechar antes de abrir o aviso
          if (inscritosProg.length === 0) {
            setTimeout(() => {
              abrirAvisoSemColaboradores();
            }, 300);
          }
        }
      );
    };
  });}


/* ===== MODAL AVISO ===== */
function abrirAvisoSemColaboradores() {
  const modalEl = document.getElementById("confirmModal");
  const titleEl = document.getElementById("confirmTitle");
  const msgEl = document.getElementById("confirmMessage");
  const btnOk = document.getElementById("confirmOk");

  btnOk.onclick = null;
  btnOk.className = "btn btn-warning";
  btnOk.textContent = "Entendi";

  titleEl.textContent = "Atenção";
  msgEl.innerHTML = `
    <div class="text-center">
      <i class="bi bi-exclamation-triangle-fill text-warning fs-1"></i>
      <p class="mt-3 mb-0">
        Este relatório está sem colaboradores.
      </p>
    </div>
  `;

  const modal = bootstrap.Modal.getOrCreateInstance(modalEl, {
    backdrop: "static",
    keyboard: false
  });

  btnOk.onclick = () => modal.hide();

  modal.show();
}


/* ===== MODAL CONFIRMAÇÃO ===== */
function abrirConfirmacao(titulo, mensagem, onConfirm) {
  const modalEl = document.getElementById("confirmModal");
  const titleEl = document.getElementById("confirmTitle");
  const msgEl = document.getElementById("confirmMessage");
  const btnOk = document.getElementById("confirmOk");

  // 🔥 RESET COMPLETO
  btnOk.onclick = null;
  btnOk.className = "btn btn-danger";
  btnOk.textContent = "Excluir";

  titleEl.textContent = titulo;
  msgEl.innerHTML = mensagem;

  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);

  btnOk.onclick = () => {
    modal.hide();
    onConfirm();
  };

  modal.show();
}


/* ===== DESFAZER (CTRL+Z) ===== */
function desfazerUltimaRemocao() {
  const ultima = historicoRemocoes.pop();
  if (!ultima) return;

  const { programacaoId, colaborador, index } = ultima;

  if (!inscritosPorProgramacao[programacaoId]) return;

  inscritosPorProgramacao[programacaoId].splice(index, 0, colaborador);
  carregarColaboradoresRelatorio(programacaoId);

  if (!historicoRemocoes.length) {
    ocultarBotaoDesfazer();
  }
}

function mostrarBotaoDesfazer() {
  document.getElementById("btnDesfazer")?.classList.remove("d-none");
}

function ocultarBotaoDesfazer() {
  document.getElementById("btnDesfazer")?.classList.add("d-none");
}


function montarDadosRelatorio() {
  const localId = document.getElementById("localSelecionado")?.value;
  const programacaoId = document.getElementById(
    "programacaoSelecionada",
  )?.value;

  const responsavelInput = document.getElementById("responsavel");
  const responsavel = responsavelInput?.value?.trim();
if (!localId || !programacaoId) {
    abrirModalAviso(
      '<i class="bi bi-exclamation-triangle-fill text-danger fs-4 me-2"></i>' + 'Selecione o <strong>Local</strong> e a <strong>Programação</strong> antes de gerar o relatório.',
      "Dados obrigatórios",
    );
    return null;
  }
  
  if (!responsavel) {
  abrirModalAviso(
    '<i class="bi bi-exclamation-triangle-fill text-danger fs-4 me-2"></i>' +
    'Informe o <strong>DARPE Responsável</strong> antes de gerar o relatório.' +
    '<br><br><small>(É o responsável pela emissão do documento)</small>',
    "Campo obrigatório"
  );

    responsavelInput?.focus();
    return null;
  }

  

  const local = dataStore.locais.find((l) => l.id == localId);
  const programacao = dataStore.programacao.find((p) => p.id == programacaoId);

  if (!local || !programacao) {
    if (!local || !programacao) {
      abrirModalAviso(
        "❌ Não foi possível localizar os dados do relatório.<br>Tente selecionar novamente.",
        "Erro",
      );
      return null;
    }

    return null;
  }

  const colaboradores = inscritosPorProgramacao?.[programacaoId] || [];

  const dados = {
    responsavel: responsavel,
    local: {
      nome: local.nome,
      endereco: local.endereco,
    },
    programacao: {
      tipo: programacao.tipo_visita,
      data: programacao.data,
      horario: programacao.horario,
      descricao: programacao.descricao,
    },
    colaboradores: colaboradores.map((i) => ({
      nome: i.nome,
      instrumento: i.instrumento || null,
    })),
    qtdColaboradores: colaboradores.length,
    qtdInternos: Number(document.getElementById("qtdInternos")?.value || 0),

    // ✅ NOVO
    observacoes: document.getElementById("observacoes")?.value || "",
  };

  // 👉 somente se for Evangelização
  if (programacao.tipo_visita === "Evangelização") {
    dados.evangelizacao = {
      palavra: document.getElementById("palavra")?.value || "-",
    };
  }

  return dados;
}

function carregarImagemBase64(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = function () {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = url;
  });
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
  const logoUrl = "Img/logo-ccb.png"; // ajuste se necessário
  const logoImg = await carregarImagemBase64(logoUrl);

  doc.addImage(logoImg, "PNG", 80, y, 50, 22);
  y += 35;

  /* ================= CABEÇALHO ================= */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(FONT_TITULO);
  doc.text("DARPE", 105, y, { align: "center" });
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(FONT_TEXTO);
  doc.text("Departamento de Assistência Religiosa para Evangelização", 105, y, {
    align: "center",
  });

  y += 10;
  doc.line(MARGEM_ESQ, y, MARGEM_DIR, y);
  y += 12;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(FONT_SUBTITULO);
  doc.text("Relatório Atendimento DARPE", 105, y, { align: "center" });

  y += 10;
  doc.line(MARGEM_ESQ, y, MARGEM_DIR, y);
  y += 14;

  /* ================= FUNÇÃO LINHA ================= */
  function linha(label, valor) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(FONT_LABEL);
    doc.text(label, MARGEM_ESQ, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(FONT_TEXTO);
    doc.text(valor || "-", MARGEM_ESQ + 55, y);

    y += 9;

    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  }

  /* ================= DADOS PRINCIPAIS ================= */
  linha("DARPE Responsável:", dados.responsavel);
  linha("Local:", dados.local.nome);
  linha(
    "Programação:",
    `${dados.programacao.tipo} – ${dados.programacao.descricao}`,
  );
  const horarioLimpo = dados.programacao.horario.replace(/'/g, "");
  linha(
    "Data e Hora:",
    `${formatarData(dados.programacao.data)} – ${horarioLimpo}`,
  );
  if (dados.qtdInternos > 0) {
    linha("Qtd Internos:", String(dados.qtdInternos));
  }

  linha("Qtd Músicos:", String(dados.qtdColaboradores));

  /* ================= EVANGELIZAÇÃO ================= */
  if (dados.evangelizacao) {
    linha("Palavra:", dados.evangelizacao.palavra);
  }

  /* ================= OBSERVAÇÕES ================= */
  if (dados.observacoes?.trim()) {
    y += 4;
    doc.line(MARGEM_ESQ, y, MARGEM_DIR, y);
    y += 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(FONT_SUBTITULO);
    doc.text("Observações:", MARGEM_ESQ, y);
    y += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(FONT_TEXTO);

    const textoObs = doc.splitTextToSize(dados.observacoes, LARGURA_TEXTO);
    doc.text(textoObs, MARGEM_ESQ, y);
    y += textoObs.length * 6;

    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  }

  /* ================= COLABORADORES ================= */
  y += 6;
  doc.line(MARGEM_ESQ, y, MARGEM_DIR, y);
  y += 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(FONT_SUBTITULO);
  doc.text("Colaboradores DARPE", MARGEM_ESQ, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(FONT_TEXTO);

  if (!dados.colaboradores.length) {
    doc.text("Nenhum colaborador inscrito.", MARGEM_ESQ, y);
  } else {
    dados.colaboradores.forEach((c) => {
      const texto = c.instrumento ? `${c.nome} (${c.instrumento})` : c.nome;

      doc.text("• " + texto, MARGEM_ESQ + 2, y);
      y += 6;

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

  linhas.push("*RELATÓRIO DARPE*");
  linhas.push("_Atendimento de Evangelização_");
  linhas.push("");
  linhas.push(`▫️ *DARPE Responsável:* _${dados.responsavel}_`);
  linhas.push("_________________________________");
  linhas.push("");

  // 📍 DADOS GERAIS
  linhas.push("*📍 DADOS DO ATENDIMENTO*");
  linhas.push(`▫️ *Local:* _${dados.local?.nome || "-"}_`);
  linhas.push("");
  linhas.push(`▫️ *Data:* _${formatarData(dados.programacao?.data)}_`);
  linhas.push("");
  linhas.push(
    `▫️ *Horário:* _${dados.programacao?.horario?.replace(/'/g, "") || "-"}_`,
  );
  linhas.push("");
  linhas.push(
    `▫️ *Programação:* _${dados.programacao?.tipo} – ${dados.programacao?.descricao}_`,
  );
  linhas.push("");
  if (dados.qtdInternos > 0) {
    linhas.push(`▫️ *Qtd. Internos:* _${dados.qtdInternos}_`);
  }
  linhas.push("");
  linhas.push(`▫️ *Qtd. Músicos:* _${dados.qtdColaboradores}_`);
  linhas.push("");
  if (dados.evangelizacao?.palavra) {
    linhas.push(`▫️ *Evangelização:* _${dados.evangelizacao.palavra}_`);
  }

  // 👥 COLABORADORES
  if (dados.colaboradores?.length) {
    linhas.push("");
    linhas.push("_________________________________");
    linhas.push("*👥 VONLUNTÁRIOS DARPE*");

    dados.colaboradores.forEach((c) => {
      linhas.push(
        `• _${c.nome}${c.instrumento ? " (" + c.instrumento + ")" : ""}_`,
      );
    });
  }

  // 📝 OBSERVAÇÕES
  if (dados.observacoes?.trim()) {
    linhas.push("");
    linhas.push("_________________________________");
    linhas.push("*📝 OBSERVAÇÕES*");
    linhas.push("");
    linhas.push(`${dados.observacoes}`);
  }

  linhas.push("");
  linhas.push("_________________________________");
  linhas.push("_Relatório gerado automaticamente pelo sistema DARPE_");
  linhas.push("");
  linhas.push("Deus Abençoe a Todos");
  linhas.push("");
  linhas.push("");
  linhas.push("*Marcos 16:15  E disse-lhes:*");
  linhas.push("");
  linhas.push(" _Ide por todo o mundo e pregai o evangelho a toda criatura_");
  return encodeURIComponent(linhas.join("\n"));
}

function enviarWhatsAppRelatorio() {
  const dados = montarDadosRelatorio();
  if (!dados) return;

  const mensagem = gerarMensagemWhatsAppRelatorio(dados);

  const url = `https://api.whatsapp.com/send?text=${mensagem}`;
  window.open(url, "_blank");
}
