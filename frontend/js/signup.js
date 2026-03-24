class SignupPage {
    constructor() {
        this.form = document.getElementById('signup-form');
        this.name = document.getElementById('name');
        this.email = document.getElementById('email');
        this.password = document.getElementById('password');
        this.confirmPassword = document.getElementById('confirm-password');
        this.terms = document.getElementById('terms');
        this.signupBtn = document.getElementById('signup-btn');
        
        this.init();
    }

    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    async handleSubmit(e) {
        e.preventDefault();

        if (!this.validateForm()) {
            return;
        }

        this.setLoading(true);

        try {
            const response = await API.register({
                name: this.name.value,
                email: this.email.value,
                password: this.password.value
            });

            console.log('Signup response:', response);

            if (response.success) {
                localStorage.setItem('token', response.token);
                this.showToast('Account created successfully! Redirecting...', 'success');
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                throw new Error(response.message || 'Signup failed');
            }

        } catch (error) {
            console.error('Signup error:', error);
            this.showToast(error.message || 'Signup failed. Please try again.', 'error');
            this.setLoading(false);
        }
    }

    validateForm() {
        if (!this.name.value) {
            this.showToast('Name is required', 'error');
            return false;
        }
        if (!this.email.value) {
            this.showToast('Email is required', 'error');
            return false;
        }
        if (!this.email.value.includes('@')) {
            this.showToast('Please enter a valid email', 'error');
            return false;
        }
        if (!this.password.value) {
            this.showToast('Password is required', 'error');
            return false;
        }
        if (this.password.value.length < 6) {
            this.showToast('Password must be at least 6 characters', 'error');
            return false;
        }
        if (this.password.value !== this.confirmPassword.value) {
            this.showToast('Passwords do not match', 'error');
            return false;
        }
        if (!this.terms.checked) {
            this.showToast('Please accept Terms of Service and Privacy Policy', 'error');
            return false;
        }
        return true;
    }

    setLoading(isLoading) {
        if (isLoading) {
            this.signupBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
            this.signupBtn.disabled = true;
        } else {
            this.signupBtn.innerHTML = '<span>Create Account</span> <i class="fas fa-arrow-right"></i>';
            this.signupBtn.disabled = false;
        }
    }

    showToast(message, type) {
        const existingToast = document.querySelector('.toast');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 15px rgba(0,0,0,0.1);
            z-index: 9999;
            display: flex;
            align-items: center;
            gap: 12px;
            min-width: 300px;
            font-family: 'Inter', sans-serif;
            animation: slideIn 0.3s ease;
        `;
        
        const iconColor = type === 'success' ? '#10b981' : '#ef4444';
        const icon = type === 'success' ? 'check-circle' : 'exclamation-circle';
        
        toast.innerHTML = `
            <i class="fas fa-${icon}" style="color: ${iconColor}; font-size: 1.25rem;"></i>
            <span style="color: #1f2937; flex: 1;">${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new SignupPage();
});