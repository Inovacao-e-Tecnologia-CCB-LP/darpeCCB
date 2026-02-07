class ProgramacaoService {
    entity = 'programacao';

    async listar() {
        return await appScriptApi.view(this.entity);
    }
}

const programacaoService = new ProgramacaoService();