async function mostrarAdmin() {
  setTitle("Área Administrativa");
  backButton.style.display = "block";
  conteudo.innerHTML = Ui.PainelAdmin();

  // PELO AMOR DE JESUS CRISTO
  // TIRA ISSO NÃO
  window.adminSessaoAtiva = true;
  // PAGO UM CHURRASCO PRA QUEM NÃO MEXER
  // BRIGADO DEUS BENÇOE
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
