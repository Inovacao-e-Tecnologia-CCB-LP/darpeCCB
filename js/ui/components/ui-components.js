class UiComponents {
    constructor() {
        this.getComponents()
    }

    async getComponents() {
        await fetch(`js/ui/components/painel-admin.html`).then(response => response.text()).then(text => { this.painelAdmin = text });
        await fetch(`js/ui/components/painel-instrumentos.html`).then(response => response.text()).then(text => { this.painelInstrumentos = text });
        await fetch(`js/ui/components/painel-locais.html`).then(response => response.text()).then(text => { this.painelLocais = text });
        await fetch(`js/ui/components/trajes.html`).then(response => response.text()).then(text => { this.trajes = text });
    }

    ObservacaoTrajes() {
        return this.trajes
    }

    PainelAdmin() {
        return this.painelAdmin
    }

    PainelInstrumentos() {
        return this.painelInstrumentos
    }

    PainelLocais() {
        return this.painelLocais
    }
}