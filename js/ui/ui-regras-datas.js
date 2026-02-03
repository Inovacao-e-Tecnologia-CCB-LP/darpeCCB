async function abrirCrudRegrasDatas() {
    setTitle("Admin • Regras de Datas");
    conteudo.innerHTML = Ui.PainelRegrasDatas();
    carregarRegrasDatas();
}

async function carregarRegrasDatas() {
    const lista = document.getElementById("listaRegrasDatas");

    try {
        lista.innerHTML = `
      <div class="text-center my-4">
        <div class="spinner-border text-dark"></div>
      </div>
    `;

        const data = await regrasDatasService.listar();
        const regras = data || [];

        if (!regras.length) {
            lista.innerHTML = `
        <div class="alert alert-secondary text-center">
          Nenhuma regra cadastrada
        </div>
      `;
            return;
        }

        // Ordenar por Local e depois por Dia
        regras.sort((a, b) => {
            const localA = dataStore.locais.find(l => l.id == a.local_id)?.nome || "";
            const localB = dataStore.locais.find(l => l.id == b.local_id)?.nome || "";
            return localA.localeCompare(localB) || (a.dia_semana - b.dia_semana);
        });

        let html = `
      <div class="table-responsive rounded shadow-sm overflow-hidden">
        <table class="table table-bordered align-middle mb-0">
          <thead class="table-dark">
            <tr>
              <th>Local</th>
              <th>Tipo</th>
              <th>Quando</th>
              <th class="text-center">Horário</th>
              <th class="text-center">Status</th>
              <th class="text-center" width="120">Ações</th>
            </tr>
          </thead>
          <tbody>
    `;

        regras.forEach((r) => {
            const local = dataStore.locais.find(l => l.id == r.local_id);
            const nomeLocal = local ? local.nome : '<span class="text-danger">Local excluído</span>';
            const descricaoQuando = formatarQuando(r.dia_semana, r.ordinal);

            html += `
        <tr>
          <td>${nomeLocal}</td>
          <td>${r.tipo_visita}</td>
          <td>${descricaoQuando}</td>
          <td class="text-center">${formatarHorario(r.horario)}</td>
          <td class="text-center">
            ${r.ativo
                    ? '<span class="badge bg-success">Ativo</span>'
                    : '<span class="badge bg-secondary">Inativo</span>'}
          </td>
          <td class="text-center">
            <button class="btn btn-sm btn-outline-dark me-1"
              onclick="editarRegra(${r.id}, this)">
              <i class="bi bi-pencil"></i>
            </button>

            <button class="btn btn-sm btn-outline-danger"
              onclick="excluirRegra(${r.id}, this)">
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

        lista.innerHTML = html;

    } catch (err) {
        console.error(err);
        lista.innerHTML = `
      <div class="alert alert-danger text-center">
        Erro ao carregar regras
      </div>
    `;
    }
}

function formatarQuando(dia, ordinal) {
    const dias = ['', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    const nomeDia = dias[dia] || 'Dia?';

    if (Number(ordinal) === 0) return `Todas: ${nomeDia}`;
    if (Number(ordinal) === -1) return `Última ${nomeDia}`;
    return `${ordinal}ª ${nomeDia}`;
}

function abrirModalNovaRegra() {
    document.getElementById("modalRegraTitulo").innerText = "Nova Regra";
    document.getElementById("regraId").value = "";

    // Reset fields
    document.getElementById("regraTipo").value = "";
    document.getElementById("regraDiaSemana").value = "1";
    document.getElementById("regraOrdinal").value = "0";
    document.getElementById("regraHorario").value = "";
    document.getElementById("regraAtivo").checked = true;

    // Populate Locais
    const selectLocal = document.getElementById("regraLocal");
    selectLocal.innerHTML = '<option value="">Selecione...</option>';
    dataStore.locais.forEach(l => {
        const opt = document.createElement("option");
        opt.value = l.id;
        opt.text = l.nome;
        selectLocal.appendChild(opt);
    });

    document.getElementById("btnSalvarRegra").onclick = () => salvarRegra();
    new bootstrap.Modal(document.getElementById("modalRegra")).show();
}

async function editarRegra(id, btn) {
    const textoOriginal = btn.innerHTML;
    let salvou = false;

    try {
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span>`;

        const data = await regrasDatasService.listar();
        const regra = (data || []).find(r => Number(r.id) === Number(id));

        if (!regra) {
            abrirModalAviso("Erro", "Regra não encontrada");
            btn.disabled = false;
            btn.innerHTML = textoOriginal;
            return;
        }

        document.getElementById("modalRegraTitulo").innerText = "Editar Regra";
        document.getElementById("regraId").value = regra.id;
        document.getElementById("regraTipo").value = regra.tipo_visita;
        document.getElementById("regraDiaSemana").value = regra.dia_semana;
        document.getElementById("regraOrdinal").value = regra.ordinal;
        document.getElementById("regraHorario").value = formatarHorario(regra.horario);
        document.getElementById("regraAtivo").checked = regra.ativo;

        // Populate Locais
        const selectLocal = document.getElementById("regraLocal");
        selectLocal.innerHTML = '<option value="">Selecione...</option>';
        dataStore.locais.forEach(l => {
            const opt = document.createElement("option");
            opt.value = l.id;
            opt.text = l.nome;
            if (Number(l.id) === Number(regra.local_id)) opt.selected = true;
            selectLocal.appendChild(opt);
        });

        const modalEl = document.getElementById("modalRegra");
        const modal = new bootstrap.Modal(modalEl);

        modalEl.addEventListener("hidden.bs.modal", () => {
            if (!salvou) {
                btn.disabled = false;
                btn.innerHTML = textoOriginal;
            }
        }, { once: true });

        const btnSalvar = document.getElementById("btnSalvarRegra");
        btnSalvar.onclick = null;

        btnSalvar.onclick = async () => {
            await salvarRegra(modal, btn, textoOriginal);
            salvou = true;
        };

        await appScriptApi.bootstrap();

        modal.show();

    } catch (err) {
        console.error(err);
        abrirModalAviso("Erro", "Erro ao carregar regra");
        btn.disabled = false;
        btn.innerHTML = textoOriginal;
    }
}

async function salvarRegra(modalInstance = null, btnEdit = null, txtEdit = null) {
    if (modalInstance && typeof modalInstance.hide !== 'function') {
        modalInstance = null;
    }

    const id = document.getElementById("regraId").value;
    const localId = document.getElementById("regraLocal").value;
    const tipo = document.getElementById("regraTipo").value.trim();
    const dia = document.getElementById("regraDiaSemana").value;
    const ordinal = document.getElementById("regraOrdinal").value;
    const horario = document.getElementById("regraHorario").value;
    const ativo = document.getElementById("regraAtivo").checked;

    if (!localId || !tipo || !horario) {
        abrirModalAviso("Aviso", "Preencha todos os campos obrigatórios");
        return;
    }

    const payload = {
        entity: "regras-datas",
        password: senhaDigitada,
        local_id: Number(localId),
        tipo_visita: tipo,
        dia_semana: Number(dia),
        ordinal: Number(ordinal),
        horario: String(horario),
        ativo: ativo
    };

    if (id) {
        payload.action = "update";
        payload.id = Number(id);
    } else {
        payload.action = "create";
    }

    const btn = document.getElementById("btnSalvarRegra");
    const textoOriginal = btn.innerHTML;

    try {
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> Salvando`;

        if (!modalInstance) mostrarLoading("listaRegrasDatas");

        const data = payload.action === "create" ? 
        await regrasDatasService.criar(payload, senhaDigitada) :
        await regrasDatasService.atualizar(payload, senhaDigitada);

        if (data?.error) {
            abrirModalAviso("Erro", data.error);
            return;
        }

        if (modalInstance) {
            modalInstance.hide();
        } else {
            bootstrap.Modal.getInstance(document.getElementById("modalRegra")).hide();
        }

        await carregarRegrasDatas();

        if (btnEdit) {
            btnEdit.disabled = false;
            btnEdit.innerHTML = txtEdit;
        }

        await appScriptApi.bootstrap();

    } catch (err) {
        console.error(err);
        abrirModalAviso("Erro", "Erro ao salvar regra");
    } finally {
        btn.disabled = false;
        btn.innerHTML = textoOriginal;
    }
}

async function excluirRegra(id, btnTrash) {
    const textoOriginal = btnTrash.innerHTML;

    document.getElementById("confirmTitle").innerText = "Excluir Regra";
    document.getElementById("confirmMessage").innerText = "Deseja realmente excluir esta regra? A programação futura gerada por ela será removida.";

    const btnOk = document.getElementById("confirmOk");
    btnOk.onclick = null;

    btnOk.onclick = async () => {
        const textoOk = btnOk.innerHTML;

        try {
            btnOk.disabled = true;
            btnOk.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> Excluindo`;

            btnTrash.disabled = true;
            btnTrash.innerHTML = `<span class="spinner-border spinner-border-sm"></span>`;

            const data = await regrasDatasService.excluir(id, senhaDigitada)

            if (data?.error) {
                abrirModalAviso("Erro", data.error);
                return;
            }

            bootstrap.Modal.getInstance(document.getElementById("confirmModal")).hide();
            await carregarRegrasDatas();
            await appScriptApi.bootstrap();

        } catch (err) {
            console.error(err);
            abrirModalAviso("Erro", "Erro de comunicação com o servidor");
        } finally {
            btnOk.disabled = false;
            btnOk.innerHTML = textoOk;
            btnTrash.disabled = false;
            btnTrash.innerHTML = textoOriginal;
        }
    };

    new bootstrap.Modal(document.getElementById("confirmModal")).show();
}