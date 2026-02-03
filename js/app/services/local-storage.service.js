class LocalStorageService {
    LS_KEY = "inscricoes_autorizadas";

    async buscarAutorizacao(id) {
        try {
            const lista = JSON.parse(localStorage.getItem(LS_KEY)) || [];
            return lista.find((item) => item.id === id) || null;
        } catch (e) {
            console.error("Erro ao ler autorizações do localStorage:", e);
            return null;
        }
    }

    async salvarAutorizacao(id, token) {
        try {
            const lista = JSON.parse(localStorage.getItem(LS_KEY)) || [];
            const novaLista = lista.filter((item) => item.id !== id);

            novaLista.push({ id, token });

            localStorage.setItem(LS_KEY, JSON.stringify(novaLista));
        } catch (e) {
            console.error("Erro ao salvar autorização:", e);
        }
    }

    async removerAutorizacao(id) {
        try {
            let lista = JSON.parse(localStorage.getItem(LS_KEY)) || [];
            lista = lista.filter((item) => item.id !== id);
            localStorage.setItem(LS_KEY, JSON.stringify(lista));
        } catch (e) {
            console.error("Erro ao remover autorização:", e);
        }
    }
}