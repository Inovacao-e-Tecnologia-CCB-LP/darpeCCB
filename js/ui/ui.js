function setTitle(text) {
  document.getElementById("titulo").innerText = text;
}

async function showMenuInicial() {

  if (window.adminSessaoAtiva) {
    window.adminSessaoAtiva = false;
    location.reload();
    return;
  }

  mostrarBotaoAdmin();
  setTitle("Carregando...");
  conteudo.innerHTML = '<div class="spinner-border"></div>';
  setTitle("DARPE");
  conteudo.innerHTML = Ui.Home();
}

const adminButton = document.getElementById("adminButton");

function esconderBotaoAdmin() {
  adminButton.style.display = "none";
}

function mostrarBotaoAdmin() {
  adminButton.style.display = "inline-block";
}

function copiarTexto(container = document) {
  container.querySelectorAll(".copy-text").forEach((el) => {
    el.addEventListener("click", () => {
      const text = el.cloneNode(true);
      text.querySelectorAll("i").forEach((i) => i.remove());
      const valor = text.textContent.trim();
      if (!valor) return;

      navigator.clipboard.writeText(valor).then(() => {
        const localId = el.getAttribute("data-localid");
        abrirModalMapa(localId);
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

function mostrarLoading(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;

  el.innerHTML = `
    <div class="text-center my-4">
      <div class="spinner-border text-dark"></div>
    </div>
  `;
}
