async function mostrarAdmin() {
  setTitle("Área Administrativa");
  backButton.style.display = "block";
  conteudo.innerHTML = Ui.PainelAdmin();
}

function irParaTelaLocais() {
  navigateTo(() => guardAdmin(abrirTelaLocais));
}

function irParaTelaInstrumentos() {
  navigateTo(() => guardAdmin(abrirTelaInstrumentos));
}

function irParaTelaRegrasDatas() {
  navigateTo(() => guardAdmin(abrirTelaRegrasDatas));
}

function irParaTelaRelatorios() {
  navigateTo(() => guardAdmin(abrirTelaRelatorios));
}
