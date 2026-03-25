class Dashboard {
    constructor() {
        this.currentUser = null;
    this.uploadedResumeId = null;
    this.interviews = [];
    this.profilePhoto = localStorage.getItem('profilePhoto') || null;  // ← YEH LINE ADD
    this.init();
    }
async init() {
    await this.loadUserData();
    await this.loadInterviewData();
    this.setupEventListeners();
    this.loadCharts();
    this.loadRecentInterviews();
    this.initSettings();
    this.setupProfileEdit();   // ← ADD THIS
    this.setupPhotoUpload();   // ← ADD THIS
    
    const hash = window.location.hash.substring(1);
    if (hash) {
        this.navigateTo(hash);
    }
}
    async loadUserData() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = 'login.html';
                return;
            }

            try {
                const response = await API.getCurrentUser();
                this.currentUser = response.user;
                console.log('✅ User loaded from API:', this.currentUser);
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            } catch (apiError) {
                console.log('⚠️ API error, using localStorage');
                const savedUser = localStorage.getItem('currentUser');
                if (savedUser) {
                    this.currentUser = JSON.parse(savedUser);
                } else {
                    this.currentUser = {
                        id: 1,
                        name: 'Interview Candidate',
                        email: 'candidate@example.com',
                        joined: 'January 2024',
                        stats: {
                            totalInterviews: 8,
                            averageScore: 76,
                            confidenceScore: 71,
                            technicalScore: 74,
                            communicationScore: 78
                        }
                    };
                }
            }
            
            // Update sidebar user info
            const sidebarName = document.getElementById('sidebar-user-name');
            const sidebarEmail = document.getElementById('sidebar-user-email');
            const greetingName = document.getElementById('greeting-name');
            
            if (sidebarName) sidebarName.textContent = this.currentUser.name;
            if (sidebarEmail) sidebarEmail.textContent = this.currentUser.email;
            if (greetingName) greetingName.textContent = this.currentUser.name.split(' ')[0];
            
            // Update profile icon with user initial
            this.updateProfileIcon(this.currentUser.name);
            
            // Update profile page data
            this.updateProfilePageData();
            
            // Update stats with real data
            if (this.currentUser.stats) {
                const totalInterviews = document.getElementById('total-interviews');
                const avgScore = document.getElementById('average-score');
                const confScore = document.getElementById('confidence-score');
                const techScore = document.getElementById('technical-score');
                
                if (totalInterviews) totalInterviews.textContent = this.currentUser.stats.totalInterviews || 0;
                if (avgScore) avgScore.textContent = (this.currentUser.stats.averageScore || 0) + '%';
                if (confScore) confScore.textContent = (this.currentUser.stats.confidenceScore || 0) + '%';
                if (techScore) techScore.textContent = (this.currentUser.stats.technicalScore || 0) + '%';
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            if (error.message === 'Not authorized') {
                window.location.href = 'login.html';
            }
        }
    }
    async init() {
    await this.loadUserData();
    await this.loadInterviewData();
    this.setupEventListeners();
    this.loadCharts();
    this.loadRecentInterviews();
    this.initSettings();
    this.setupProfileEdit();   // ← ADD THIS
    this.setupPhotoUpload();   // ← ADD THIS
    }
  updateProfilePageData() {
    if (!this.currentUser) return;
    
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const profilePhone = document.getElementById('profile-phone');  // ← YEH LINE HONI CHAHIYE
    const profileSkills = document.getElementById('profile-skills');
    const profileExperience = document.getElementById('profile-experience');
    const profileEducation = document.getElementById('profile-education');
    const profileJoined = document.getElementById('profile-joined');
    
    if (profileName) profileName.textContent = this.currentUser.name || 'Not set';
    if (profileEmail) profileEmail.textContent = this.currentUser.email || 'Not set';
    if (profilePhone) profilePhone.textContent = this.currentUser.phone || 'Not provided';  // ← YEH LINE
    if (profileSkills) profileSkills.textContent = this.currentUser.skills || 'Not provided';
    if (profileExperience) profileExperience.textContent = this.currentUser.experience ? `${this.currentUser.experience} years` : 'Not provided';
    if (profileEducation) profileEducation.textContent = this.currentUser.education || 'Not provided';
    if (profileJoined) profileJoined.textContent = this.currentUser.joined || new Date().toLocaleDateString();
    
    // ... rest of code

    // Update stats bars
    const avgScore = this.currentUser.stats?.averageScore || 0;
    const confidence = this.currentUser.stats?.confidenceScore || 0;
    const technical = this.currentUser.stats?.technicalScore || 0;
    
    const avgBar = document.getElementById('profile-avg-bar');
    const confBar = document.getElementById('profile-confidence-bar');
    const techBar = document.getElementById('profile-technical-bar');
    const avgVal = document.getElementById('profile-avg');
    const confVal = document.getElementById('profile-confidence');
    const techVal = document.getElementById('profile-technical');
    
    if (avgBar) avgBar.style.width = avgScore + '%';
    if (confBar) confBar.style.width = confidence + '%';
    if (techBar) techBar.style.width = technical + '%';
    if (avgVal) avgVal.textContent = avgScore + '%';
    if (confVal) confVal.textContent = confidence + '%';
    if (techVal) techVal.textContent = technical + '%';
    
    this.updateAvatar();
}

    async loadInterviewData() {
        try {
            try {
                const response = await API.getRecentInterviews();
                if (response && response.interviews && response.interviews.length > 0) {
                    this.interviews = response.interviews;
                    console.log('✅ Interviews loaded from API:', this.interviews.length);
                } else {
                    this.loadDemoInterviews();
                }
            } catch (apiError) {
                console.log('⚠️ API error, using demo data');
                this.loadDemoInterviews();
            }
        } catch (error) {
            console.error('Error loading interviews:', error);
            this.loadDemoInterviews();
        }
    }

    loadDemoInterviews() {
        this.interviews = [
            {
                id: 1,
                exam: 'TCS NQT',
                subject: 'Technical Interview',
                difficulty: 'Intermediate',
                score: 85,
                confidence: 82,
                status: 'completed',
                date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                questions: [
                    { text: "Explain OOP concepts", score: 88, feedback: "Good understanding" },
                    { text: "What is polymorphism?", score: 82, feedback: "Could add examples" }
                ]
            },
            {
                id: 2,
                exam: 'Google',
                subject: 'System Design',
                difficulty: 'Advanced',
                score: 72,
                confidence: 68,
                status: 'completed',
                date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 3,
                exam: 'Microsoft',
                subject: 'Coding Round',
                difficulty: 'Intermediate',
                score: 91,
                confidence: 88,
                status: 'completed',
                date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 4,
                exam: 'Amazon',
                subject: 'Behavioral Round',
                difficulty: 'Intermediate',
                score: 79,
                confidence: 74,
                status: 'completed',
                date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 5,
                exam: 'Infosys',
                subject: 'HR Interview',
                difficulty: 'Beginner',
                score: 88,
                confidence: 85,
                status: 'completed',
                date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];
        
        if (this.currentUser && this.interviews.length > 0) {
            const totalScore = this.interviews.reduce((sum, i) => sum + (i.score || 0), 0);
            const avgScore = Math.round(totalScore / this.interviews.length);
            const avgConfidence = Math.round(this.interviews.reduce((sum, i) => sum + (i.confidence || 0), 0) / this.interviews.length);
            
            this.currentUser.stats = {
                totalInterviews: this.interviews.length,
                averageScore: avgScore,
                confidenceScore: avgConfidence,
                technicalScore: 74,
                communicationScore: 78
            };
            
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            
            // Update stats in UI
            const totalInterviews = document.getElementById('total-interviews');
            const avgScoreEl = document.getElementById('average-score');
            const confScoreEl = document.getElementById('confidence-score');
            
            if (totalInterviews) totalInterviews.textContent = this.interviews.length;
            if (avgScoreEl) avgScoreEl.textContent = avgScore + '%';
            if (confScoreEl) confScoreEl.textContent = avgConfidence + '%';
        }
        
        console.log('📊 Demo interviews loaded:', this.interviews.length);
    }

    updateProfilePageData() {
        if (!this.currentUser) return;
        
        const profileNameDisplay = document.getElementById('profile-name-display');
        const profileName = document.getElementById('profile-name');
        const profileEmail = document.getElementById('profile-email');
        const profileJoined = document.getElementById('profile-joined');
        const profileInterviews = document.getElementById('profile-interviews');
        
        if (profileNameDisplay) profileNameDisplay.textContent = this.currentUser.name;
        if (profileName) profileName.textContent = this.currentUser.name;
        if (profileEmail) profileEmail.textContent = this.currentUser.email;
        if (profileJoined) profileJoined.textContent = this.currentUser.joined || new Date().toLocaleDateString();
        if (profileInterviews) profileInterviews.textContent = this.currentUser.stats?.totalInterviews || this.interviews.length || 0;
        
        const bestScore = document.getElementById('profile-best-score');
        if (bestScore && this.interviews.length > 0) {
            const best = Math.max(...this.interviews.map(i => i.score || 0));
            bestScore.textContent = best + '%';
        }
        
        const avgScore = this.currentUser.stats?.averageScore || 
            (this.interviews.length > 0 ? Math.round(this.interviews.reduce((s, i) => s + (i.score || 0), 0) / this.interviews.length) : 0);
        const confidence = this.currentUser.stats?.confidenceScore ||
            (this.interviews.length > 0 ? Math.round(this.interviews.reduce((s, i) => s + (i.confidence || 0), 0) / this.interviews.length) : 0);
        const technical = this.currentUser.stats?.technicalScore || 74;
        const communication = this.currentUser.stats?.communicationScore || 78;
        
        const profileAvg = document.getElementById('profile-avg');
        const profileAvgBar = document.getElementById('profile-avg-bar');
        const profileConfidence = document.getElementById('profile-confidence');
        const profileConfidenceBar = document.getElementById('profile-confidence-bar');
        const profileTechnical = document.getElementById('profile-technical');
        const profileTechnicalBar = document.getElementById('profile-technical-bar');
        const profileCommunication = document.getElementById('profile-communication');
        const profileCommunicationBar = document.getElementById('profile-communication-bar');
        
        if (profileAvg) profileAvg.textContent = avgScore + '%';
        if (profileAvgBar) profileAvgBar.style.width = avgScore + '%';
        if (profileConfidence) profileConfidence.textContent = confidence + '%';
        if (profileConfidenceBar) profileConfidenceBar.style.width = confidence + '%';
        if (profileTechnical) profileTechnical.textContent = technical + '%';
        if (profileTechnicalBar) profileTechnicalBar.style.width = technical + '%';
        if (profileCommunication) profileCommunication.textContent = communication + '%';
        if (profileCommunicationBar) profileCommunicationBar.style.width = communication + '%';
        
        this.updateProfileAvatar(this.currentUser.name);
    }

    updateProfileIcon(name) {
        const avatarDiv = document.querySelector('.user-avatar');
        if (!avatarDiv) return;
        
        if (name) {
            const initial = name.charAt(0).toUpperCase();
            avatarDiv.innerHTML = '';
            avatarDiv.style.background = 'linear-gradient(135deg, #14b8a6, #8b5cf6)';
            avatarDiv.style.width = '60px';
            avatarDiv.style.height = '60px';
            avatarDiv.style.borderRadius = '50%';
            avatarDiv.style.display = 'flex';
            avatarDiv.style.alignItems = 'center';
            avatarDiv.style.justifyContent = 'center';
            avatarDiv.style.margin = '0 auto';
            
            const span = document.createElement('span');
            span.textContent = initial;
            span.style.fontSize = '1.8rem';
            span.style.fontWeight = '600';
            span.style.color = 'white';
            avatarDiv.appendChild(span);
        }
    }

    updateProfileAvatar(name) {
        const profileAvatar = document.querySelector('.profile-avatar-large');
        if (profileAvatar && name) {
            const initial = name.charAt(0).toUpperCase();
            profileAvatar.innerHTML = '';
            profileAvatar.style.background = 'linear-gradient(135deg, #14b8a6, #8b5cf6)';
            profileAvatar.style.width = '100px';
            profileAvatar.style.height = '100px';
            profileAvatar.style.borderRadius = '50%';
            profileAvatar.style.display = 'flex';
            profileAvatar.style.alignItems = 'center';
            profileAvatar.style.justifyContent = 'center';
            profileAvatar.style.margin = '0 auto';
            
            const span = document.createElement('span');
            span.textContent = initial;
            span.style.fontSize = '3rem';
            span.style.fontWeight = '600';
            span.style.color = 'white';
            profileAvatar.appendChild(span);
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        
        if (diff === 0) return 'Today';
        if (diff === 1) return 'Yesterday';
        if (diff < 7) return `${diff} days ago`;
        return date.toLocaleDateString();
    }

    getScoreClass(score) {
        if (score >= 85) return 'excellent';
        if (score >= 70) return 'good';
        if (score >= 55) return 'average';
        return 'needs-improvement';
    }

    setupProfileModal() {
        const editBtn = document.getElementById('edit-profile-btn');
        const modal = document.getElementById('edit-profile-modal');
        const closeBtn = document.querySelector('.modal-close');
        const cancelBtn = document.getElementById('cancel-edit');
        const form = document.getElementById('edit-profile-form');
        
        if (!modal) return;
        
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                modal.classList.add('active');
                const nameInput = document.getElementById('edit-name');
                const emailInput = document.getElementById('edit-email');
                const phoneInput = document.getElementById('edit-phone');
                const locationInput = document.getElementById('edit-location');
                
                if (nameInput) nameInput.value = this.currentUser?.name || '';
                if (emailInput) emailInput.value = this.currentUser?.email || '';
                if (phoneInput) phoneInput.value = this.currentUser?.phone || '';
                if (locationInput) locationInput.value = this.currentUser?.location || '';
            });
        }
        
        const closeModal = () => modal.classList.remove('active');
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const newName = document.getElementById('edit-name')?.value || '';
                const newEmail = document.getElementById('edit-email')?.value || '';
                const newPhone = document.getElementById('edit-phone')?.value || '';
                const newLocation = document.getElementById('edit-location')?.value || '';
                
                if (newName && newEmail) {
                    this.currentUser.name = newName;
                    this.currentUser.email = newEmail;
                    this.currentUser.phone = newPhone;
                    this.currentUser.location = newLocation;
                    
                    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                    this.updateProfilePageData();
                    
                    const sidebarName = document.getElementById('sidebar-user-name');
                    const sidebarEmail = document.getElementById('sidebar-user-email');
                    const greetingName = document.getElementById('greeting-name');
                    
                    if (sidebarName) sidebarName.textContent = newName;
                    if (sidebarEmail) sidebarEmail.textContent = newEmail;
                    if (greetingName) greetingName.textContent = newName.split(' ')[0];
                    
                    this.showToast('Profile updated successfully!', 'success');
                    closeModal();
                } else {
                    this.showToast('Please fill all required fields', 'error');
                }
            });
        }
    }

    setupEventListeners() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.currentTarget.dataset.page;
                if (page && page !== 'logout') this.navigateTo(page);
            });
        });

        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }

        const startExamBtn = document.getElementById('start-exam-interview');
        if (startExamBtn) {
            const newBtn = startExamBtn.cloneNode(true);
            startExamBtn.parentNode.replaceChild(newBtn, startExamBtn);
            
            newBtn.addEventListener('click', () => {
                const exam = document.getElementById('exam-select').value;
                const difficulty = document.querySelector('.difficulty-btn.active')?.dataset.level;
                const countElement = document.getElementById('question-count');
                const count = countElement ? countElement.value : '10';
                
                if (exam && difficulty) {
                    this.startExamInterview(exam, difficulty, count);
                } else {
                    this.showToast('Please select exam and difficulty level', 'error');
                }
            });
        }

        const uploadArea = document.getElementById('resume-upload');
        const fileInput = document.getElementById('resume-file');
        const startResumeBtn = document.getElementById('start-resume-interview');
        
        if (uploadArea && fileInput) {
            uploadArea.addEventListener('click', () => fileInput.click());
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            });
            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('dragover');
            });
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
                this.handleFileUpload(e.dataTransfer.files[0]);
            });
            fileInput.addEventListener('change', (e) => {
                this.handleFileUpload(e.target.files[0]);
            });
        }

        if (startResumeBtn) {
            const newResumeBtn = startResumeBtn.cloneNode(true);
            startResumeBtn.parentNode.replaceChild(newResumeBtn, startResumeBtn);
            newResumeBtn.addEventListener('click', () => {
                this.startResumeInterview();
            });
        }

        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        const historyFilter = document.getElementById('history-filter');
        if (historyFilter) {
            historyFilter.addEventListener('change', () => this.filterHistory());
        }

        const historySearch = document.getElementById('history-search');
        if (historySearch) {
            historySearch.addEventListener('input', () => this.filterHistory());
        }

        const changeAvatar = document.getElementById('change-avatar');
        if (changeAvatar) {
            changeAvatar.addEventListener('click', () => {
                this.showToast('Avatar upload coming soon!', 'info');
            });
        }
    }

    // ========== FIXED: Resume File Upload ==========
    async handleFileUpload(file) {
        if (!file) return;
        console.log('📄 File selected:', file.name, file.type, file.size);

        const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
        if (!validTypes.includes(file.type) && !file.name.endsWith('.pdf') && !file.name.endsWith('.docx') && !file.name.endsWith('.txt')) {
            this.showToast('Please upload a PDF, DOCX, or TXT file', 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            this.showToast('File size must be less than 5MB', 'error');
            return;
        }

        try {
            this.showToast('Uploading resume...', 'info');
            
            // Store resume in localStorage
            const resumeId = 'resume_' + Date.now();
            const resumeData = {
                id: resumeId,
                name: file.name,
                size: file.size,
                type: file.type,
                content: await this.readFileAsText(file),
                uploadedAt: new Date().toISOString()
            };
            
            localStorage.setItem('currentResume', JSON.stringify(resumeData));
            localStorage.setItem('currentResumeId', resumeId);
            
            const uploadArea = document.getElementById('resume-upload');
            if (uploadArea) {
                uploadArea.querySelector('p').textContent = `✅ ${file.name} uploaded!`;
                uploadArea.style.borderColor = '#10b981';
            }
            
            const startBtn = document.getElementById('start-resume-interview');
            if (startBtn) {
                startBtn.disabled = false;
                startBtn.style.opacity = '1';
                startBtn.style.cursor = 'pointer';
            }
            
            this.showToast('Resume uploaded successfully!', 'success');
            
        } catch (error) {
            console.error('Error uploading resume:', error);
            this.showToast('Failed to upload resume', 'error');
        }
    }

    // Helper: Read file as text
    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }

    // ========== FIXED: Start Exam Interview (10 Questions Fixed) ==========
    async startExamInterview(exam, difficulty, count) {
        try {
            const questionCount = 10; // Fixed 10 questions
            console.log('📊 Starting interview with', questionCount, 'questions');
            
            this.showToast(`Starting ${exam} interview with ${questionCount} questions...`, 'info');
            
            // Save interview settings
            localStorage.setItem('currentInterview', JSON.stringify({
                type: 'exam',
                exam: exam,
                difficulty: difficulty,
                questionCount: questionCount
            }));
            
            // Redirect with count parameter
            setTimeout(() => {
                window.location.href = `interview-room.html?exam=${encodeURIComponent(exam)}&difficulty=${difficulty}&count=${questionCount}`;
            }, 1000);
            
        } catch (error) {
            console.error('Error starting interview:', error);
            this.showToast('Failed to start interview. Please try again.', 'error');
        }
    }

    // ========== FIXED: Start Resume Interview ==========
    async startResumeInterview() {
        const resumeData = JSON.parse(localStorage.getItem('currentResume'));
        const resumeId = localStorage.getItem('currentResumeId');
        
        console.log('Starting resume interview - Resume:', resumeData);
        
        if (!resumeId || !resumeData) {
            this.showToast('Please upload a resume first', 'error');
            return;
        }
        
        this.showToast('Starting resume-based interview...', 'info');
        
        try {
            // Get selected difficulty
            const difficulty = document.querySelector('.difficulty-btn.active')?.dataset.level || 'intermediate';
            
            // Save interview settings
            localStorage.setItem('currentInterview', JSON.stringify({
                type: 'resume',
                id: resumeId,
                difficulty: difficulty,
                resumeData: resumeData
            }));
            
            // Redirect to interview room
            setTimeout(() => {
                window.location.href = `interview-room.html?type=resume&id=${resumeId}&difficulty=${difficulty}`;
            }, 1000);
            
        } catch (error) {
            console.error('Error starting resume interview:', error);
            this.showToast('Failed to start interview. Please try again.', 'error');
        }
    }

    navigateTo(page) {
        window.location.hash = page;
        
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === page) item.classList.add('active');
        });

        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        
        const selectedPage = document.getElementById(`${page}-page`);
        if (selectedPage) {
            selectedPage.classList.add('active');
            
            if (page === 'reports') this.loadReports();
            else if (page === 'history') this.loadInterviewHistory();
            else if (page === 'profile') this.updateProfilePageData();
        }
    }

    async loadReports() {
        try {
            const response = await API.getUserReports();
            const reportsList = document.getElementById('reports-list');
            const totalReports = document.getElementById('total-reports');
            const avgScore = document.getElementById('reports-avg-score');
            const bestScore = document.getElementById('best-score');
            
            if (reportsList && response.reports) {
                if (totalReports) totalReports.textContent = response.reports.length;
                let total = 0, best = 0;
                response.reports.forEach(report => {
                    total += report.overallScore;
                    if (report.overallScore > best) best = report.overallScore;
                });
                if (avgScore) avgScore.textContent = response.reports.length ? Math.round(total / response.reports.length) + '%' : '0%';
                if (bestScore) bestScore.textContent = best + '%';
                
                if (response.reports.length === 0) {
                    reportsList.innerHTML = '<div class="text-center">No reports yet. Complete an interview to see your report!</div>';
                } else {
                    reportsList.innerHTML = response.reports.map(report => `
                        <div class="report-item glass-effect">
                            <div class="report-info">
                                <h4>${report.subject} Interview</h4>
                                <p>Difficulty: ${report.difficulty} | Score: ${report.overallScore}%</p>
                                <small>${new Date(report.date).toLocaleDateString()}</small>
                            </div>
                            <button onclick="viewReport('${report.id}')" class="btn-outline btn-small">View Report</button>
                        </div>
                    `).join('');
                }
            } else {
                this.loadDemoReports();
            }
        } catch (error) {
            console.error('Error loading reports:', error);
            this.loadDemoReports();
        }
    }

    loadDemoReports() {
        const reportsList = document.getElementById('reports-list');
        const totalReports = document.getElementById('total-reports');
        const avgScore = document.getElementById('reports-avg-score');
        const bestScore = document.getElementById('best-score');
        
        if (totalReports) totalReports.textContent = this.interviews.length;
        if (avgScore) {
            const avg = Math.round(this.interviews.reduce((s, i) => s + (i.score || 0), 0) / this.interviews.length);
            avgScore.textContent = avg + '%';
        }
        if (bestScore) {
            const best = Math.max(...this.interviews.map(i => i.score || 0));
            bestScore.textContent = best + '%';
        }
        
        if (reportsList) {
            reportsList.innerHTML = this.interviews.map(interview => `
                <div class="report-card" onclick="viewReport(${interview.id})">
                    <div class="report-card-header">
                        <div class="report-title">
                            <h4>${interview.exam || interview.subject}</h4>
                            <span class="report-date">${this.formatDate(interview.date)}</span>
                        </div>
                        <div class="report-score ${this.getScoreClass(interview.score)}">
                            ${interview.score}%
                        </div>
                    </div>
                    <div class="report-card-body">
                        <div class="report-stats">
                            <div class="stat">
                                <span class="stat-label">Difficulty</span>
                                <span class="stat-value">${interview.difficulty || 'Intermediate'}</span>
                            </div>
                            <div class="stat">
                                <span class="stat-label">Confidence</span>
                                <span class="stat-value">${interview.confidence || 0}%</span>
                            </div>
                            <div class="stat">
                                <span class="stat-label">Questions</span>
                                <span class="stat-value">${interview.questions?.length || 5}</span>
                            </div>
                        </div>
                        <div class="report-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${interview.score || 0}%"></div>
                            </div>
                        </div>
                    </div>
                    <div class="report-card-footer">
                        <button class="btn-view-full">View Full Report <i class="fas fa-chevron-right"></i></button>
                    </div>
                </div>
            `).join('');
        }
    }

    async loadInterviewHistory() {
        try {
            const response = await API.getRecentInterviews();
            const historyList = document.getElementById('history-list');
            
            if (historyList) {
                if (!response.interviews || response.interviews.length === 0) {
                    this.loadDemoHistory();
                } else {
                    window.allInterviews = response.interviews;
                    this.displayFilteredHistory(response.interviews);
                }
            }
        } catch (error) {
            console.error('Error loading history:', error);
            this.loadDemoHistory();
        }
    }

    loadDemoHistory() {
        const historyList = document.getElementById('history-list');
        if (historyList) {
            historyList.innerHTML = this.interviews.map(interview => `
                <div class="history-card" onclick="viewReport(${interview.id})">
                    <div class="history-card-left">
                        <div class="history-icon ${interview.status}">
                            <i class="fas ${interview.status === 'completed' ? 'fa-check-circle' : 'fa-play-circle'}"></i>
                        </div>
                        <div class="history-info">
                            <h4>${interview.exam || interview.subject}</h4>
                            <div class="history-meta">
                                <span class="difficulty ${interview.difficulty?.toLowerCase()}">
                                    <i class="fas fa-chart-line"></i> ${interview.difficulty || 'Intermediate'}
                                </span>
                                <span class="date">
                                    <i class="fas fa-calendar-alt"></i> ${this.formatDate(interview.date)}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="history-card-right">
                        <div class="score-circle">
                            <span class="score-value">${interview.score || '-'}</span>
                            <span class="score-label">Score</span>
                        </div>
                        <div class="confidence-indicator">
                            <div class="confidence-bar" style="width: ${interview.confidence || 0}%"></div>
                            <span>${interview.confidence || 0}%</span>
                        </div>
                        <button class="btn-view-details"><i class="fas fa-arrow-right"></i></button>
                    </div>
                </div>
            `).join('');
        }
    }

    displayFilteredHistory(interviews) {
        const historyList = document.getElementById('history-list');
        if (!historyList) return;
        
        if (!interviews || interviews.length === 0) {
            historyList.innerHTML = '<div class="text-center">No interviews yet. Start your first interview!</div>';
            return;
        }
        
        historyList.innerHTML = interviews.map(interview => `
            <div class="history-item glass-effect">
                <div class="history-info">
                    <h4>${interview.exam || interview.subject || 'Interview'}</h4>
                    <p>Difficulty: ${interview.difficulty || 'Intermediate'} | Status: ${interview.status || 'Completed'}</p>
                    <small>${new Date(interview.date).toLocaleDateString()}</small>
                </div>
                <div>
                    ${interview.status === 'completed' ? 
                        `<button class="btn-small" onclick="viewReport('${interview.id}')">
                            <i class="fas fa-chart-line"></i> Report
                        </button>` :
                        `<button class="btn-small resume-btn" onclick="resumeInterview('${interview.id}')">
                            <i class="fas fa-play"></i> Resume
                        </button>`
                    }
                </div>
            </div>
        `).join('');
    }

    filterHistory() {
        const filter = document.getElementById('history-filter')?.value;
        const search = document.getElementById('history-search')?.value.toLowerCase();
        
        if (!window.allInterviews) return;
        
        let filtered = window.allInterviews;
        
        if (filter && filter !== 'all') {
            filtered = filtered.filter(i => i.status === filter);
        }
        
        if (search) {
            filtered = filtered.filter(i => 
                (i.exam?.toLowerCase().includes(search) || 
                 i.subject?.toLowerCase().includes(search) ||
                 i.difficulty?.toLowerCase().includes(search))
            );
        }
        
        this.displayFilteredHistory(filtered);
    }

    loadUploadedResumes() {
        const resumesList = document.getElementById('resumes-list');
        if (resumesList) {
            const currentResumeId = localStorage.getItem('currentResumeId');
            if (currentResumeId) {
                resumesList.innerHTML = `
                    <div class="resume-item">
                        <div class="resume-item-info">
                            <i class="fas fa-file-pdf"></i>
                            <div>
                                <h4>My Resume</h4>
                                <p>Ready for interview</p>
                            </div>
                        </div>
                        <i class="fas fa-check-circle" style="color: #10b981;"></i>
                    </div>
                `;
            } else {
                resumesList.innerHTML = '<div class="text-center">No resumes uploaded yet.</div>';
            }
        }
    }

    loadCharts() {
        const performanceCtx = document.getElementById('performanceChart')?.getContext('2d');
        if (performanceCtx) {
            const scores = this.interviews.map(i => i.score || 0);
            new Chart(performanceCtx, {
                type: 'line',
                data: {
                    labels: scores.map((_, i) => `#${i + 1}`),
                    datasets: [{
                        label: 'Interview Score',
                        data: scores,
                        borderColor: '#14b8a6',
                        backgroundColor: 'rgba(20, 184, 166, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, max: 100 } }
                }
            });
        }

        const skillsCtx = document.getElementById('skillsChart')?.getContext('2d');
        if (skillsCtx) {
            new Chart(skillsCtx, {
                type: 'radar',
                data: {
                    labels: ['Technical', 'Communication', 'Confidence', 'Problem Solving', 'Behavioral'],
                    datasets: [{
                        label: 'Your Score',
                        data: [
                            this.currentUser?.stats?.technicalScore || 74,
                            this.currentUser?.stats?.communicationScore || 78,
                            this.currentUser?.stats?.confidenceScore || 72,
                            76,
                            70
                        ],
                        backgroundColor: 'rgba(20, 184, 166, 0.2)',
                        borderColor: '#14b8a6',
                        pointBackgroundColor: '#14b8a6'
                    }]
                },
                options: {
                    responsive: true,
                    scales: { r: { beginAtZero: true, max: 100 } }
                }
            });
        }
    }

    async loadRecentInterviews() {
        try {
            const response = await API.getRecentInterviews();
            const tbody = document.getElementById('recent-interviews-list');
            
            if (tbody && response.interviews && response.interviews.length > 0) {
                tbody.innerHTML = response.interviews.slice(0, 5).map(interview => `
                    <tr>
                        <td>${new Date(interview.date).toLocaleDateString()}</td>
                        <td><strong>${interview.exam || interview.subject}</strong><br><small>${interview.difficulty || 'Intermediate'}</small></td>
                        <td><span class="score-badge ${this.getScoreClass(interview.score)}">${interview.score || '-'}%</span></td>
                        <td><span class="confidence-badge">${interview.confidence || '-'}%</span></td>
                        <td><span class="status-badge ${interview.status}">${interview.status === 'completed' ? '✓ Completed' : '⏳ In Progress'}</span></td>
                        <td><button class="btn-view" onclick="viewReport(${interview.id})"><i class="fas fa-eye"></i> View</button></td>
                    </tr>
                `).join('');
            } else {
                this.loadDemoRecentInterviews();
            }
        } catch (error) {
            console.error('Error loading interviews:', error);
            this.loadDemoRecentInterviews();
        }
    }

    loadDemoRecentInterviews() {
        const tbody = document.getElementById('recent-interviews-list');
        if (tbody) {
            tbody.innerHTML = this.interviews.slice(0, 5).map(interview => `
                <tr>
                    <td>${this.formatDate(interview.date)}</td>
                    <td><strong>${interview.exam || interview.subject}</strong><br><small>${interview.difficulty || 'Intermediate'}</small></td>
                    <td><span class="score-badge ${this.getScoreClass(interview.score)}">${interview.score || '-'}%</span></td>
                    <td><span class="confidence-badge">${interview.confidence || '-'}%</span></td>
                    <td><span class="status-badge ${interview.status}">${interview.status === 'completed' ? '✓ Completed' : '⏳ In Progress'}</span></td>
                    <td><button class="btn-view" onclick="viewReport(${interview.id})"><i class="fas fa-eye"></i> View</button></td>
                `
            ).join('');
        }
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('currentResumeId');
        localStorage.removeItem('userSettings');
        localStorage.removeItem('currentInterview');
        localStorage.removeItem('currentUser');
        window.location.href = '../index.html';
    }

    showToast(message, type) {
        const existingToast = document.querySelector('.toast');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            position: fixed; top: 20px; right: 20px; padding: 1rem 1.5rem;
            background: white; border-radius: 12px; box-shadow: 0 10px 15px rgba(0,0,0,0.1);
            z-index: 9999; display: flex; align-items: center; gap: 12px;
            min-width: 300px; animation: slideIn 0.3s ease;
            border-left: 4px solid ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        `;
        
        const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle';
        const color = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6';
        
        toast.innerHTML = `<i class="fas fa-${icon}" style="color: ${color}; font-size: 1.25rem;"></i>
            <span style="color: #1f2937; flex: 1;">${message}</span>`;
        
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    initSettings() {
        this.loadSettings();
        this.setupSettingsListeners();
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('userSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            if (settings.theme) {
                document.documentElement.setAttribute('data-theme', settings.theme);
                document.querySelectorAll('.theme-btn').forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.dataset.theme === settings.theme) btn.classList.add('active');
                });
            }
            if (settings.accentColor) {
                document.documentElement.style.setProperty('--primary-color', settings.accentColor);
                document.querySelectorAll('.color-btn').forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.dataset.color === settings.accentColor) btn.classList.add('active');
                });
            }
            if (settings.voicePitch) {
                const pitch = document.getElementById('voice-pitch');
                if (pitch) pitch.value = settings.voicePitch;
                const pitchVal = document.getElementById('pitch-value');
                if (pitchVal) pitchVal.textContent = settings.voicePitch;
            }
            if (settings.speechRate) {
                const rate = document.getElementById('speech-rate');
                if (rate) rate.value = settings.speechRate;
                const rateVal = document.getElementById('rate-value');
                if (rateVal) rateVal.textContent = settings.speechRate;
            }
            if (settings.voiceVolume) {
                const vol = document.getElementById('voice-volume');
                if (vol) vol.value = settings.voiceVolume;
                const volVal = document.getElementById('volume-value');
                if (volVal) volVal.textContent = Math.round(settings.voiceVolume * 100) + '%';
            }
            const toggles = ['auto-mic', 'show-hints', 'save-transcripts', 'email-notifications', 'practice-reminders', 'daily-tips'];
            toggles.forEach(t => {
                if (settings[t] !== undefined) {
                    const el = document.getElementById(t);
                    if (el) el.checked = settings[t];
                }
            });
            if (settings.questionsCount) {
                const qCount = document.getElementById('questions-count');
                if (qCount) qCount.value = settings.questionsCount;
            }
            if (settings.timeLimit) {
                const tLimit = document.getElementById('time-limit');
                if (tLimit) tLimit.value = settings.timeLimit;
            }
        }
    }

    setupSettingsListeners() {
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.dataset.theme;
                document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                document.documentElement.setAttribute('data-theme', theme);
                this.saveSetting('theme', theme);
                this.showToast(`Theme changed to ${theme} mode`, 'success');
            });
        });

        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const color = btn.dataset.color;
                document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                document.documentElement.style.setProperty('--primary-color', color);
                this.saveSetting('accentColor', color);
                this.showToast('Accent color updated', 'success');
            });
        });

        const pitchSlider = document.getElementById('voice-pitch');
        if (pitchSlider) {
            pitchSlider.addEventListener('input', (e) => {
                document.getElementById('pitch-value').textContent = e.target.value;
                this.saveSetting('voicePitch', e.target.value);
            });
        }

        const rateSlider = document.getElementById('speech-rate');
        if (rateSlider) {
            rateSlider.addEventListener('input', (e) => {
                document.getElementById('rate-value').textContent = e.target.value;
                this.saveSetting('speechRate', e.target.value);
            });
        }

        const volSlider = document.getElementById('voice-volume');
        if (volSlider) {
            volSlider.addEventListener('input', (e) => {
                document.getElementById('volume-value').textContent = Math.round(e.target.value * 100) + '%';
                this.saveSetting('voiceVolume', e.target.value);
            });
        }

        document.getElementById('auto-mic')?.addEventListener('change', (e) => {
            this.saveSetting('autoMic', e.target.checked);
            this.showToast(`Auto-start mic ${e.target.checked ? 'enabled' : 'disabled'}`, 'info');
        });

        document.getElementById('show-hints')?.addEventListener('change', (e) => this.saveSetting('showHints', e.target.checked));
        document.getElementById('save-transcripts')?.addEventListener('change', (e) => this.saveSetting('saveTranscripts', e.target.checked));
        document.getElementById('email-notifications')?.addEventListener('change', (e) => this.saveSetting('emailNotifications', e.target.checked));
        document.getElementById('practice-reminders')?.addEventListener('change', (e) => this.saveSetting('practiceReminders', e.target.checked));
        document.getElementById('daily-tips')?.addEventListener('change', (e) => this.saveSetting('dailyTips', e.target.checked));
        document.getElementById('questions-count')?.addEventListener('change', (e) => this.saveSetting('questionsCount', e.target.value));
        document.getElementById('time-limit')?.addEventListener('change', (e) => this.saveSetting('timeLimit', e.target.value));

        document.getElementById('save-settings')?.addEventListener('click', () => {
            this.saveAllSettings();
            this.showToast('Settings saved successfully!', 'success');
        });

        document.getElementById('reset-settings')?.addEventListener('click', () => this.resetSettings());
    }

    saveSetting(key, value) {
        let settings = JSON.parse(localStorage.getItem('userSettings') || '{}');
        settings[key] = value;
        localStorage.setItem('userSettings', JSON.stringify(settings));
    }

    saveAllSettings() {
        const settings = {
            theme: document.querySelector('.theme-btn.active')?.dataset.theme || 'light',
            accentColor: document.querySelector('.color-btn.active')?.dataset.color || '#14b8a6',
            voicePitch: document.getElementById('voice-pitch')?.value || '1',
            speechRate: document.getElementById('speech-rate')?.value || '1',
            voiceVolume: document.getElementById('voice-volume')?.value || '1',
            autoMic: document.getElementById('auto-mic')?.checked || true,
            showHints: document.getElementById('show-hints')?.checked || true,
            saveTranscripts: document.getElementById('save-transcripts')?.checked || true,
            emailNotifications: document.getElementById('email-notifications')?.checked || true,
            practiceReminders: document.getElementById('practice-reminders')?.checked || true,
            dailyTips: document.getElementById('daily-tips')?.checked || true,
            questionsCount: document.getElementById('questions-count')?.value || '10',
            timeLimit: document.getElementById('time-limit')?.value || '120'
        };
        
        localStorage.setItem('userSettings', JSON.stringify(settings));
        window.interviewSettings = settings;
    }

    resetSettings() {
        const defaultSettings = {
            theme: 'light', accentColor: '#14b8a6', voicePitch: '1', speechRate: '1', voiceVolume: '1',
            autoMic: true, showHints: true, saveTranscripts: true, emailNotifications: true,
            practiceReminders: true, dailyTips: true, questionsCount: '10', timeLimit: '120'
        };
        
        localStorage.setItem('userSettings', JSON.stringify(defaultSettings));
        this.loadSettings();
        this.showToast('Settings reset to default', 'info');
    }    // ========== PROFILE PHOTO FUNCTIONS ==========
   setupPhotoUpload() {
    const uploadBtn = document.getElementById('upload-photo-btn');
    const removeBtn = document.getElementById('remove-photo-btn');
    const photoInput = document.getElementById('profile-photo-input');
    
    if (uploadBtn && photoInput) {
        uploadBtn.onclick = () => photoInput.click();
        photoInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file) this.uploadPhoto(file);
        };
    }
    
    if (removeBtn) {
        removeBtn.onclick = () => this.removePhoto();
    }
}

uploadPhoto(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        localStorage.setItem('profilePhoto', e.target.result);
        this.updateAvatar();
        this.showToast('Photo updated!', 'success');
    };
    reader.readAsDataURL(file);
}

removePhoto() {
    localStorage.removeItem('profilePhoto');
    this.updateAvatar();
    this.showToast('Photo removed', 'info');
}
    updateAvatar() {
        const photo = localStorage.getItem('profilePhoto');
        const avatar = document.querySelector('.user-avatar');
        const profileAvatar = document.querySelector('.profile-avatar-large');
        
        [avatar, profileAvatar].forEach(el => {
            if (!el) return;
            el.innerHTML = '';
            if (photo) {
                const img = document.createElement('img');
                img.src = photo;
                img.style = 'width:100%;height:100%;object-fit:cover;border-radius:50%;';
                el.appendChild(img);
                el.style.background = 'none';
            } else {
                const initial = this.currentUser?.name?.charAt(0).toUpperCase() || 'U';
                el.style.background = 'linear-gradient(135deg, #14b8a6, #8b5cf6)';
                el.style.display = 'flex';
                el.style.alignItems = 'center';
                el.style.justifyContent = 'center';
                const span = document.createElement('span');
                span.textContent = initial;
                span.style = 'font-size:1.8rem;font-weight:600;color:white;';
                el.appendChild(span);
            }
        });
    }
    // ========== DASHBOARD UPDATE FUNCTIONS ==========

async forceUpdateDashboard() {
    console.log('🔄 Force updating dashboard...');
    
    try {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            console.log('✅ User loaded:', this.currentUser.name);
        }
        
        const savedInterviews = localStorage.getItem('interviews');
        if (savedInterviews) {
            this.interviews = JSON.parse(savedInterviews);
            console.log('✅ Interviews loaded:', this.interviews.length);
        }
        
        const total = this.interviews.length;
        const avgScore = total > 0 ? Math.round(this.interviews.reduce((s, i) => s + i.score, 0) / total) : 0;
        const avgConfidence = total > 0 ? Math.round(this.interviews.reduce((s, i) => s + i.confidence, 0) / total) : 0;
        
        const totalEl = document.getElementById('total-interviews');
        const avgEl = document.getElementById('average-score');
        const confEl = document.getElementById('confidence-score');
        const techEl = document.getElementById('technical-score');
        
        if (totalEl) totalEl.textContent = total;
        if (avgEl) avgEl.textContent = avgScore + '%';
        if (confEl) confEl.textContent = avgConfidence + '%';
        if (techEl) techEl.textContent = (this.currentUser?.stats?.technicalScore || 74) + '%';
        
        this.updateRecentInterviewsTable();
        this.loadCharts();
        
        if (document.getElementById('profile-page')?.classList.contains('active')) {
            this.updateProfilePageData();
        }
        
        const sidebarName = document.getElementById('sidebar-user-name');
        const sidebarEmail = document.getElementById('sidebar-user-email');
        if (sidebarName) sidebarName.textContent = this.currentUser?.name || 'User';
        if (sidebarEmail) sidebarEmail.textContent = this.currentUser?.email || '';
        
        this.updateAvatar();
        this.showToast('Dashboard updated!', 'success');
        console.log('✅ Dashboard update complete');
        
    } catch (error) {
        console.error('Update failed:', error);
        this.showToast('Update failed!', 'error');
    }
}

updateRecentInterviewsTable() {
    const tbody = document.getElementById('recent-interviews-list');
    if (!tbody) return;
    
    const recent = this.interviews.slice(0, 5);
    if (recent.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No interviews yet</td></tr>';
        return;
    }
    
    tbody.innerHTML = recent.map(i => `
        <tr>
            <td>${this.formatDate(i.date)}</td>
            <td><strong>${i.exam}</strong><br><small>${i.difficulty}</small></td>
            <td><span class="score-badge ${this.getScoreClass(i.score)}">${i.score}%</span></td>
            <td>${i.confidence}%</td>
            <td><span class="status-badge completed">✓ Completed</span></td>
            <td><button class="btn-view" onclick="viewReport(${i.id})">View</button></td>
        </tr>
    `).join('');
}
// ========== PROFILE EDIT FUNCTIONS ==========
// ========== PROFILE EDIT FUNCTIONS ==========

setupProfileEdit() {
    const editBtn = document.getElementById('edit-profile-btn');
    const saveBtn = document.getElementById('save-profile-btn');
    const cancelBtn = document.getElementById('cancel-edit-btn');
    const editForm = document.getElementById('profile-edit-form');
    const profileView = document.getElementById('profile-view');
    
    if (!editBtn) return;
    
    editBtn.addEventListener('click', () => {
        const editIds = ['edit-name', 'edit-email', 'edit-phone', 'edit-skills', 'edit-experience', 'edit-education'];
        const values = [
            this.currentUser?.name || '',
            this.currentUser?.email || '',
            this.currentUser?.phone || '',
            this.currentUser?.skills || '',
            this.currentUser?.experience || '',
            this.currentUser?.education || ''
        ];
        
        editIds.forEach((id, i) => {
            const el = document.getElementById(id);
            if (el) el.value = values[i];
        });
        
        if (profileView) profileView.style.display = 'none';
        if (editForm) editForm.style.display = 'block';
        editBtn.style.display = 'none';
    });
    
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
        const updatedData = {
            name: document.getElementById('edit-name')?.value || '',
            email: document.getElementById('edit-email')?.value || '',
            phone: document.getElementById('edit-phone')?.value || '',
            skills: document.getElementById('edit-skills')?.value || '',
            experience: document.getElementById('edit-experience')?.value || '',
            education: document.getElementById('edit-education')?.value || ''
        };
        
        console.log('Saving data:', updatedData);
        
        if (!updatedData.name || !updatedData.email) {
            this.showProfileMessage('Name and email are required', 'error');
            return;
        }
        
        // Show loading
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        saveBtn.disabled = true;
        
        try {
            const token = localStorage.getItem('token');
            console.log('Token exists:', !!token);
            
            // Try backend first if token exists
            if (token) {
                const response = await fetch('https://intervai-backend.onrender.com/api/users/profile', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(updatedData)
                });
                
                const data = await response.json();
                console.log('Backend response:', data);
                
                if (response.ok && data.success && data.user) {
                    this.currentUser = data.user;
                    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                    this.showProfileMessage('Profile updated successfully!', 'success');
                } else {
                    // Backend failed, use localStorage fallback
                    if (this.currentUser) {
                        Object.assign(this.currentUser, updatedData);
                        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                    }
                    this.showProfileMessage('Profile updated (local). Backend sync failed.', 'warning');
                }
            } else {
                // No token, use localStorage only
                if (this.currentUser) {
                    Object.assign(this.currentUser, updatedData);
                    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                }
                this.showProfileMessage('Profile updated!', 'success');
            }
        } catch (error) {
            console.error('Network error:', error);
            // Network error - fallback to localStorage
            if (this.currentUser) {
                Object.assign(this.currentUser, updatedData);
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            }
            this.showProfileMessage('Profile updated locally! Network error.', 'warning');
        } finally {
            saveBtn.innerHTML = '💾 Save Changes';
            saveBtn.disabled = false;
            
            // Update UI
            this.updateProfilePageData();
            this.updateSidebarUserInfo();
            this.updateAvatar();
            
            // Hide edit form
            const profileView = document.getElementById('profile-view');
            const editForm = document.getElementById('profile-edit-form');
            const editBtn = document.getElementById('edit-profile-btn');
            
            if (profileView) profileView.style.display = 'block';
            if (editForm) editForm.style.display = 'none';
            if (editBtn) editBtn.style.display = 'inline-flex';
        }
    });

    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            if (profileView) profileView.style.display = 'block';
            if (editForm) editForm.style.display = 'none';
            if (editBtn) editBtn.style.display = 'inline-flex';
        });
    }
}

showProfileMessage(msg, type) {
    const msgBox = document.getElementById('profile-message');
    if (msgBox) {
        msgBox.textContent = msg;
        msgBox.className = type === 'success' ? 'success' : 'error';
        msgBox.style.display = 'block';
        setTimeout(() => {
            msgBox.style.display = 'none';
        }, 3000);
    }

}

updateSidebarUserInfo() {
    const sidebarName = document.getElementById('sidebar-user-name');
    const sidebarEmail = document.getElementById('sidebar-user-email');
    const greetingName = document.getElementById('greeting-name');
    
    if (sidebarName && this.currentUser) sidebarName.textContent = this.currentUser.name;
    if (sidebarEmail && this.currentUser) sidebarEmail.textContent = this.currentUser.email;
    if (greetingName && this.currentUser) greetingName.textContent = this.currentUser.name?.split(' ')[0] || 'User';
}
updateAvatar() {
    const photo = localStorage.getItem('profilePhoto');
    const avatar = document.querySelector('.user-avatar');
    const profileAvatar = document.querySelector('.profile-avatar-large');
    
    [avatar, profileAvatar].forEach(el => {
        if (!el) return;
        el.innerHTML = '';
        if (photo) {
            const img = document.createElement('img');
            img.src = photo;
            img.style = 'width:100%;height:100%;object-fit:cover;border-radius:50%;';
            el.appendChild(img);
            el.style.background = 'none';
        } else {
            const initial = this.currentUser?.name?.charAt(0).toUpperCase() || 'U';
            el.style.background = 'linear-gradient(135deg, #14b8a6, #8b5cf6)';
            el.style.display = 'flex';
            el.style.alignItems = 'center';
            el.style.justifyContent = 'center';
            el.textContent = initial;
            el.style.fontSize = el === profileAvatar ? '3rem' : '1.8rem';
            el.style.fontWeight = '600';
            el.style.color = 'white';
        }
    });

}
}


// Global functions
window.viewReport = (interviewId) => window.location.href = `report.html?id=${interviewId}`;
window.resumeInterview = (interviewId) => window.location.href = `interview-room.html?id=${interviewId}`;

// Initialize
document.addEventListener('DOMContentLoaded', () => new Dashboard());
