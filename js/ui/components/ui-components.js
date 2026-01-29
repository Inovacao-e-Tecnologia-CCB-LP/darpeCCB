class UiComponents {
    constructor() {
        this.getComponents()
    }

    async getComponents() {
        await fetch(`js/ui/components/${'painel-admin'}.html`).then(response => response.text()).then(text => { this.painelAdmin = text });
        await fetch(`js/ui/components/${'painel-instrumentos'}.html`).then(response => response.text()).then(text => { this.painelInstrumentos = text });
        await fetch(`js/ui/components/${'painel-locais'}.html`).then(response => response.text()).then(text => { this.painelLocais = text });
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