class InstrumentosService {
    async listar() {
        return await appScriptApi.action({
            entity: "instrumentos",
            action: "view",
        });
    }

    async criar(nome, tipo) {
        return await appScriptApi.post({
            entity: "instrumentos",
            action: "create",
            password: senhaDigitada,
            nome,
            tipo,
        });
    }

    async atualizar(id, nome, tipo) {
        return await appScriptApi.post({
            entity: "instrumentos",
            action: "update",
            id,
            password: senhaDigitada,
            nome,
            tipo,
        });
    }

    async excluir(id) {
        return await appScriptApi.post({
            entity: "instrumentos",
            action: "delete",
            id,
            password: senhaDigitada,
        });
    }
}