function setTitle(text) {
  document.getElementById("titulo").innerText = text;
}

function showMenuInicial() {
    mostrarBotaoAdmin()
    setTitle('DARPE - Lençóis Paulista');
    conteudo.innerHTML = `
        <div class="text-center mb-4">
            <img src="logo-ccb-light.png" alt="CCB Logo" style="max-width: 200px;">
        </div>
        <h2 class="h4 mb-4">Escolha uma das opções abaixo para continuar:</h2>
        <div class="d-grid gap-2 col-md-6 mx-auto">
            <button class="btn btn-dark btn-lg" onclick="navigateTo(showEscolherLocal)">
                Confirmar presença
            </button>
            <button class="btn btn-outline-dark btn-lg" onclick="verInscritos()">
                Visualizar inscrições
            </button>
        </div>`;
}

const adminButton = document.getElementById('adminButton');

function esconderBotaoAdmin() {
    adminButton.style.display = 'none';
}

function mostrarBotaoAdmin() {
  adminButton.style.display = 'inline-block';
}
