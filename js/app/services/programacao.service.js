class ProgramacaoService {
  entity = "programacao";

  async listar() {
    return await appScriptApi.view(this.entity);
  }

  async excluir(id, password) {
    return await appScriptApi.deleteWithPassword(this.entity, id, password);
  }
}

const programacaoService = new ProgramacaoService();
