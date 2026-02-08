function setTitle(text) {
  document.getElementById("titulo").innerText = text;
}

async function showMenuInicial() {
  window.adminAuth = {
    authenticated: false,
    token: null,
  };

  mostrarBotaoAdmin();
  setTitle("Página Inicial");
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

function getTipoRadioSelecionado() {
  const radio = document.querySelector('input[name="instrumentoTipo"]:checked');
  return radio ? radio.value : "";
}

function marcarTipoRadio(tipo) {
  const radio = document.querySelector(
    `input[name="instrumentoTipo"][value="${tipo}"]`,
  );
  if (radio) radio.checked = true;
}

function mostrarErroCampo(idErro, msg) {
  const el = document.getElementById(idErro);
  if (!el) return;
  el.innerText = msg;
  el.classList.remove("d-none");
}

function limparErroCampo(idErro) {
  const el = document.getElementById(idErro);
  if (!el) return;
  el.innerText = "";
  el.classList.add("d-none");
}
