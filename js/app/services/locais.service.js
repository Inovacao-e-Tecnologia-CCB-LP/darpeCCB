class LocaisService {
    async listar() {
        return await appScriptApi.action({
            entity: "locais",
            action: "view",
        });
    }

    async criar(payload) {
        return await appScriptApi.post({
            ...payload,
            entity: "locais",
            action: "create",
            password: senhaDigitada,
        });
    }

    async atualizar(id, payload) {
        return await appScriptApi.post({
            ...payload,
            entity: "locais",
            action: "update",
            id,
            password: senhaDigitada,
        });
    }

    async excluir(id) {
        return await appScriptApi.post({
            entity: "locais",
            action: "delete",
            id,
            password: senhaDigitada,
        });
    }
}