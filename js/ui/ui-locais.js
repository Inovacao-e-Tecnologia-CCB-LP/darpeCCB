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

    const data = await appScriptApi.action({ action: 'view', entity: 'locais' });

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


function montarEndereco() {
  const rua = document.getElementById("localRua").value.trim();
  const numero = document.getElementById("localNumero").value.trim();
  const bairro = document.getElementById("localBairro").value.trim();

  if (!rua || !numero || !bairro) return "";

  return `R. ${rua}, ${numero}, ${bairro}`;
}



function abrirModalNovoLocal() {
  document.getElementById("modalLocalTitulo").innerText = "Novo Local";

  document.getElementById("localId").value = "";
  document.getElementById("localNome").value = "";

  document.getElementById("localRua").value = "";
  document.getElementById("localNumero").value = "";
  document.getElementById("localBairro").value = "";

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
  const rua = document.getElementById("localRua").value.trim();
  const numero = document.getElementById("localNumero").value.trim();
  const bairro = document.getElementById("localBairro").value.trim();

  if (!nome || !limite || !rua || !numero || !bairro) {
    abrirModalAviso("Aviso", "Preencha todos os campos corretamente");
    return;
  }

  const endereco = `R. ${rua}, ${numero}, ${bairro}`;

  const res = await appScriptApi.post({
    entity: "locais",
    action: "create",
    password: senhaDigitada,
    nome,
    tipo,
    permite_cordas,
    permite_sopros,
    limite,
    endereco
  });

  if (res?.error) {
    abrirModalAviso("Erro", res.error);
    return;
  }

  reloadLocais();
}


async function editarLocal(id, btn) {
  const textoOriginal = btn.innerHTML;
  let salvou = false;

  try {
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span>`;

    const data = await appScriptApi.action({
      entity: "locais",
      action: "view"
    });

    const local = (data || []).find(i => Number(i.id) === Number(id));

    if (!local) {
      abrirModalAviso("Erro", "Local não encontrado");
      btn.disabled = false;
      btn.innerHTML = textoOriginal;
      return;
    }

    document.getElementById("modalLocalTitulo").innerText = "Editar Local";
    document.getElementById("localId").value = local.id;
    document.getElementById("localNome").value = local.nome;
    document.getElementById("localLimite").value = local.limite;

    const radioCordas = document.querySelector(
      `input[name="permiteCordas"][value="${local.permite_cordas}"]`
    );
    if (radioCordas) radioCordas.checked = true;

    const radioSopros = document.querySelector(
      `input[name="permiteSopros"][value="${local.permite_sopros}"]`
    );
    if (radioSopros) radioSopros.checked = true;

    // 👉 PREENCHE ENDEREÇO
    if (local.endereco) {
      const partes = local.endereco.replace("R. ", "").split(",");

      document.getElementById("localRua").value = partes[0]?.trim() || "";
      document.getElementById("localNumero").value = partes[1]?.trim() || "";
      document.getElementById("localBairro").value = partes[2]?.trim() || "";
    }

    const modalEl = document.getElementById("modalLocal");
    const modal = new bootstrap.Modal(modalEl);

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
      const limite = document.getElementById("localLimite").value;
      const permiteCordas = document.querySelector('input[name="permiteCordas"]:checked')?.value;
      const permiteSopros = document.querySelector('input[name="permiteSopros"]:checked')?.value;

      const rua = document.getElementById("localRua").value.trim();
      const numero = document.getElementById("localNumero").value.trim();
      const bairro = document.getElementById("localBairro").value.trim();

      if (!nome || !limite || !rua || !numero || !bairro || permiteCordas === undefined || permiteSopros === undefined) {
        const modalLocal = bootstrap.Modal.getInstance(
          document.getElementById("modalLocal")
        );
        modalLocal.hide();
        await abrirModalAviso(
          "Aviso",
          "Preencha corretamente todos os campos"
        ).then(() => modalLocal.show());
        return
      }

      const endereco = `R. ${rua}, ${numero}, ${bairro}`;
      const textoSalvar = btnSalvar.innerHTML;

      try {
        salvou = true;

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
          limite,
          endereco
        });

        modal.hide();

        reloadLocais();

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






async function excluirLocal(id, btnTrash) {

  const textoOriginal = btnTrash.innerHTML;

  // 🟡 modal de confirmação
  document.getElementById("confirmTitle").innerText = "Excluir Local";
  document.getElementById("confirmMessage").innerText =
    "Deseja realmente excluir este local?";

  const btnOk = document.getElementById("confirmOk");
  btnOk.onclick = null;

  btnOk.onclick = async () => {
    const textoOk = btnOk.innerHTML;

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
        password: senhaDigitada
      });

      // 🚫 BLOQUEADO PELO BACK
      if (data?.error) {
        throw new Error(data.error)
      }

      reloadLocais();
    } catch (err) {
      console.error(err);
      abrirModalAviso("Não foi possível excluir", err.message);
    } finally {
      bootstrap.Modal.getInstance(
        document.getElementById("confirmModal")
      ).hide();

      btnOk.disabled = false;
      btnOk.innerHTML = textoOk;

      btnTrash.disabled = false;
      btnTrash.innerHTML = textoOriginal;
    }
  };

  new bootstrap.Modal(
    document.getElementById("confirmModal")
  ).show();
}




async function salvarLocal() {
  const id = document.getElementById("localId").value;

  const nome = document.getElementById("localNome").value.trim();
  const limite = document.getElementById("localLimite").value;

  const permiteCordas = document.querySelector(
    'input[name="permiteCordas"]:checked'
  )?.value;

  const permiteSopros = document.querySelector(
    'input[name="permiteSopros"]:checked'
  )?.value;

  const rua = document.getElementById("localRua").value.trim();
  const numero = document.getElementById("localNumero").value.trim();
  const bairro = document.getElementById("localBairro").value.trim();

  if (
    !nome ||
    !limite ||
    !rua ||
    !numero ||
    !bairro ||
    permiteCordas === undefined ||
    permiteSopros === undefined
  ) {
    const modalLocal = bootstrap.Modal.getInstance(
      document.getElementById("modalLocal")
    );
    modalLocal.hide();
    await abrirModalAviso(
      "Aviso",
      "Preencha corretamente todos os campos"
    ).then(() => modalLocal.show());
    return
  }

  const endereco = `R. ${rua}, ${numero}, ${bairro}`;

  const payload = {
    entity: "locais",
    password: senhaDigitada,
    nome,
    permite_cordas: permiteCordas,
    permite_sopros: permiteSopros,
    limite,
    endereco
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
      <span class="spinner-border spinner-border-sm me-2"></span>
      Salvando
    `;

    mostrarLoading("listaLocais");

    const data = await appScriptApi.post(payload);

    if (data?.error) {
      abrirModalAviso("Erro", data.error);
      return;
    }

    bootstrap.Modal.getInstance(
      document.getElementById("modalLocal")
    ).hide();

    reloadLocais();

  } catch (err) {
    console.error(err);
    abrirModalAviso("Erro", "Erro ao salvar local");
  } finally {
    btn.disabled = false;
    btn.innerHTML = textoOriginal;
  }
}

async function reloadLocais() {
  carregarLocais();
  dataStore = await appScriptApi.bootstrap();
}