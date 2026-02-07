let mapaLocalId = null;

async function abrirModalAviso(titulo, mensagem) {
  return new Promise((resolve) => {
    document.getElementById("modalAvisoTitulo").innerText = titulo;
    document.getElementById("modalAvisoMensagem").innerText = mensagem;
    const modalEl = document.getElementById("modalAviso");

    const modal = new bootstrap.Modal(modalEl);
    modal.show();

    modalEl.addEventListener("hidden.bs.modal", () => resolve());
  });
}

// Modal de confirmação (retorna true/false)
function abrirModalConfirmacao(mensagem, textoBotao = "Confirmar") {
  return new Promise((resolve) => {
    const modalEl = document.getElementById("confirmModal");
    const modal = new bootstrap.Modal(modalEl);

    document.getElementById("confirmMessage").innerText = mensagem;
    document.getElementById("confirmOk").innerText = textoBotao;

    const btnOk = document.getElementById("confirmOk");

    const confirmar = () => {
      btnOk.removeEventListener("click", confirmar);
      modal.hide();
      resolve(true);
    };

    btnOk.addEventListener("click", confirmar);

    modalEl.addEventListener(
      "hidden.bs.modal",
      () => {
        btnOk.removeEventListener("click", confirmar);
        resolve(false);
      },
      { once: true },
    );

    modal.show();
  });
}

function abrirModalMapa(localId) {
  const modalEl = document.getElementById("modalMapa");
  const btnAbrir = modalEl.querySelector("#btnAbrirMapa");

  btnAbrir.onclick = () => abrirMapa(localId);

  const modal = new bootstrap.Modal(modalEl);
  modal.show();
}

function mostrarToast(titulo, mensagem, tipo = "success", tempo = 2000) {
  const toastEl = document.getElementById("toastAviso");
  const iconEl = document.getElementById("toastIcon");
  const tituloEl = document.getElementById("toastTitulo");
  const mensagemEl = document.getElementById("toastMensagem");

  const tipos = {
    success: {
      icon: "bi-check-circle-fill",
      color: "text-success",
    },
    warning: {
      icon: "bi-exclamation-triangle-fill",
      color: "text-warning",
    },
    error: {
      icon: "bi-x-circle-fill",
      color: "text-danger",
    },
  };

  const config = tipos[tipo] ?? tipos.success;

  iconEl.className = `bi me-2 ${config.icon} ${config.color}`;

  tituloEl.innerText = titulo;
  mensagemEl.innerText = mensagem;

  const toast = new bootstrap.Toast(toastEl, {
    delay: tempo,
    autohide: true,
  });

  toast.show();
}
