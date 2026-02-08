/* =========================
   UI • PROGRAMAÇÕES
========================= */

async function abrirTelaProgramacoes() {
  setTitle("Programações");
  conteudo.innerHTML = Ui.PainelProgramacoes();
  carregarProgramacoes((firstTime = true));
}

/* =========================
   LISTAGEM
========================= */

async function carregarProgramacoes(firstTime = false) {
  const lista = document.getElementById("listaProgramacoes");

  try {
    mostrarLoading("listaProgramacoes");

    let programacao = firstTime
      ? dataStore.programacao
      : await programacaoService.listar();

    if (programacao?.error) {
      throw new Error(programacao.error);
    }

    programacao = programacao || [];
    dataStore.programacao = programacao;

    if (!programacao.length) {
      lista.innerHTML = `
        <div class="alert alert-secondary text-center">
          Nenhuma programação cadastrada
        </div>
      `;
      return;
    }

    if (isMobile()) {
      renderCardsProgramacoes(programacao);
    } else {
      renderTabelaProgramacoes(programacao);
    }
  } catch (err) {
    console.error(err);
    lista.innerHTML = `
      <div class="alert alert-danger text-center">
        Erro ao carregar programações
      </div>
    `;
  }
}

function renderTabelaProgramacoes(programacao) {
  let html = `
    <div class="table-responsive rounded shadow-sm overflow-hidden">
      <table class="table table-bordered align-middle mb-0">
        <thead class="table-dark">
          <tr>
            <th>Local</th>
            <th>Tipo</th>
            <th>Dia(Semana)</th>
            <th>Data</th>
            <th>Horário</th>
            <th class="text-center" width="90">Ações</th>
          </tr>
        </thead>
        <tbody>
  `;

  programacao.forEach((p) => {
    const local = dataStore.locais?.find((l) => l.id == p.local_id);

    html += `
      <tr>
        <td>${local?.nome || "-"}</td>
        <td>${p.tipo_visita}</td>
        <td>${p.descricao}</td>
        <td>${formatarData(p.data)}</td>
        <td>${formatarHorario(p.horario)}</td>
        <td class="text-center">
          <button class="btn btn-sm btn-outline-danger excluir-btn"
            onclick="excluirProgramacao(${p.id}, this)">
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

  document.getElementById("listaProgramacoes").innerHTML = html;
}

function renderCardsProgramacoes(programacao) {
  let html = `<div class="d-grid gap-3">`;

  programacao.forEach((p) => {
    const local = dataStore.locais?.find((l) => l.id == p.local_id);

    html += `
      <div class="card shadow-sm">
        <div class="modal-header bg-dark text-white rounded-top p-2">
          <h5 class="card-title mt-0 mb-0">${local?.nome || "Local não identificado"}</h5>
        </div>

        <div class="card-body">
          <p class="mb-1"><strong>
          Tipo:
          ${p.tipo_visita}
          </strong>
          </p>
          <p class="mb-1 text-muted">Dia(Semana): ${p.descricao}</p>
          <p class="mb-2"> 
          <i class="bi bi-calendar"></i>
          ${formatarData(p.data)}
          </p>
          <p class="mb-2"> 
          <i class="bi bi-clock"></i>
          ${formatarHorario(p.horario)}
          </p>

            <button class="btn btn-sm btn-outline-danger w-100"
            onclick="excluirProgramacao(${p.id}, this)">
            <i class="bi bi-trash"></i> Excluir
          </button>
        </div>
      </div>
    `;
  });

  html += `</div>`;

  document.getElementById("listaProgramacoes").innerHTML = html;
}

/* =========================
   EXCLUIR
========================= */

function excluirProgramacao(id, btnTrash) {
  document.getElementById("confirmTitle").innerText = "Excluir Programação";

  document.getElementById("confirmMessage").innerText =
    "Deseja realmente excluir esta programação?";

  const btnOk = document.getElementById("confirmOk");

  btnOk.onclick = async () => {
    const textoOk = btnOk.innerHTML;
    const textoTrash = btnTrash.innerHTML;

    try {
      btnOk.disabled = true;
      btnTrash.disabled = true;

      btnOk.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2"></span>
        Excluindo
      `;

      const r = await programacaoService.excluir(id, senhaDigitada);

      if (r?.error) {
        abrirModalAviso("Aviso", r.error);
        return;
      }

      abrirModalAviso("Sucesso", "Programação excluída com sucesso!");
      
      await carregarProgramacoes();
    } catch (err) {
      console.error(err);
      abrirModalAviso("Erro", "Erro ao excluir programação");
    } finally {
      btnOk.disabled = false;
      btnTrash.disabled = false;
      btnOk.innerHTML = textoOk;
      btnTrash.innerHTML = textoTrash;

      bootstrap.Modal.getInstance(
        document.getElementById("confirmModal"),
      ).hide();
    }
  };

  new bootstrap.Modal(document.getElementById("confirmModal")).show();
}
