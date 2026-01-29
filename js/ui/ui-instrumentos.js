function abrirCrudInstrumentos() {
    setTitle("Admin • Instrumentos");
    // empilha navegação (voltar retorna pra área admin)
    navigateTo(renderCrudInstrumentos);
}

async function renderCrudInstrumentos() {
    conteudo.innerHTML = Ui.PainelInstrumentos();
    carregarInstrumentos();
}

async function carregarInstrumentos() {
    const lista = document.getElementById("listaInstrumentos");

    try {
        const data = await appScriptApi.bootstrap();

        let instrumentos = data.instrumentos || [];

        if (!instrumentos.length) {
            lista.innerHTML = `
        <div class="alert alert-secondary text-center">
          Nenhum instrumento cadastrado
        </div>
      `;
            return;
        }

        // 🔥 ORDENAÇÃO:
        // 1️⃣ Corda primeiro
        // 2️⃣ Sopro depois
        // 3️⃣ Ordem alfabética dentro de cada tipo
        instrumentos.sort((a, b) => {
            if (a.tipo !== b.tipo) {
                return a.tipo === "corda" ? -1 : 1;
            }
            return a.nome.localeCompare(b.nome, "pt-BR");
        });

        let html = `
      <div class="table-responsive rounded shadow-sm overflow-hidden">
        <table class="table table-bordered align-middle mb-0">
          <thead class="table-dark">
            <tr>
              <th>Nome</th>
              <th class="text-center">Tipo</th>
              <th class="text-center" width="120">Ações</th>
            </tr>
          </thead>
          <tbody>
    `;

        instrumentos.forEach((i) => {
            const tipoFormatado =
                i.tipo.charAt(0).toUpperCase() + i.tipo.slice(1) + "s";

            html += `
        <tr>
          <!-- NOME -->
          <td>${i.nome}</td>

          <!-- TIPO -->
          <td class="text-center">
            <span class="badge ${i.tipo === "corda" ? "bg-primary" : "bg-success"
                }">
              ${tipoFormatado}
            </span>
          </td>

          <!-- AÇÕES -->
          <td class="text-center">
            <button
              class="btn btn-sm btn-outline-dark me-1"
              onclick="editarInstrumento(${i.id}, this)">
              <i class="bi bi-pencil"></i>
            </button>

            <button
              class="btn btn-sm btn-outline-danger"
              onclick="excluirInstrumento(${i.id}, this)">
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
        Erro ao carregar instrumentos
      </div>
    `;
    }
}

async function abrirModalNovoInstrumento() {
    const nome = prompt("Nome do instrumento:");
    if (!nome) return;

    const tipo = prompt("Tipo do instrumento (corda ou sopro):");
    if (!tipo || !["corda", "sopro"].includes(tipo.toLowerCase())) {
        alert('Tipo inválido. Use "corda" ou "sopro".');
        return;
    }

    await criarInstrumento(nome.trim(), tipo.toLowerCase());
}

async function criarInstrumento(nome, tipo) {
    const res = post({
        entity: "instrumentos",
        action: "create",
        password: senhaDigitada,
        nome: nome,
        tipo: tipo,
    })

    const data = await res.json();

    if (data.error) {
        alert(data.error);
        return;
    }

    carregarInstrumentos();
}

async function editarInstrumento(id, btn) {
    const textoOriginal = btn.innerHTML;
    let salvou = false; // 🔑 FLAG

    try {
        // 🔄 spinner no ✏️
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span>`;

        const data = await appScriptApi.bootstrap();

        const instrumento = (data.instrumentos || []).find(i => i.id === id);

        if (!instrumento) {
            abrirModalAviso("Erro", "Instrumento não encontrado");
            btn.disabled = false;
            btn.innerHTML = textoOriginal;
            return;
        }

        document.getElementById("modalInstrumentoTitulo").innerText =
            "Editar Instrumento";

        document.getElementById("instrumentoId").value = instrumento.id;
        document.getElementById("instrumentoNome").value = instrumento.nome;
        marcarTipoRadio(instrumento.tipo);

        const modalEl = document.getElementById("modalInstrumento");
        const modal = new bootstrap.Modal(modalEl);

        // ❌ só restaura se NÃO salvou
        modalEl.addEventListener(
            "hidden.bs.modal",
            () => {
                if (!salvou) {
                    btn.disabled = false;
                    btn.innerHTML = textoOriginal;
                }
            },
            { once: true }
        );

        const btnSalvar = document.getElementById("btnSalvarInstrumento");
        btnSalvar.onclick = null;

        btnSalvar.onclick = async () => {
            const nome = document.getElementById("instrumentoNome").value.trim();
            const tipo = getTipoRadioSelecionado();

            if (!nome || !["corda", "sopro"].includes(tipo)) {
                abrirModalAviso(
                    "Aviso",
                    "Preencha corretamente nome e tipo do instrumento"
                );
                return;
            }

            const textoSalvar = btnSalvar.innerHTML;

            try {
                salvou = true; // ✅ MARCA QUE SALVOU

                btnSalvar.disabled = true;
                btnSalvar.innerHTML = `
          <span class="spinner-border spinner-border-sm me-2"></span>
          Salvando
        `;

                await appScriptApi.post({
                    entity: "instrumentos",
                    action: "update",
                    id,
                    password: senhaDigitada,
                    nome,
                    tipo,
                })

                modal.hide();

                // ⏳ spinner do ✏️ CONTINUA aqui
                await carregarInstrumentos();

                // ✅ só agora para o spinner
                btn.disabled = false;
                btn.innerHTML = textoOriginal;

            } catch (err) {
                console.error(err);
                abrirModalAviso("Erro", "Erro ao editar instrumento");
            } finally {
                btnSalvar.disabled = false;
                btnSalvar.innerHTML = textoSalvar;
            }
        };

        modal.show();

    } catch (err) {
        console.error(err);
        abrirModalAviso("Erro", "Erro ao carregar instrumento");
        btn.disabled = false;
        btn.innerHTML = textoOriginal;
    }
}

function excluirInstrumento(id, btnTrash) {
    document.getElementById("confirmTitle").innerText = "Excluir Instrumento";
    document.getElementById("confirmMessage").innerText =
        "Deseja realmente excluir este instrumento?";

    const btnOk = document.getElementById("confirmOk");
    btnOk.onclick = null;

    btnOk.onclick = async () => {
        const textoOk = btnOk.innerHTML;
        const textoTrash = btnTrash.innerHTML;

        try {
            // 🔄 spinner no OK
            btnOk.disabled = true;
            btnOk.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2"></span>
        Excluindo
      `;

            // 🔄 spinner no 🗑
            btnTrash.disabled = true;
            btnTrash.innerHTML = `
        <span class="spinner-border spinner-border-sm"></span>
      `;

            const data = await appScriptApi.post({
                entity: "instrumentos",
                action: "delete",
                id,
                password: senhaDigitada,
            });

            if (data.error) {
                abrirModalAviso("Erro", data.error);
                return;
            }

            bootstrap.Modal.getInstance(
                document.getElementById("confirmModal")
            ).hide();

            // ⏳ espera a tabela atualizar
            await carregarInstrumentos();

            // 🔙 só agora remove os spinners
            btnOk.disabled = false;
            btnOk.innerHTML = textoOk;

            btnTrash.disabled = false;
            btnTrash.innerHTML = textoTrash;

        } catch (err) {
            console.error(err);
            abrirModalAviso("Erro", "Erro de comunicação com o servidor");
        }
    };

    new bootstrap.Modal(
        document.getElementById("confirmModal")
    ).show();
}

function abrirModalNovoInstrumento() {
    document.getElementById("modalInstrumentoTitulo").innerText =
        "Novo Instrumento";

    document.getElementById("instrumentoId").value = "";
    document.getElementById("instrumentoNome").value = "";

    document
        .querySelectorAll('input[name="instrumentoTipo"]')
        .forEach((r) => (r.checked = false));

    document.getElementById("btnSalvarInstrumento").onclick = salvarInstrumento;

    new bootstrap.Modal(document.getElementById("modalInstrumento")).show();
}

async function salvarInstrumento() {
    const id = document.getElementById("instrumentoId").value;
    const nome = document.getElementById("instrumentoNome").value.trim();
    const tipo = getTipoRadioSelecionado();

    if (!nome || !tipo) {
        abrirModalAviso("Aviso", "Preencha todos os campos");
        return;
    }

    const payload = {
        entity: "instrumentos",
        password: senhaDigitada,
        nome,
        tipo,
    };

    if (id) {
        payload.action = "update";
        payload.id = Number(id);
    } else {
        payload.action = "create";
    }

    const btn = document.getElementById("btnSalvarInstrumento");
    const textoOriginal = btn.innerHTML;

    try {
        btn.disabled = true;
        btn.innerHTML = `
      <span class="spinner-border spinner-border-sm"></span> Salvando
    `;

        mostrarLoading("listaInstrumentos");

        const data = await appScriptApi.post(payload);

        if (data.error) {
            abrirModalAviso("Erro", data.error);
            return;
        }

        bootstrap.Modal.getInstance(
            document.getElementById("modalInstrumento"),
        ).hide();

        await carregarInstrumentos();
    } catch (err) {
        console.error(err);
        abrirModalAviso("Erro", "Erro ao salvar instrumento");
    } finally {
        btn.disabled = false;
        btn.innerHTML = textoOriginal;
    }
}