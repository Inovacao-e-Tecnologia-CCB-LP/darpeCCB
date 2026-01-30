let senhaDigitada = "";
let isAdmin = false;

function abrirModalAdmin() {
  document.getElementById("senhaAdmin").value = "";
  document.getElementById("erroSenha").classList.add("d-none");

  const modal = new bootstrap.Modal(document.getElementById("modalAdmin"));
  modal.show();
}

async function validarSenhaAdmin() {
  senhaDigitada = document.getElementById("senhaAdmin").value;
  const erro = document.getElementById("erroSenha");

  const btn = document.getElementById("btnEntrarAdmin");
  const textoBtn = document.getElementById("textoBtnAdmin");
  const spinner = document.getElementById("spinnerBtnAdmin");

  erro.classList.add("d-none");

  // loading
  btn.disabled = true;
  textoBtn.classList.add("d-none");
  spinner.classList.remove("d-none");

  try {
    const data = await appScriptApi.post({
      action: "auth",
      password: senhaDigitada,
    })

    if (data.success === true) {
      isAdmin = true;

      const modalEl = document.getElementById("modalAdmin");
      bootstrap.Modal.getInstance(modalEl).hide();

      navigateTo(mostrarAdmin);
    } else {
      erro.classList.remove("d-none");
    }
  } catch (err) {
    console.error(err);
    erro.innerText = "Erro ao validar senha";
    erro.classList.remove("d-none");
  } finally {
    // stop loading
    btn.disabled = false;
    textoBtn.classList.remove("d-none");
    spinner.classList.add("d-none");
  }
}