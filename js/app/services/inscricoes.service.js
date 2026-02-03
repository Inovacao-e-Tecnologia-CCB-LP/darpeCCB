class InscricoesService {
    entity = 'inscricoes';

    async listar() {
        return await appScriptApi.view(this.entity);
    }

    async criar(payload) {
        return await appScriptApi.create(this.entity, payload);
    }

    async excluir(id, delete_token) {
        return await appScriptApi.deleteWithToken(this.entity, id, delete_token);
    }
}