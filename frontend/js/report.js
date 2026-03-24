class InterviewReport {
    constructor() {
        this.reportData = null;
        this.init();
    }

    init() {
        console.log('📊 Report page loaded');
        
        // Try to load from localStorage
        const saved = localStorage.getItem('lastReport');
        if (saved) {
            try {
                const rawData = JSON.parse(saved);
                // Handle both structures - with or without 'report' wrapper
                this.reportData = rawData.report || rawData;
                console.log('📦 Loaded report:', this.reportData);
                console.log('Questions in report:', this.reportData.questionAnalysis?.length);
                this.renderReport();
                this.setupEventListeners();
                return;
            } catch(e) {
                console.error('Error parsing:', e);
            }
        }
        
        // If no data, create demo
        this.createDemoReport();
        this.setupEventListeners();
    }

    createDemoReport() {
        console.log('📝 Creating demo report');
        
        this.reportData = {
            id: Date.now(),
            exam: 'Technical Interview',
            date: new Date().toISOString(),
            overallScore: 75,
            confidenceScore: 70,
            communicationScore: 72,
            technicalScore: 78,
            strengths: [
                "Good technical knowledge",
                "Clear communication",
                "Confident answers"
            ],
            weaknesses: [
                "Need more examples",
                "Could be more concise"
            ],
            improvements: [
                "Practice with real examples",
                "Work on pacing",
                "Review core concepts"
            ],
            summary: "Good performance! Keep practicing to improve further.",
            recommendations: [
                "Take another mock interview",
                "Review weak topics",
                "Practice STAR method"
            ],
            questionAnalysis: [
                {
                    question: "Tell me about yourself.",
                    answer: "I am a software developer with 3 years experience...",
                    score: 85,
                    feedback: "Good introduction!",
                    suggestions: "Add specific achievement"
                },
                {
                    question: "What is closure?",
                    answer: "A closure is a function that has access to outer scope...",
                    score: 82,
                    feedback: "Good explanation!",
                    suggestions: "Add code example"
                }
            ]
        };
        
        this.renderReport();
    }

    renderReport() {
        const data = this.reportData;
        if (!data) {
            console.error('No report data');
            return;
        }
        
        console.log('🎨 Rendering report...');
        
        // Update date
        const dateEl = document.getElementById('interview-date');
        if (dateEl) {
            dateEl.textContent = new Date(data.date || Date.now()).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
        
        // Update exam name
        const examEl = document.getElementById('interview-exam');
        if (examEl && data.exam) {
            examEl.textContent = `Exam: ${data.exam}`;
        }
        
        // Update scores
        this.setElement('overall-score', `${Math.round(data.overallScore || 0)}%`);
        this.setElement('confidence-value', `${Math.round(data.confidenceScore || 0)}%`);
        this.setElement('communication-value', `${Math.round(data.communicationScore || 0)}%`);
        this.setElement('technical-value', `${Math.round(data.technicalScore || 0)}%`);
        
        // Update bars
        this.setBar('confidence-bar', data.confidenceScore);
        this.setBar('communication-bar', data.communicationScore);
        this.setBar('technical-bar', data.technicalScore);
        
        // Update circle
        const circle = document.querySelector('.score-circle');
        if (circle && data.overallScore) {
            const degree = (data.overallScore / 100) * 360;
            circle.style.background = `conic-gradient(#4f46e5 0deg ${degree}deg, #e5e7eb ${degree}deg 360deg)`;
        }
        
        // Update lists
        this.setList('strengths-list', data.strengths);
        this.setList('weaknesses-list', data.weaknesses);
        this.setList('improvements-list', data.improvements);
        this.setList('recommendations-list', data.recommendations);
        
        // Update summary
        this.setElement('summary-text', data.summary || 'Great effort! Keep practicing.');
        
        // Update questions
        this.renderQuestions(data.questionAnalysis);
        
        console.log('✅ Report rendered successfully!');
    }

    setElement(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    setBar(id, value) {
        const el = document.getElementById(id);
        if (el && value !== undefined) {
            el.style.width = `${Math.min(100, Math.max(0, value))}%`;
        }
    }

    setList(id, items) {
        const el = document.getElementById(id);
        if (!el) return;
        
        if (items && Array.isArray(items) && items.length > 0) {
            el.innerHTML = items.map(item => `<li>${item}</li>`).join('');
        } else {
            el.innerHTML = '<li>No data available</li>';
        }
    }

    renderQuestions(questions) {
        const container = document.getElementById('questions-analysis');
        if (!container) return;
        
        if (!questions || !Array.isArray(questions) || questions.length === 0) {
            container.innerHTML = '<div style="text-align:center; padding:2rem;">No question analysis available</div>';
            return;
        }
        
        container.innerHTML = questions.map((q, i) => `
            <div style="background:#f9fafb; border-radius:12px; padding:1rem; margin-bottom:1rem; border-left:4px solid #4f46e5;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem; flex-wrap:wrap; gap:0.5rem;">
                    <strong style="color:#1f2937;">Q${i+1}: ${this.escapeHtml(q.question || 'N/A')}</strong>
                    <span style="background:#4f46e5; color:white; padding:4px 12px; border-radius:20px; font-size:0.8rem;">${Math.round(q.score || 0)}%</span>
                </div>
                <div style="background:white; padding:0.8rem; border-radius:8px; margin:0.5rem 0; border:1px solid #e5e7eb;">
                    ${this.escapeHtml(q.answer || 'No answer recorded')}
                </div>
                <div style="color:#10b981; margin-top:0.5rem;">
                    <i class="fas fa-lightbulb"></i> ${this.escapeHtml(q.feedback || 'Keep practicing!')}
                </div>
                <div style="color:#3b82f6; margin-top:0.3rem;">
                    <i class="fas fa-chart-line"></i> ${this.escapeHtml(q.suggestions || 'Review this topic')}
                </div>
            </div>
        `).join('');
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
            downloadBtn.addEventListener('click', () => this.downloadReport());
        }
        
        const newBtn = document.getElementById('new-interview');
        if (newBtn) {
            newBtn.addEventListener('click', () => {
                window.location.href = 'dashboard.html#start-interview';
            });
        }
    }

    downloadReport() {
        const data = this.reportData;
        if (!data) return;
        
        let content = '========================================\n';
        content += '     AI INTERVIEW PERFORMANCE REPORT\n';
        content += '========================================\n\n';
        content += `Date: ${new Date().toLocaleDateString()}\n`;
        content += `Exam: ${data.exam || 'Technical Interview'}\n\n`;
        content += 'SCORES:\n';
        content += `  Overall Score: ${Math.round(data.overallScore || 0)}%\n`;
        content += `  Confidence: ${Math.round(data.confidenceScore || 0)}%\n`;
        content += `  Communication: ${Math.round(data.communicationScore || 0)}%\n`;
        content += `  Technical: ${Math.round(data.technicalScore || 0)}%\n\n`;
        content += 'STRENGTHS:\n';
        if (data.strengths) data.strengths.forEach(s => content += `  ✓ ${s}\n`);
        content += '\nAREAS FOR IMPROVEMENT:\n';
        if (data.weaknesses) data.weaknesses.forEach(w => content += `  ✗ ${w}\n`);
        content += '\nIMPROVEMENT SUGGESTIONS:\n';
        if (data.improvements) data.improvements.forEach(i => content += `  → ${i}\n`);
        content += '\nQUESTION ANALYSIS:\n';
        if (data.questionAnalysis) {
            data.questionAnalysis.forEach((q, i) => {
                content += `\nQ${i+1}: ${q.question}\n`;
                content += `Score: ${Math.round(q.score)}%\n`;
                content += `Answer: ${q.answer || 'No answer'}\n`;
                content += `Feedback: ${q.feedback}\n`;
                content += `Suggestions: ${q.suggestions}\n`;
                content += '-'.repeat(40) + '\n';
            });
        }
        content += '\nSUMMARY:\n  ' + (data.summary || 'Great effort!') + '\n';
        content += '\nRECOMMENDATIONS:\n';
        if (data.recommendations) data.recommendations.forEach(r => content += `  ★ ${r}\n`);
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `interview-report-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new InterviewReport();
});