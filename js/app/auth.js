let senhaDigitada = "";

window.adminAuth = {
  authenticated: false,
  token: null,
};

function guardAdmin(next) {
  if (window.adminAuth?.authenticated) {
    next();
    return;
  }

  abrirModalAviso("Acesso negado", "Faça login como administrador");
  showMenuInicial();
}

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

  btn.disabled = true;
  textoBtn.classList.add("d-none");
  spinner.classList.remove("d-none");

  try {
    const r = await authService.auth(senhaDigitada);

    if (!r?.success) {
      mostrarErroCampo("erroSenha", r.error);
      return;
    }

    window.adminAuth.authenticated = true;
    window.adminAuth.token = r.token;

    bootstrap.Modal.getInstance(document.getElementById("modalAdmin")).hide();
    navigateTo(() => guardAdmin(mostrarAdmin));
  } catch (err) {
    console.error(err);
    mostrarErroSenha("Erro ao validar senha");
  } finally {
    btn.disabled = false;
    textoBtn.classList.remove("d-none");
    spinner.classList.add("d-none");
  }
}
