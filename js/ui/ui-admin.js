async function mostrarAdmin() {
  setTitle("Área Administrativa");
  backButton.style.display = "block";
  conteudo.innerHTML = Ui.PainelAdmin();
  // Ativa a flag para indicar que o usuário entrou na área admin.
  window.adminSessaoAtiva = true;
}

function irParaCrudLocais() {
  navigateTo(abrirCrudLocais);
}

function irParaCrudInstrumentos() {
  navigateTo(abrirCrudInstrumentos);
}

function irParaCrudRegrasDatas() {
  navigateTo(abrirCrudRegrasDatas);
}

function irParaRelatorios(){
  navigateTo(abrirRelatorios)
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
