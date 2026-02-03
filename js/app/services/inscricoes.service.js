class InscricoesService {
    async listar() {
        return await appScriptApi.action({
            entity: "inscricoes",
            action: "view",
        });
    }

    async criar(payload) {
        return await appScriptApi.post(payload);
    }

    async excluir(id, token) {
        return await appScriptApi.post({
            entity: "inscricoes",
            action: "delete",
            id,
            delete_token: token,
        });
    }
}