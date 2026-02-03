class AuthService {
    async auth(password) {
        return await appScriptApi.auth(password).then(r => r.status === 200);
    }
}