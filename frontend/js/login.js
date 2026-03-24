class LoginPage {
    constructor() {
        this.form = document.getElementById('login-form');
        this.email = document.getElementById('email');
        this.password = document.getElementById('password');
        this.remember = document.getElementById('remember');
        this.loginBtn = document.getElementById('login-btn');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkRememberedUser();
    }

    setupEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    async handleSubmit(e) {
        e.preventDefault();

        if (!this.validateForm()) {
            return;
        }

        this.setLoading(true);

        try {
            const response = await API.login({
                email: this.email.value,
                password: this.password.value
            });

            console.log('Login response:', response); // Debug log

            if (response.success) {
                // Save token
                localStorage.setItem('token', response.token);
                
                // Handle remember me
                if (this.remember.checked) {
                    localStorage.setItem('rememberedEmail', this.email.value);
                } else {
                    localStorage.removeItem('rememberedEmail');
                }

                // Show success message
                this.showToast('Login successful! Redirecting...', 'success');
                
                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                throw new Error(response.message || 'Login failed');
            }

        } catch (error) {
            console.error('Login error:', error);
            this.showToast(error.message || 'Invalid email or password', 'error');
            this.setLoading(false);
        }
    }

    validateForm() {
        if (!this.email.value) {
            this.showToast('Email is required', 'error');
            return false;
        }
        if (!this.password.value) {
            this.showToast('Password is required', 'error');
            return false;
        }
        return true;
    }

    checkRememberedUser() {
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            this.email.value = rememberedEmail;
            this.remember.checked = true;
        }
    }

    setLoading(isLoading) {
        if (isLoading) {
            this.loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
            this.loginBtn.disabled = true;
        } else {
            this.loginBtn.innerHTML = '<span>Login</span> <i class="fas fa-arrow-right"></i>';
            this.loginBtn.disabled = false;
        }
    }

    showToast(message, type) {
        // Remove existing toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) existingToast.remove();

        // Create new toast
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 9999;
            animation: slideIn 0.3s ease;
        `;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}" 
               style="color: ${type === 'success' ? '#10b981' : '#ef4444'}; margin-right: 10px;"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new LoginPage();
});