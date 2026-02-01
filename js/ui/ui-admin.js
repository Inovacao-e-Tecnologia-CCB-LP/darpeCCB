async function mostrarAdmin() {
  setTitle("Área Administrativa");
  backButton.style.display = "block";
  conteudo.innerHTML = Ui.PainelAdmin();
}

function irParaCrudLocais() {
  navigateTo(abrirCrudLocais);
}

function irParaCrudInstrumentos() {
  navigateTo(abrirCrudInstrumentos);
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
