const API = 'https://script.google.com/macros/s/AKfycbxlsD_KuoR2yYv3GeF_WhkaInSnCm_ft032qBZjQqd6u3QEztucWbtsisLAgTvqMUff/exec';

let dataStore = {};
let escolha = {};
const navigationStack = [];

const titulo = document.getElementById('titulo');
const conteudo = document.getElementById('conteudo');
const backButton = document.getElementById('backButton');

document.addEventListener('DOMContentLoaded', init);
backButton.addEventListener('click', goBack);

function goBack() {
    if (navigationStack.length > 1) {
        navigationStack.pop(); // Pop current screen
        const previousScreen = navigationStack[navigationStack.length - 1];
        previousScreen(); // Render previous screen
        updateBackButton();
    }
}

function navigateTo(screenFn, ...args) {
    const screen = () => screenFn(...args);
    navigationStack.push(screen);
    screen();
    updateBackButton();
}

function updateBackButton() {
    backButton.style.display = navigationStack.length > 1 ? 'block' : 'none';
}


async function init() {
    setTitle('Carregando...');
    conteudo.innerHTML = '<div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div>';

    try {
        const r = await fetch(`${API}?action=bootstrap`).then(r => r.json());
        dataStore = r;
        navigateTo(showMenuInicial);
    } catch (error) {
        console.error('Error fetching initial data:', error);
        conteudo.innerHTML = '<div class="alert alert-danger">Erro ao carregar os dados. Tente novamente mais tarde.</div>';
    }
}

function selecionarLocal(l) {
    escolha.local = l;
    navigateTo(showEscolherData);
}

function selecionarData(p) {
    escolha.programacao = p;
    navigateTo(showEscolherInstrumento);
}

function selecionarInstrumento(i) {
    escolha.instrumento = i;
    navigateTo(showConfirmar);
}

async function salvar() {
    const nomeInput = document.getElementById('nome');
    const nome = nomeInput.value.trim();
    if (!nome) {
        alert('Por favor, informe o seu nome.');
        return;
    }

    const payload = {
        local: escolha.local.nome,
        programacao_id: escolha.programacao.id,
        tipo_visita: escolha.programacao.tipo_visita,
        instrumento: escolha.instrumento,
        nome,
        limite: escolha.local.limite
    };

    try {
        const r = await fetch(API, {
            method: 'POST',
            body: JSON.stringify(payload)
        }).then(r => r.json());

        if (r.error) {
            alert(`Erro: ${r.error}`);
        } else {
<<<<<<< HEAD
            alert('✅ Inscrição confirmada!');
=======
            alert(' Inscrição confirmada! Deus Abençoe');
>>>>>>> 1ff9204 (:construction: Alteração de Cores/All Black)
            resetAndGoHome();
        }
    } catch (error) {
        console.error('Error saving data:', error);
        alert('Ocorreu um erro ao salvar sua inscrição. Tente novamente.');
    }
}

async function verInscritos() {
    navigateTo(showInscritos);
}


function resetAndGoHome() {
    escolha = {};
    navigationStack.length = 0; // Clear history
    navigateTo(showMenuInicial);
}

function formatarData(d) {
    return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR');
}
