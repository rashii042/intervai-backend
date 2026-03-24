class Auth {
    constructor() {
        this.token = localStorage.getItem('token');
        this.user = null;
        
        this.init();
    }

    async init() {
        if (this.token) {
            try {
                await this.loadUser();
            } catch (error) {
                this.logout();
            }
        }
    }

    async loadUser() {
        try {
            const response = await API.getCurrentUser();
            this.user = response.user;
            return this.user;
        } catch (error) {
            throw error;
        }
    }

    async login(email, password) {
        try {
            const response = await API.login({ email, password });
            this.setToken(response.token);
            this.user = response.user;
            return response;
        } catch (error) {
            throw error;
        }
    }

    async register(name, email, password) {
        try {
            const response = await API.register({ name, email, password });
            this.setToken(response.token);
            this.user = response.user;
            return response;
        } catch (error) {
            throw error;
        }
    }

    logout() {
        localStorage.removeItem('token');
        this.token = null;
        this.user = null;
        window.location.href = '/';
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    isAuthenticated() {
        return !!this.token;
    }

    getUser() {
        return this.user;
    }
}

// Initialize auth
const auth = new Auth();