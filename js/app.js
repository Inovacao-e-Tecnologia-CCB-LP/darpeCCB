const API = 'https://script.google.com/macros/s/AKfycbxlsD_KuoR2yYv3GeF_WhkaInSnCm_ft032qBZjQqd6u3QEztucWbtsisLAgTvqMUff/exec';

/*======testeeeee===============================================*/



let senhaDigitada = '';


function abrirModalAdmin() {
    document.getElementById('senhaAdmin').value = '';
    document.getElementById('erroSenha').classList.add('d-none');

    const modal = new bootstrap.Modal(
        document.getElementById('modalAdmin')
    );
    modal.show();
}

let isAdmin = false;

async function validarSenhaAdmin() {
    senhaDigitada = document.getElementById('senhaAdmin').value;
    const erro = document.getElementById('erroSenha');

    const btn = document.getElementById('btnEntrarAdmin');
    const textoBtn = document.getElementById('textoBtnAdmin');
    const spinner = document.getElementById('spinnerBtnAdmin');

    erro.classList.add('d-none');

    // ativa carregamento
    btn.disabled = true;
    textoBtn.classList.add('d-none');
    spinner.classList.remove('d-none');

    try {
      const response = await fetch(API, {
    method: 'POST',
    headers: {
        'Content-Type': 'text/plain;charset=utf-8'
    },
    body: JSON.stringify({
        action: 'auth',
        password: senhaDigitada
    })
});

const data = await response.json();
        if (senhaDigitada === data.password) {
            isAdmin = true;

            // fecha modal
            const modalEl = document.getElementById('modalAdmin');
            bootstrap.Modal.getInstance(modalEl).hide();

            navigateTo(mostrarAdmin);
        } else {
            erro.classList.remove('d-none');
        }

    } catch (e) {
        console.error(e);
        erro.innerText = 'Erro ao validar senha';
        erro.classList.remove('d-none');

    } finally {
        // desativa carregamento
        btn.disabled = false;
        textoBtn.classList.remove('d-none');
        spinner.classList.add('d-none');
    }
}


/* ================= LOCAL STORAGE DELETE CONTROL ================= */

const LS_KEY = 'inscricoes_autorizadas';
const MAX_IDS = 2;

function salvarAutorizacao(id, token) {
    let lista = JSON.parse(localStorage.getItem(LS_KEY)) || [];
    lista = lista.filter(item => item.id !== id);
    lista.push({ id, token });

    if (lista.length > MAX_IDS) {
        lista = lista.slice(-MAX_IDS);
    }

    localStorage.setItem(LS_KEY, JSON.stringify(lista));
}

function podeDeletar(id) {
    const lista = JSON.parse(localStorage.getItem(LS_KEY)) || [];
    return lista.find(item => item.id === id);
}

function removerAutorizacao(id) {
    let lista = JSON.parse(localStorage.getItem(LS_KEY)) || [];
    lista = lista.filter(item => item.id !== id);
    localStorage.setItem(LS_KEY, JSON.stringify(lista));
}

/* ================= APP ================= */

let dataStore = {};
let escolha = {};
let abortController;
const navigationStack = [];

const titulo = document.getElementById('titulo');
const conteudo = document.getElementById('conteudo');
const backButton = document.getElementById('backButton');


document.addEventListener('DOMContentLoaded', init);
backButton.addEventListener('click', goBack);

function goBack() {
    if (abortController) abortController.abort();
    if (navigationStack.length > 1) {
        navigationStack.pop();
        navigationStack[navigationStack.length - 1]();
        updateBackButton();
    }
    mostrarBotaoAdmin();
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
    esconderBotaoAdmin();
    setTitle('Carregando...');
    conteudo.innerHTML = '<div class="spinner-border"></div>';

    try {
        dataStore = await fetch(`${API}?action=bootstrap`).then(r => r.json());
        navigateTo(showMenuInicial);
    } catch {
        conteudo.innerHTML = '<div class="alert alert-danger">Erro ao carregar dados.</div>';
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
    const btn = document.getElementById('btnConfirmar');
    const nome = document.getElementById('nome').value.trim();

    if (!nome) {
        abrirModalAviso('Aviso', 'Informe o nome');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';

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
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(payload)
        }).then(r => r.json());

        if (r.error) throw r.error;

        // salva autorização de delete
        if (r.id && r.delete_token) {
            salvarAutorizacao(r.id, r.delete_token);
        }

        abrirModalAviso('Sucesso', ' Inscrição confirmada! Deus Abençoe');
        resetAndGoHome();

    } catch (e) {
        abrirModalAviso('Erro', '❌ Erro ao salvar');
        btn.disabled = false;
        btn.innerHTML = 'Confirmar';
    }
}


async function excluirInscricao(id, btn) {
    const auth = podeDeletar(id);
    if (!auth) {
        abrirModalAviso(
            'Erro',
            '❌ Você não tem permissão para excluir esta inscrição.'
        );
        return;
    }

    const confirmou = await abrirModalConfirmacao(
        'Deseja realmente excluir esta inscrição?',
        'Excluir'
    );

    if (!confirmou) return;

    // guarda estado original do botão
    const originalHTML = btn.innerHTML;
    const originalClass = btn.className;

    // ativa loading
    btn.disabled = true;
    btn.className = 'btn btn-danger btn-sm';
    btn.innerHTML = `
        <span class="spinner-border spinner-border-sm text-light"
              role="status"
              aria-hidden="true"></span>
    `;

    try {
        const r = await fetch(API, {
            method: 'POST',
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({
                action: 'delete',
                id,
                delete_token: auth.token
            })
        }).then(r => r.json());

        if (!r.success) throw new Error();

        removerAutorizacao(id);
        abrirModalAviso(
            'Sucesso',
            'Inscrição excluída com sucesso !!'
        );
        showInscritos();

    } catch (err) {
        abrirModalAviso(
            'Erro',
            ' Não foi possível excluir a inscrição.'
        );

        // restaura botão se falhar
        btn.disabled = false;
        btn.className = originalClass;
        btn.innerHTML = originalHTML;
    }
}


function abrirModalAviso(titulo, mensagem) {
    document.getElementById('modalAvisoTitulo').innerText = titulo;
    document.getElementById('modalAvisoMensagem').innerText = mensagem;

    const modal = new bootstrap.Modal(
        document.getElementById('modalAviso')
    );
    modal.show();
}

// Modal de confirmação (retorna true/false)
function abrirModalConfirmacao(mensagem, textoBotao = 'Confirmar') {
    return new Promise(resolve => {
        const modalEl = document.getElementById('confirmModal');
        const modal = new bootstrap.Modal(modalEl);

        document.getElementById('confirmMessage').innerText = mensagem;
        document.getElementById('confirmOk').innerText = textoBotao;

        const btnOk = document.getElementById('confirmOk');

        const confirmar = () => {
            btnOk.removeEventListener('click', confirmar);
            modal.hide();
            resolve(true);
        };

        btnOk.addEventListener('click', confirmar);

        modalEl.addEventListener(
            'hidden.bs.modal',
            () => {
                btnOk.removeEventListener('click', confirmar);
                resolve(false);
            },
            { once: true }
        );

        modal.show();
    });
}



async function verInscritos() {
    navigateTo(showInscritos);
}

function resetAndGoHome() {
    abortController?.abort();
    escolha = {};
    navigationStack.length = 0;
    navigateTo(showMenuInicial);
}

function formatarData(d) {
    return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR');
}
