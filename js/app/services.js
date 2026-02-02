/* ================= 
LOCAL STORAGE DELETE CONTROL 
================= */

const LS_KEY = "inscricoes_autorizadas";

function buscarAutorizacao(id) {
  try {
    const lista = JSON.parse(localStorage.getItem(LS_KEY)) || [];
    return lista.find((item) => item.id === id) || null;
  } catch (e) {
    console.error("Erro ao ler autorizações do localStorage:", e);
    return null;
  }
}

function salvarAutorizacao(id, token) {
  try {
    const lista = JSON.parse(localStorage.getItem(LS_KEY)) || [];
    const novaLista = lista.filter((item) => item.id !== id);

    novaLista.push({ id, token });

    localStorage.setItem(LS_KEY, JSON.stringify(novaLista));
  } catch (e) {
    console.error("Erro ao salvar autorização:", e);
  }
}

function removerAutorizacao(id) {
  try {
    let lista = JSON.parse(localStorage.getItem(LS_KEY)) || [];
    lista = lista.filter((item) => item.id !== id);
    localStorage.setItem(LS_KEY, JSON.stringify(lista));
  } catch (e) {
    console.error("Erro ao remover autorização:", e);
  }
}

/* ================= 
      API CALLS 
================= */

/* ================= INSCRIÇÕES ================= */
async function listarInscricoes() {
  return await appScriptApi.action({
    entity: "inscricoes",
    action: "view",
  });
}

async function criarInscricaoService(payload) {
  return await appScriptApi.post(payload);
}

async function excluirInscricaoService(id, token) {
  return await appScriptApi.post({
    entity: "inscricoes",
    action: "delete",
    id,
    delete_token: token,
  });
}

/* ================= INSTRUMENTOS ================= */
async function listarInstrumentosService() {
  return await appScriptApi.action({
    entity: "instrumentos",
    action: "view",
  });
}

async function criarInstrumentoService(nome, tipo) {
  return await appScriptApi.post({
    entity: "instrumentos",
    action: "create",
    password: senhaDigitada,
    nome,
    tipo,
  });
}

async function atualizarInstrumentoService(id, nome, tipo) {
  return await appScriptApi.post({
    entity: "instrumentos",
    action: "update",
    id,
    password: senhaDigitada,
    nome,
    tipo,
  });
}

async function excluirInstrumentoService(id) {
  return await appScriptApi.post({
    entity: "instrumentos",
    action: "delete",
    id,
    password: senhaDigitada,
  });
}

/* ================= LOCAIS ================= */
async function listarLocaisService() {
  return await appScriptApi.action({
    entity: "locais",
    action: "view",
  });
}

async function criarLocalService(payload) {
  return await appScriptApi.post({
    ...payload,
    entity: "locais",
    action: "create",
    password: senhaDigitada,
  });
}

async function atualizarLocalService(id, payload) {
  return await appScriptApi.post({
    ...payload,
    entity: "locais",
    action: "update",
    id,
    password: senhaDigitada,
  });
}

async function excluirLocalService(id) {
  return await appScriptApi.post({
    entity: "locais",
    action: "delete",
    id,
    password: senhaDigitada,
  });
}
