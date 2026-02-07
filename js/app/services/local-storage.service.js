class LocalStorageService {
    LS_KEY = "inscricoes_autorizadas";

    buscarAutorizacao(id) {
        try {
            const lista = JSON.parse(localStorage.getItem(this.LS_KEY)) || [];
            return lista.find((item) => item.id === id) || null;
        } catch (e) {
            console.error("Erro ao ler autorizações do localStorage:", e);
            return null;
        }
    }

    salvarAutorizacao(id, token) {
        try {
            const lista = JSON.parse(localStorage.getItem(this.LS_KEY)) || [];
            const novaLista = lista.filter((item) => item.id !== id);

            novaLista.push({ id, token });

            localStorage.setItem(this.LS_KEY, JSON.stringify(novaLista));
        } catch (e) {
            console.error("Erro ao salvar autorização:", e);
        }
    }

    removerAutorizacao(id) {
        try {
            let lista = JSON.parse(localStorage.getItem(this.LS_KEY)) || [];
            lista = lista.filter((item) => item.id !== id);
            localStorage.setItem(this.LS_KEY, JSON.stringify(lista));
        } catch (e) {
            console.error("Erro ao remover autorização:", e);
        }
    }
}

const localStorageService = new LocalStorageService();
