/* =========================
   UI • PROGRAMAÇÕES — Calendário
========================= */

let _calMeses       = [];
let _calIdx         = 0;
let _calDados       = [];
/* ── Paleta vibrante por local ──────────────────────────── */
/* ── Cor fixa para locais "Hospital" ────────────────────── */
const _COR_HOSPITAL = {
  bg:     '#ffd6d6',   /* fundo célula calendário — vermelho bem claro   */
  border: '#8b0000',   /* borda/dot — vermelho sangue escuro              */
  dot:    '#8b0000',   /* bolinha da legenda                              */
  text:   '#5c0000',   /* texto nos cards de detalhe                     */
  bgCard: '#ffe4e4',   /* fundo card de detalhe — rosinha suave           */
};

const _CAL_PALETA = [
  { bg: '#fde8e8', border: '#c0392b', dot: '#c0392b', text: '#7b241c', bgCard: '#fff0f0' },
  { bg: '#d6eaf8', border: '#1a5276', dot: '#1a5276', text: '#0d2b3e', bgCard: '#eaf4fb' },
  { bg: '#d5f5e3', border: '#1e8449', dot: '#1e8449', text: '#145a32', bgCard: '#eafaf1' },
  { bg: '#f9e4b7', border: '#b7770d', dot: '#b7770d', text: '#784212', bgCard: '#fef9ec' },
  { bg: '#e8daef', border: '#6c3483', dot: '#6c3483', text: '#4a235a', bgCard: '#f5eef8' },
  { bg: '#d1f2eb', border: '#148f77', dot: '#148f77', text: '#0e6655', bgCard: '#e8f8f5' },
  { bg: '#fce4ec', border: '#ad1457', dot: '#ad1457', text: '#880e4f', bgCard: '#fce4ec' },
  { bg: '#fff3e0', border: '#e65100', dot: '#e65100', text: '#bf360c', bgCard: '#fff8f0' },
  { bg: '#e8eaf6', border: '#283593', dot: '#283593', text: '#1a237e', bgCard: '#ede7f6' },
  { bg: '#fbe9e7', border: '#bf360c', dot: '#bf360c', text: '#8d1c06', bgCard: '#fbe9e7' },
  { bg: '#e0f2f1', border: '#00695c', dot: '#00695c', text: '#004d40', bgCard: '#e0f7f4' },
  { bg: '#fff8e1', border: '#f57f17', dot: '#f57f17', text: '#e65100', bgCard: '#fff8e1' },
];

let _calCoresLocais = {}; // local_id (string) → objeto cor completo

function _carregarCoresSalvas() {
  try {
    const raw = localStorage.getItem('darpe_cores_locais');
    if (raw) _calCoresLocais = JSON.parse(raw);
  } catch { _calCoresLocais = {}; }
}

function _salvarCores() {
  try { localStorage.setItem('darpe_cores_locais', JSON.stringify(_calCoresLocais)); } catch {}
}

function _getCorLocal(localId) {
  const key = String(localId);

  // Força vermelho sangue em qualquer local cujo nome contenha "hospital"
  const localObj = (dataStore.locais || []).find(l => String(l.id) === key);
  const nomeLocal = (localObj?.nome || '').toLowerCase();
  if (nomeLocal.includes('hospital')) {
    _calCoresLocais[key] = { ..._COR_HOSPITAL };
    _salvarCores();
    return _calCoresLocais[key];
  }

  if (!_calCoresLocais[key]) {
    const usadas = new Set(Object.values(_calCoresLocais).map(c => c.dot));
    const livres = _CAL_PALETA.filter(c => !usadas.has(c.dot));
    const fonte  = livres.length ? livres : _CAL_PALETA;
    _calCoresLocais[key] = { ...fonte[Math.floor(Math.random() * fonte.length)] };
    _salvarCores();
  }
  return _calCoresLocais[key];
}

/* ── Entrada ───────────────────────────────────────────── */

async function abrirTelaProgramacoes() {
  setTitle("Programações");
  conteudo.innerHTML = Ui.PainelProgramacoes();
  carregarProgramacoes(true);
}

/* ── Carregamento ──────────────────────────────────────── */

