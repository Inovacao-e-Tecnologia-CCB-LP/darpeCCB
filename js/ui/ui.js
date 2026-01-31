function setTitle(text) {
    document.getElementById("titulo").innerText = text;
}

async function showMenuInicial() {
    mostrarBotaoAdmin()
    setTitle("Carregando...");
    conteudo.innerHTML = '<div class="spinner-border"></div>';
    setTitle('DARPE');
    conteudo.innerHTML = Ui.Home();
}

const adminButton = document.getElementById('adminButton');

function esconderBotaoAdmin() {
    adminButton.style.display = 'none';
}

function mostrarBotaoAdmin() {
    adminButton.style.display = 'inline-block';
}

function copiarTexto(container = document) {
  container.querySelectorAll(".copy-text").forEach((el) => {
    el.addEventListener("click", () => {
      const text = el.cloneNode(true);

      text.querySelectorAll("i").forEach((i) => i.remove());

      const valor = text.textContent.trim();

      if (!valor) return;

      navigator.clipboard.writeText(valor).then(() => {
        mostrarToast("Copiado", "Texto copiado com sucesso", "success", 3500);
      });

    });

  });

}

function abrirMapa(localId) {
  const localObj = locaisMap[localId];

  if (!localObj) {
    alert("Endereço não encontrado");
    return;
  }

  const endereco = encodeURIComponent(
    localObj.endereco ?? "Endereço não informado",
  );

  const url = `https://www.google.com/maps/search/?api=1&query=${endereco}`;

  window.open(url, "_blank", "noopener");
}
