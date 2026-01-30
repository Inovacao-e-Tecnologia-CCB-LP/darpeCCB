class AppScriptApi {
    url = "https://script.google.com/macros/s/AKfycbxlsD_KuoR2yYv3GeF_WhkaInSnCm_ft032qBZjQqd6u3QEztucWbtsisLAgTvqMUff/exec";

    async post(body) {
        return await fetch(this.url, {
            method: "POST",
            body: JSON.stringify(body),
        }).then((r) => r.json());
    }

    async bootstrap() {
        return await fetch(`${this.url}?action=bootstrap`).then((r) => r.json());
    }

    async action({action, entity}, signal) {
        return await fetch(`${this.url}?action=${action}&entity=${entity}`, { signal }).then(r => r.json());
    }
}