async function carregarProgramacoes(firstTime = false) {
  travarUI();
  try {
    mostrarLoading("listaProgramacoes");

    let programacao = firstTime
      ? dataStore.programacao
      : await programacaoService.listar();

    if (programacao?.error) throw new Error(programacao.error);

    programacao           = programacao || [];
    dataStore.programacao = programacao;
    _calDados             = programacao;

    if (!programacao.length) {
      document.getElementById("listaProgramacoes").innerHTML = `
        <div class="alert alert-secondary text-center mt-3">
          Nenhuma programação cadastrada
        </div>`;
      return;
    }

    _carregarCoresSalvas();
    // Garante que todos os locais conhecidos tenham cor atribuída
    (dataStore.locais || []).forEach(l => _getCorLocal(l.id));
    programacao.forEach(p => _getCorLocal(p.local_id));

    _construirMeses(programacao);
    _calIdx = 0;
    _renderCalendario();

  } catch (err) {
    console.error(err);
    document.getElementById("listaProgramacoes").innerHTML = `
      <div class="alert alert-danger text-center mt-3">
        Erro ao carregar programações
      </div>`;
  } finally {
    liberarUI();
  }
}

/* ── Meses com programação ─────────────────────────────── */

function _construirMeses(programacao) {
  const map = new Map();
  programacao.forEach((p) => {
    if (!p.data) return;
    const d   = new Date(p.data + "T00:00:00");
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!map.has(key)) map.set(key, { ano: d.getFullYear(), mes: d.getMonth() });
  });
  _calMeses = Array.from(map.values()).sort((a, b) =>
    a.ano !== b.ano ? a.ano - b.ano : a.mes - b.mes
  );
}

/* ── Render principal ──────────────────────────────────── */

function _renderCalendario() {
  const container = document.getElementById("listaProgramacoes");
  if (!_calMeses.length) return;

  const { ano, mes } = _calMeses[_calIdx];
  const temAnterior  = _calIdx > 0;
  const temProximo   = _calIdx < _calMeses.length - 1;

  const pgMes = _calDados.filter((p) => {
    if (!p.data) return false;
    const d = new Date(p.data + "T00:00:00");
    return d.getFullYear() === ano && d.getMonth() === mes;
  });

  const porDia = {};
  pgMes.forEach((p) => {
    const dia = parseInt(p.data.split("-")[2], 10);
    if (!porDia[dia]) porDia[dia] = [];
    porDia[dia].push(p);
  });

  const nomeMes = new Date(ano, mes, 1).toLocaleDateString("pt-BR", {
    month: "long", year: "numeric"
  });

  container.innerHTML = `
    <div class="cal-wrapper">

      <div class="cal-nav">
        <button class="cal-nav-btn" ${!temAnterior ? "disabled" : ""} onclick="_calNavegar(-1)">
          <i class="bi bi-chevron-left"></i>
        </button>
        <div class="cal-mes-titulo">
          <span class="cal-mes-nome">${_capitalizar(nomeMes)}</span>
          <span class="cal-mes-badge">${pgMes.length} evento${pgMes.length !== 1 ? "s" : ""}</span>
        </div>
        <button class="cal-nav-btn" ${!temProximo ? "disabled" : ""} onclick="_calNavegar(1)">
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>

      ${_renderMiniNav()}

      <div class="cal-grid-wrapper" id="calGridWrapper">
        ${_renderGrade(ano, mes, porDia)}
      </div>

      ${_renderLegenda()}

    </div>
  `;
}

/* ── Legenda dinâmica por local ────────────────────────── */

function _renderLegenda() {
  // Pega apenas os locais que têm programação no mês atual
  const { ano, mes } = _calMeses[_calIdx];
  const locaisNoMes  = new Set(
    _calDados
      .filter(p => {
        if (!p.data) return false;
        const d = new Date(p.data + "T00:00:00");
        return d.getFullYear() === ano && d.getMonth() === mes;
      })
      .map(p => p.local_id)
  );

  if (!locaisNoMes.size) return "";

  const items = Array.from(locaisNoMes).map((localId) => {
    const local = dataStore.locais?.find(l => l.id == localId);
    const cor   = _getCorLocal(localId);
    const nome  = local?.nome || `Local ${localId}`;
    return `<span class="cal-leg-item">
      <span class="cal-leg-dot" style="background:${cor.dot}"></span>${nome}
    </span>`;
  }).join("");

  return `<div class="cal-legenda">${items}</div>`;
}

/* ── Mini nav de meses ─────────────────────────────────── */

function _renderMiniNav() {
  if (_calMeses.length <= 1) return "";
  const pills = _calMeses.map((m, i) => {
    const nome  = new Date(m.ano, m.mes, 1).toLocaleDateString("pt-BR", { month: "short" });
    const ativo = i === _calIdx ? "cal-pill-ativo" : "";
    return `<button class="cal-pill ${ativo}" onclick="_calIrPara(${i})">${_capitalizar(nome)}</button>`;
  }).join("");
  return `<div class="cal-pills">${pills}</div>`;
}

