async function abrirCrudLocais() {
  setTitle("Admin • Locais");
  conteudo.innerHTML = Ui.PainelLocais();
  carregarLocais();
}

async function carregarLocais() {
  const lista = document.getElementById("listaLocais");

  try {
    lista.innerHTML = `
      <div class="text-center my-4">
        <div class="spinner-border text-dark"></div>
      </div>
    `;

    const data = await appScriptApi.post({ entity: 'locais', action: 'view' })

    const locais = data || [];

    console.log(locais)

    if (!locais.length) {
      lista.innerHTML = `
        <div class="alert alert-secondary text-center">
          Nenhum local cadastrado
        </div>
      `;
      return;
    }

    let html = `
      <div class="table-responsive rounded shadow-sm overflow-hidden">
        <table class="table table-bordered align-middle mb-0">
          <thead class="table-dark">
            <tr>
              <th>Nome</th>
              <th class="text-center">Cordas</th>
              <th class="text-center">Sopros</th>
              <th class="text-center">Limite</th>
              <th class="text-center" width="120">Ações</th>
            </tr>
          </thead>
          <tbody>
    `;

    locais.forEach((l) => {
      html += `
        <tr>
          <td>${l.nome}</td>

          <td class="text-center">
            ${l.permite_cordas
          ? '<i class="bi bi-check-circle-fill text-success"></i>'
          : '<i class="bi bi-x-circle-fill text-danger"></i>'
        }
          </td>

          <td class="text-center">
            ${l.permite_sopros
          ? '<i class="bi bi-check-circle-fill text-success"></i>'
          : '<i class="bi bi-x-circle-fill text-danger"></i>'
        }
          </td>

          <td class="text-center">${l.limite}</td>

          <td class="text-center">
            <button class="btn btn-sm btn-outline-dark me-1"
              onclick="editarLocal(${l.id}, this)">
              <i class="bi bi-pencil"></i>
            </button>

            <button class="btn btn-sm btn-outline-danger"
              onclick="excluirLocal(${l.id}, this)">
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
        Erro ao carregar locais
      </div>
    `;
  }
}

function abrirModalNovoLocal() {
  document.getElementById("modalLocalTitulo").innerText =
    "Novo Local";

  document.getElementById("localId").value = "";
  document.getElementById("localNome").value = "";

  document
    .querySelectorAll('input[name="permiteCordas"]')
    .forEach((r) => (r.checked = false));
  document
    .querySelectorAll('input[name="permiteSopros"]')
    .forEach((r) => (r.checked = false));

  document.getElementById("localLimite").value = 0;

  document.getElementById("btnSalvarLocal").onclick = salvarLocal;

  new bootstrap.Modal(document.getElementById("modalLocal")).show();
}

async function criarLocal(nome, tipo, permite_cordas, permite_sopros, limite) {
  const res = post({
    entity: "locais",
    action: "create",
    password: senhaDigitada,
    nome: nome,
    tipo: tipo,
    permite_cordas: permite_cordas,
    permite_sopros: permite_sopros,
    limite: limite
  })

  const data = await res.json();

  if (data.error) {
    alert(data.error);
    return;
  }

  carregarLocais();
}

async function editarLocal(id, btn) {
  const textoOriginal = btn.innerHTML;
  let salvou = false; // 🔑 FLAG

  try {
    // 🔄 spinner no ✏️
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span>`;

    const data = await appScriptApi.post({ entity: 'locais', action: 'view' });

    const local = (data || []).find(i => i.id === id);

    if (!local) {
      abrirModalAviso("Erro", "Local não encontrado");
      btn.disabled = false;
      btn.innerHTML = textoOriginal;
      return;
    }

    document.getElementById("modalLocalTitulo").innerText =
      "Editar Local";

    document.getElementById("localId").value = local.id;
    document.getElementById("localNome").value = local.nome;
    const radioCordas = document.querySelector(
      `input[name="permiteCordas"][value="${local.permite_cordas}"]`,
    );
    if (radioCordas) radioCordas.checked = true;
    const radioSopros = document.querySelector(
      `input[name="permiteSopros"][value="${local.permite_sopros}"]`,
    );
    if (radioSopros) radioSopros.checked = true;
    document.getElementById("localLimite").value = local.limite;

    const modalEl = document.getElementById("modalLocal");
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

    const btnSalvar = document.getElementById("btnSalvarLocal");
    btnSalvar.onclick = null;

    btnSalvar.onclick = async () => {
      const nome = document.getElementById("localNome").value.trim();
      const permiteCordas = document.querySelector('input[name="permiteCordas"]:checked').value;
      const permiteSopros = document.querySelector('input[name="permiteSopros"]:checked').value;
      const limite = document.getElementById("localLimite").value;

      if (!nome || !limite || permiteCordas === undefined || permiteSopros === undefined) {
        abrirModalAviso(
          "Aviso",
          "Preencha corretamente os campos"
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
          entity: "locais",
          action: "update",
          id,
          password: senhaDigitada,
          nome,
          permite_cordas: permiteCordas,
          permite_sopros: permiteSopros,
          limite
        })

        modal.hide();

        // ⏳ spinner do ✏️ CONTINUA aqui
        await carregarLocais();

        // ✅ só agora para o spinner
        btn.disabled = false;
        btn.innerHTML = textoOriginal;

      } catch (err) {
        console.error(err);
        abrirModalAviso("Erro", "Erro ao editar local");
      } finally {
        btnSalvar.disabled = false;
        btnSalvar.innerHTML = textoSalvar;
      }
    };

    modal.show();

  } catch (err) {
    console.error(err);
    abrirModalAviso("Erro", "Erro ao carregar local");
    btn.disabled = false;
    btn.innerHTML = textoOriginal;
  }
}

function excluirLocal(id, btnTrash) {
  document.getElementById("confirmTitle").innerText = "Excluir Local";
  document.getElementById("confirmMessage").innerText =
    "Deseja realmente excluir este local?";

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
        entity: "locais",
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
      await carregarLocais();

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



async function salvarLocal() {
  const id = document.getElementById("localId").value;
  const nome = document.getElementById("localNome").value.trim();
  const permiteCordas = document.querySelector('input[name="permiteCordas"]:checked').value;
  const permiteSopros = document.querySelector('input[name="permiteSopros"]:checked').value;
  const limite = document.getElementById("localLimite").value;

  if (!nome || !limite || permiteCordas === undefined || permiteSopros === undefined) {
    abrirModalAviso(
      "Aviso",
      "Preencha corretamente os campos"
    );
    return;
  }

  const payload = {
    entity: "locais",
    password: senhaDigitada,
    nome,
    permite_cordas: permiteCordas,
    permite_sopros: permiteSopros,
    limite
  };

  if (id) {
    payload.action = "update";
    payload.id = Number(id);
  } else {
    payload.action = "create";
  }

  const btn = document.getElementById("btnSalvarLocal");
  const textoOriginal = btn.innerHTML;

  try {
    btn.disabled = true;
    btn.innerHTML = `
      <span class="spinner-border spinner-border-sm"></span> Salvando
    `;

    mostrarLoading("listaLocais");

    const data = await appScriptApi.post(payload);

    if (data.error) {
      abrirModalAviso("Erro", data.error);
      return;
    }

    bootstrap.Modal.getInstance(
      document.getElementById("modalLocal"),
    ).hide();

    await carregarLocais();
  } catch (err) {
    console.error(err);
    abrirModalAviso("Erro", "Erro ao salvar local");
  } finally {
    btn.disabled = false;
    btn.innerHTML = textoOriginal;
  }
}