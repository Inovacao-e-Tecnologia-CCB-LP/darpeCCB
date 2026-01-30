function setTitle(text) {
    document.getElementById("titulo").innerText = text;
}

function showMenuInicial() {
    mostrarBotaoAdmin()
    setTitle('DARPE - Lençóis Paulista');
    conteudo.innerHTML = Ui.Home();
}

const adminButton = document.getElementById('adminButton');

function esconderBotaoAdmin() {
    adminButton.style.display = 'none';
}

function mostrarBotaoAdmin() {
    adminButton.style.display = 'inline-block';
}