/* ── Grade ─────────────────────────────────────────────── */

function _renderGrade(ano, mes, porDia) {
  const diasSemana  = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const primeiroDia = new Date(ano, mes, 1).getDay();
  const totalDias   = new Date(ano, mes + 1, 0).getDate();
  const hoje        = new Date();
  const ehHoje      = (d) =>
    hoje.getFullYear() === ano && hoje.getMonth() === mes && hoje.getDate() === d;

  let html = `<div class="cal-grid">`;

  diasSemana.forEach((d, i) => {
    const fds = (i === 0 || i === 6) ? "cal-fds" : "";
    html += `<div class="cal-header-dia ${fds}">${d}</div>`;
  });

  for (let i = 0; i < primeiroDia; i++) {
    html += `<div class="cal-cell cal-vazia"></div>`;
  }

  for (let dia = 1; dia <= totalDias; dia++) {
    const eventos   = porDia[dia] || [];
    const temEvento = eventos.length > 0;
    const diaSemana = (primeiroDia + dia - 1) % 7;
    const fds       = (diaSemana === 0 || diaSemana === 6) ? "cal-fds" : "";
    const hojeClass = ehHoje(dia) ? "cal-hoje" : "";
    const cursor    = temEvento ? "cal-clicavel" : "";

    // Cor da célula: cor do primeiro local do dia;
    // se tiver múltiplos locais distintos, fundo neutro
    let estiloCelula = "";
    if (temEvento) {
      const locaisUnicos = [...new Set(eventos.map(e => e.local_id))];
      if (locaisUnicos.length === 1) {
        const cor = _getCorLocal(locaisUnicos[0]);
        estiloCelula = `background:${cor.bg}; border-color:${cor.border};`;
      } else {
        estiloCelula = `background:#f8f9fa; border-color:#6c757d;`;
      }
    }

    // Pílulas: bolinhas no mobile, barras com nome no desktop
    let pilulasHtml = "";
    if (temEvento) {
      const MAX = 3;
      eventos.slice(0, MAX).forEach((ev) => {
        const cor      = _getCorLocal(ev.local_id);
        const local    = dataStore.locais?.find(l => l.id == ev.local_id);
        const nome     = local?.nome || "Local";
        pilulasHtml += `<span class="cal-ev-pill" style="background:${cor.dot}" data-nome="${nome}"></span>`;
      });
      if (eventos.length > MAX) {
        pilulasHtml += `<span class="cal-ev-mais">+${eventos.length - MAX}</span>`;
      }
    }

    const enc   = encodeURIComponent(JSON.stringify(eventos));
    const click = temEvento ? `onclick="_abrirDetalhesDia(${dia}, decodeURIComponent('${enc}'))"` : "";

    html += `
      <div class="cal-cell ${fds} ${hojeClass} ${temEvento ? "cal-tem-evento" : ""} ${cursor}"
        style="${estiloCelula}" ${click}>
        <span class="cal-num">${dia}</span>
        <div class="cal-ev-pills">${pilulasHtml}</div>
      </div>`;
  }

  html += `</div>`;
  return html;
}

/* ── Navegação ─────────────────────────────────────────── */

function _calNavegar(delta) {
  const novo = _calIdx + delta;
  if (novo < 0 || novo >= _calMeses.length) return;
  _calIdx = novo;
  _renderCalendario();
  requestAnimationFrame(() => {
    const w = document.getElementById("calGridWrapper");
    if (w) {
      w.classList.add(delta > 0 ? "cal-anim-esq" : "cal-anim-dir");
      setTimeout(() => w.classList.remove("cal-anim-esq", "cal-anim-dir"), 380);
    }
  });
}

function _calIrPara(idx) {
  if (idx === _calIdx) return;
  const delta = idx > _calIdx ? 1 : -1;
  _calIdx     = idx;
  _renderCalendario();
  requestAnimationFrame(() => {
    const w = document.getElementById("calGridWrapper");
    if (w) {
      w.classList.add(delta > 0 ? "cal-anim-esq" : "cal-anim-dir");
      setTimeout(() => w.classList.remove("cal-anim-esq", "cal-anim-dir"), 380);
    }
  });
}

/* ── Modal detalhes do dia ─────────────────────────────── */

