class API {
    static baseURL = 'https://intervai-backend.onrender.com/api';

    static async request(endpoint, options = {}) {
        const token = localStorage.getItem('token');
        
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            console.log(`Making request to: ${this.baseURL}${endpoint}`);
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                ...options,
                headers
            });
            
            const data = await response.json();
            console.log('Response:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth endpoints
    static async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    static async login(credentials) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    }

    static async getCurrentUser() {
        return this.request('/auth/me');
    }

    // Interview endpoints
    static async startInterview(data) {
        return this.request('/interviews/start', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    static async getInterview(interviewId) {
        return this.request(`/interviews/${interviewId}`);
    }

    static async getRecentInterviews() {
        return this.request('/interviews');
    }

    static async completeInterview(interviewId, data) {
        return this.request(`/interviews/${interviewId}/complete`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    static async generateQuestions(data) {
        return this.request('/interviews/generate-questions', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // ✨ NEW: Generate report from interview data
    static async generateReport(data) {
        return this.request('/interviews/generate-report', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // Resume endpoints
    static async uploadResume(formData) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${this.baseURL}/interviews/upload-resume`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        return response.json();
    }

    // Report endpoints
    static async getReport(reportId) {
        return this.request(`/reports/${reportId}`);
    }

    static async getUserReports() {
        return this.request('/reports');
    }
    static async generateReport(data) {
    return this.request('/interviews/generate-report', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}
}
