function abrirModalAviso(titulo, mensagem) {
  document.getElementById("modalAvisoTitulo").innerText = titulo;
  document.getElementById("modalAvisoMensagem").innerText = mensagem;

  const modal = new bootstrap.Modal(document.getElementById("modalAviso"));
  modal.show();
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
      { once: true }
    );

    modal.show();
  });
}

function formatarData(d) {
  return new Date(d + "T00:00:00").toLocaleDateString("pt-BR");
}