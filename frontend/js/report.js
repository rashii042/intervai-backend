class InterviewReport {
    constructor() {
        this.reportData = null;
        this.init();
    }

    init() {
        console.log('📊 Report page loaded');
        
        // Get interview ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const interviewId = urlParams.get('id');
        
        if (interviewId) {
            this.loadById(interviewId);
        } else {
            this.loadLatest();
        }
        
        this.setupEventListeners();
    }

    loadById(id) {
        const all = JSON.parse(localStorage.getItem('interviews') || '[]');
        const interview = all.find(i => i.id == id);
        
        if (interview) {
            this.processInterview(interview);
        } else {
            console.log('Interview not found, using demo');
            this.createDemo();
        }
    }

    loadLatest() {
        const all = JSON.parse(localStorage.getItem('interviews') || '[]');
        
        if (all.length > 0) {
            this.processInterview(all[all.length - 1]);
        } else {
            this.createDemo();
        }
    }

    processInterview(interview) {
        // CRITICAL: Only take 10 questions
        let questions = interview.questions || [];
        const maxQuestions = 10;
        
        if (questions.length > maxQuestions) {
            console.log(`⚠️ Had ${questions.length} questions, taking first ${maxQuestions}`);
            questions = questions.slice(0, maxQuestions);
        }
        
        console.log(`✅ Showing ${questions.length} questions`);
        
        // Calculate average score
        const totalScore = questions.reduce((sum, q) => sum + (q.score || 0), 0);
        const avgScore = questions.length > 0 ? Math.round(totalScore / questions.length) : 75;
        
        // Prepare report data
        this.reportData = {
            id: interview.id,
            exam: interview.exam || 'Interview',
            date: interview.date || new Date().toISOString(),
            overallScore: avgScore,
            confidenceScore: interview.confidence || 75,
            questionCount: questions.length,
            questions: questions
        };
        
        this.render();
    }

    createDemo() {
        console.log('Creating demo with 10 questions');
        
        const demoQuestions = [];
        const texts = [
            "Tell me about yourself.",
            "What are your strengths?",
            "What are your weaknesses?",
            "Why do you want to work here?",
            "Where do you see yourself in 5 years?",
            "Tell me about a challenge you faced.",
            "How do you handle pressure?",
            "Why should we hire you?",
            "Describe your teamwork experience.",
            "What is your greatest achievement?"
        ];
        
        for (let i = 0; i < 10; i++) {
            demoQuestions.push({
                id: i + 1,
                text: texts[i],
                score: Math.floor(Math.random() * 30) + 65,
                feedback: 'Good attempt! Keep practicing.'
            });
        }
        
        this.reportData = {
            id: Date.now(),
            exam: 'Demo Interview',
            date: new Date().toISOString(),
            overallScore: 78,
            confidenceScore: 72,
            questionCount: 10,
            questions: demoQuestions
        };
        
        this.render();
    }

    render() {
        const data = this.reportData;
        if (!data) return;
        
        console.log('🎨 Rendering report...');
        
        // Update header
        const dateEl = document.getElementById('interview-date');
        if (dateEl) {
            dateEl.textContent = new Date(data.date).toLocaleDateString();
        }
        
        const examEl = document.getElementById('interview-exam');
        if (examEl) {
            examEl.textContent = `Exam: ${data.exam}`;
        }
        
        // Update scores
        const scoreEl = document.getElementById('overall-score');
        if (scoreEl) scoreEl.textContent = `${data.overallScore}%`;
        
        const confEl = document.getElementById('confidence-value');
        if (confEl) confEl.textContent = `${data.confidenceScore}%`;
        
        // Update circle
        const circle = document.querySelector('.score-circle');
        if (circle && data.overallScore) {
            const degree = (data.overallScore / 100) * 360;
            circle.style.background = `conic-gradient(#4f46e5 0deg ${degree}deg, #e5e7eb ${degree}deg 360deg)`;
        }
        
        // Render questions - ONLY 10
        this.renderQuestions(data.questions);
        
        console.log(`✅ Report rendered with ${data.questions.length} questions`);
    }

    renderQuestions(questions) {
        const container = document.getElementById('questions-analysis');
        if (!container) return;
        
        if (!questions || questions.length === 0) {
            container.innerHTML = '<div style="text-align:center; padding:2rem;">No questions available</div>';
            return;
        }
        
        // Show exactly the questions we have (max 10)
        container.innerHTML = questions.map((q, i) => `
            <div style="background:#f9fafb; border-radius:12px; padding:1rem; margin-bottom:1rem; border-left:4px solid #4f46e5;">
                <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
                    <strong>Q${i+1}: ${this.escapeHtml(q.text || q.question || 'Question')}</strong>
                    <span style="background:#4f46e5; color:white; padding:4px 12px; border-radius:20px;">${q.score || 0}%</span>
                </div>
                <div style="color:#10b981; margin-top:0.5rem;">
                    <i class="fas fa-lightbulb"></i> ${this.escapeHtml(q.feedback || 'Good attempt!')}
                </div>
            </div>
        `).join('');
        
        console.log(`✅ Rendered ${questions.length} questions`);
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    setupEventListeners() {
        const downloadBtn = document.getElementById('download-report');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.download());
        }
        
        const newBtn = document.getElementById('new-interview');
        if (newBtn) {
            newBtn.addEventListener('click', () => {
                window.location.href = 'dashboard.html#start-interview';
            });
        }
    }

    download() {
        const data = this.reportData;
        if (!data) return;
        
        let content = 'INTERVIEW REPORT\n';
        content += '='.repeat(40) + '\n\n';
        content += `Exam: ${data.exam}\n`;
        content += `Date: ${new Date(data.date).toLocaleString()}\n`;
        content += `Score: ${data.overallScore}%\n\n`;
        content += 'QUESTIONS:\n';
        
        data.questions.forEach((q, i) => {
            content += `\nQ${i+1}: ${q.text}\n`;
            content += `Score: ${q.score}%\n`;
            content += `Feedback: ${q.feedback}\n`;
        });
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new InterviewReport();
});