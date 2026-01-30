function setTitle(text) {
    document.getElementById("titulo").innerText = text;
}

async function showMenuInicial() {
    mostrarBotaoAdmin()
    setTitle("Carregando...");
    conteudo.innerHTML = '<div class="spinner-border"></div>';
    dataStore = await appScriptApi.bootstrap();
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