function _abrirDetalhesDia(dia, eventosJson) {
  const eventos = JSON.parse(eventosJson);
  const { ano, mes } = _calMeses[_calIdx];

  const dataFmt = new Date(ano, mes, dia).toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

  const eventosHtml = eventos.map((p) => {
    const local    = dataStore.locais?.find((l) => l.id == p.local_id);
    const tipo     = p.tipo_visita || "-";
    const isMusica = tipo.toLowerCase().includes("mús") || tipo.toLowerCase().includes("mus");
    const tipoIcon = isMusica ? "music-note-beamed" : "book";
    const vest     = isMusica ? "Camisa branca e calça preta" : "Terno";
    const vestIcon = isMusica ? "person-arms-up" : "person-standing";
    const cor      = _getCorLocal(p.local_id);

    return `
      <div class="cal-det-card" style="background:${cor.bgCard}; border:1.5px solid ${cor.border};">
        <div class="cal-det-tipo" style="color:${cor.text}; border-bottom:1px solid ${cor.border}55;">
          <span class="cal-det-local-dot" style="background:${cor.dot}"></span>
          <strong>${local?.nome || "Local não identificado"}</strong>
        </div>
        <div class="cal-det-infos">
          <div class="cal-det-row">
            <i class="bi bi-${tipoIcon}" style="color:${cor.dot}"></i>
            <span>${tipo}</span>
          </div>
          <div class="cal-det-row">
            <i class="bi bi-clock-fill" style="color:${cor.dot}"></i>
            <span>${formatarHorario(p.horario) || "-"}</span>
          </div>
          <div class="cal-det-row">
            <i class="bi bi-calendar-week-fill" style="color:${cor.dot}"></i>
            <span>${p.descricao || "-"}</span>
          </div>
          <div class="cal-det-row cal-det-vestimenta" style="background:${cor.dot}18;">
            <i class="bi bi-${vestIcon}" style="color:${cor.dot}"></i>
            <span><strong>Traje:</strong> ${vest}</span>
          </div>
        </div>
        <button class="btn btn-outline-danger btn-sm w-100 mt-3"
          onclick="_excluirDoCalendario(${p.id}, this)">
          <i class="bi bi-trash me-1"></i>Excluir programação
        </button>
      </div>`;
  }).join("");

  document.getElementById("calDetData").innerHTML =
    `<i class="bi bi-calendar3 me-2"></i>${_capitalizar(dataFmt)}`;
  document.getElementById("calDetBody").innerHTML = eventosHtml;

  new bootstrap.Modal(document.getElementById("modalCalDetalhe")).show();
}

/* ── Utilitário ────────────────────────────────────────── */

function _capitalizar(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
}

/* ── Excluir do calendário ─────────────────────────────── */

function _excluirDoCalendario(id, btn) {
  const modalDet = bootstrap.Modal.getInstance(document.getElementById("modalCalDetalhe"));
  if (modalDet) modalDet.hide();
  document.getElementById("modalCalDetalhe").addEventListener("hidden.bs.modal", function once() {
    document.getElementById("modalCalDetalhe").removeEventListener("hidden.bs.modal", once);
    excluirProgramacao(id, btn);
  }, { once: true });
}

/* ── Excluir (mantido) ─────────────────────────────────── */

function excluirProgramacao(id, btnTrash) {
  document.getElementById("confirmTitle").innerText   = "Excluir Programação";
  document.getElementById("confirmMessage").innerText = "Deseja realmente excluir esta programação?";

  const btnOk = document.getElementById("confirmOk");
  btnOk.onclick = async () => {
    const textoOk    = btnOk.innerHTML;
    const textoTrash = btnTrash.innerHTML;
    _travarModal("confirmModal");
    try {
      btnOk.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> Excluindo`;
      const signal = _getModalSignal("confirmModal");
      const r      = await programacaoService.excluir(id, senhaDigitada, signal);
      if (signal.aborted) return;
      if (r?.error) { abrirModalAviso("Aviso", r.error); return; }
      abrirModalAviso("Sucesso", "Programação excluída com sucesso!");
      await carregarProgramacoes();
    } catch (err) {
      if (err?.name === "AbortError") return;
      abrirModalAviso("Erro", "Erro ao excluir programação.");
    } finally {
      _liberarModal("confirmModal");
      btnOk.innerHTML    = textoOk;
      btnTrash.innerHTML = textoTrash;
      bootstrap.Modal.getInstance(document.getElementById("confirmModal")).hide();
    }
  };
  new bootstrap.Modal(document.getElementById("confirmModal")).show();
}
