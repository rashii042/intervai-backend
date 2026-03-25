// ==================== REAL CONFIDENCE ANALYZER ====================
class RealConfidenceAnalyzer {
    constructor() {
        this.stream = null;
        this.audioContext = null;
        this.analyser = null;
        this.volume = 0;
        this.volumeHistory = [];
        this.currentConfidence = 70;
        this.onConfidenceUpdate = null;
        this.analysisInterval = null;
        this.video = null;
    }

    async startAnalysis(videoElement) {
        this.video = videoElement;
        
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            const source = this.audioContext.createMediaStreamSource(this.stream);
            source.connect(this.analyser);
            this.analyser.fftSize = 256;
            console.log('✅ Voice analysis started');
        } catch(e) {
            console.log('Voice analysis not available:', e);
        }
        
        this.startConfidenceAnalysis();
    }

    startConfidenceAnalysis() {
        this.analysisInterval = setInterval(() => {
            let volumeConfidence = 50;
            if (this.analyser) {
                const bufferLength = this.analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);
                this.analyser.getByteTimeDomainData(dataArray);
                
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                    const v = (dataArray[i] - 128) / 128;
                    sum += v * v;
                }
                const rms = Math.sqrt(sum / bufferLength);
                this.volume = Math.min(1, rms * 2);
                
                if (this.volume > 0.15) {
                    volumeConfidence = 50 + (this.volume * 40);
                } else {
                    volumeConfidence = 40;
                }
                volumeConfidence = Math.min(95, Math.max(35, volumeConfidence));
            }
            
            this.volumeHistory.push(this.volume);
            if (this.volumeHistory.length > 10) this.volumeHistory.shift();
            
            const avgVolume = this.volumeHistory.reduce((a, b) => a + b, 0) / this.volumeHistory.length;
            const variance = this.volumeHistory.reduce((a, b) => a + Math.pow(b - avgVolume, 2), 0) / this.volumeHistory.length;
            const stabilityConfidence = variance < 0.01 ? 20 : variance < 0.05 ? 10 : 0;
            
            let finalConfidence = Math.round((volumeConfidence * 0.7) + (stabilityConfidence * 0.3));
            this.currentConfidence = Math.round(this.currentConfidence * 0.6 + finalConfidence * 0.4);
            this.currentConfidence = Math.min(98, Math.max(30, this.currentConfidence));
            
            if (this.onConfidenceUpdate) {
                this.onConfidenceUpdate(this.currentConfidence);
            }
        }, 1500);
    }

    updateWhileSpeaking() {
        if (this.volume > 0.1) {
            let boost = Math.min(10, Math.floor(this.volume * 15));
            this.currentConfidence = Math.min(98, this.currentConfidence + boost);
            if (this.onConfidenceUpdate) {
                this.onConfidenceUpdate(this.currentConfidence);
            }
        }
    }

    stopAnalysis() {
        if (this.analysisInterval) clearInterval(this.analysisInterval);
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        if (this.audioContext) {
            this.audioContext.close();
        }
    }

    getCurrentConfidence() {
        return this.currentConfidence;
    }
}

// ==================== SPEECH RECOGNITION SERVICE ====================
class SpeechRecognitionService {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.shouldBeListening = false;
        this.finalTranscript = '';
        this.interimTranscript = '';
        this.onTranscriptUpdate = null;
        this.onFinalTranscript = null;
        this.initRecognition();
    }

    initRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.error('Speech recognition not supported');
            alert('Your browser does not support speech recognition. Please use Chrome, Edge, or Safari.');
            return;
        }
        
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        
        this.recognition.onstart = () => {
            console.log('🎤 Speech started');
            this.isListening = true;
            this.finalTranscript = '';
        };
        
        this.recognition.onend = () => {
            console.log('🎤 Speech ended');
            this.isListening = false;
            if (this.shouldBeListening) {
                setTimeout(() => this.startListening(), 500);
            }
        };
        
        this.recognition.onresult = (event) => {
            let interim = '';
            let final = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    final += transcript + ' ';
                } else {
                    interim += transcript;
                }
            }
            
            if (final) {
                this.finalTranscript += final;
                if (this.onFinalTranscript) {
                    this.onFinalTranscript(this.finalTranscript.trim());
                }
            }
            
            this.interimTranscript = interim;
            if (this.onTranscriptUpdate) {
                this.onTranscriptUpdate(this.finalTranscript, this.interimTranscript);
            }
        };
        
        this.recognition.onerror = (event) => {
            console.error('Speech error:', event.error);
            if (event.error === 'not-allowed') {
                alert('Microphone access denied. Please allow microphone access.');
            }
        };
    }

    startListening() {
        if (!this.recognition || this.isListening) return;
        this.shouldBeListening = true;
        try { this.recognition.start(); } catch(e) {}
    }

    stopListening() {
        this.shouldBeListening = false;
        if (this.recognition && this.isListening) {
            try { this.recognition.stop(); } catch(e) {}
        }
    }

    reset() {
        this.finalTranscript = '';
        this.interimTranscript = '';
        if (this.onTranscriptUpdate) {
            this.onTranscriptUpdate('', '');
        }
    }
}

// ==================== TEXT TO SPEECH SERVICE ====================
class TextToSpeechService {
    constructor() {
        this.synthesis = window.speechSynthesis;
        this.onStart = null;
        this.onEnd = null;
    }

    speak(text) {
        if (!this.synthesis) return;
        this.synthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        utterance.onstart = () => { if(this.onStart) this.onStart(); };
        utterance.onend = () => { if(this.onEnd) this.onEnd(); };
        this.synthesis.speak(utterance);
    }

    stop() {
        if (this.synthesis) this.synthesis.cancel();
    }
}

// ==================== MAIN INTERVIEW ROOM ====================
class InterviewRoom {
    constructor() {
        this.currentIndex = 0;
        this.questions = [];
        this.answers = [];
        this.examType = null;
        this.difficulty = null;
        this.isAnswering = false;
        this.answerTimeLeft = 120;
        this.answerTimer = null;
        this.startTime = Date.now();
        this.interviewCompleted = false;
        
        const urlParams = new URLSearchParams(window.location.search);
        this.examType = urlParams.get('exam') || 'Technical Interview';
        this.difficulty = urlParams.get('difficulty') || 'Intermediate';
        this.totalQuestionCount = parseInt(urlParams.get('count')) || 10;
        
        console.log('🎯 Interview Started:', { examType: this.examType, difficulty: this.difficulty, total: this.totalQuestionCount });
        
        this.speechRecognition = new SpeechRecognitionService();
        this.textToSpeech = new TextToSpeechService();
        this.confidenceAnalyzer = new RealConfidenceAnalyzer();
        
        this.getElements();
        this.init();
    }

    getElements() {
        this.webcamVideo = document.getElementById('webcam');
        this.questionText = document.getElementById('question-text');
        this.speechTranscript = document.getElementById('speech-transcript');
        this.speechInterim = document.getElementById('speech-interim');
        this.aiStatusText = document.getElementById('ai-status-text');
        this.statusIndicator = document.querySelector('.status-indicator');
        this.micStatus = document.getElementById('mic-status');
        this.speakingAnimation = document.getElementById('speaking-animation');
        this.timerValue = document.getElementById('timer-value');
        this.currentNum = document.getElementById('current-question-num');
        this.totalQuestionsEl = document.getElementById('total-questions');
        this.questionProgress = document.getElementById('question-progress');
        this.confidenceFill = document.getElementById('confidence-fill');
        this.confidencePercent = document.getElementById('confidence-percent');
        this.nextBtn = document.getElementById('next-question-btn');
        this.endBtn = document.getElementById('end-interview-btn');
        this.endBottomBtn = document.getElementById('end-interview-bottom-btn');
        this.endModal = document.getElementById('end-interview-modal');
        this.cancelBtn = document.getElementById('cancel-end');
        this.confirmBtn = document.getElementById('confirm-end');
        this.examDisplay = document.getElementById('exam-display');
        this.difficultyDisplay = document.getElementById('difficulty-display');
        this.cameraStatus = document.getElementById('camera-status');
    }

    async init() {
        try {
            if (this.examDisplay) this.examDisplay.textContent = this.examType;
            if (this.difficultyDisplay) this.difficultyDisplay.textContent = this.difficulty;
            
            await this.loadQuestions();
            await this.startCameraAndAnalysis();
            
            this.confidenceAnalyzer.onConfidenceUpdate = (confidence) => {
                if (this.confidenceFill) this.confidenceFill.style.width = confidence + '%';
                if (this.confidencePercent) {
                    this.confidencePercent.textContent = Math.round(confidence) + '%';
                    if (confidence >= 70) {
                        this.confidencePercent.style.color = '#14b8a6';
                        this.confidencePercent.style.background = 'rgba(20, 184, 166, 0.2)';
                    } else if (confidence >= 50) {
                        this.confidencePercent.style.color = '#f59e0b';
                        this.confidencePercent.style.background = 'rgba(245, 158, 11, 0.2)';
                    } else {
                        this.confidencePercent.style.color = '#ef4444';
                        this.confidencePercent.style.background = 'rgba(239, 68, 68, 0.2)';
                    }
                }
            };
            
            this.speechRecognition.onTranscriptUpdate = (final, interim) => {
                if (this.speechTranscript) {
                    if (final && final.trim()) this.speechTranscript.textContent = final;
                    else this.speechTranscript.textContent = 'Start speaking...';
                }
                if (this.speechInterim) this.speechInterim.textContent = interim;
                if (interim && interim.trim()) this.confidenceAnalyzer.updateWhileSpeaking();
            };
            
            this.speechRecognition.onFinalTranscript = (transcript) => {
                this.saveAnswer(transcript);
            };
            
            this.textToSpeech.onStart = () => this.onAISpeaking();
            this.textToSpeech.onEnd = () => this.onAIFinished();
            
            if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.nextQuestion());
            if (this.endBtn) this.endBtn.addEventListener('click', () => this.showModal());
            if (this.endBottomBtn) this.endBottomBtn.addEventListener('click', () => this.showModal());
            if (this.cancelBtn) this.cancelBtn.addEventListener('click', () => this.hideModal());
            if (this.confirmBtn) this.confirmBtn.addEventListener('click', () => this.endInterview());
            
            setTimeout(() => this.startInterview(), 2000);
            setInterval(() => this.updateOverallTimer(), 1000);
            
        } catch(e) {
            console.error('Init error:', e);
        }
    }

    async startCameraAndAnalysis() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if (this.webcamVideo) {
                this.webcamVideo.srcObject = stream;
                await this.webcamVideo.play();
            }
            if (this.cameraStatus) {
                this.cameraStatus.innerHTML = '<i class="fas fa-check-circle"></i> Camera ON';
                this.cameraStatus.style.color = '#10b981';
            }
            await this.confidenceAnalyzer.startAnalysis(this.webcamVideo);
        } catch(error) {
            console.error('Camera error:', error);
            if (this.cameraStatus) {
                this.cameraStatus.innerHTML = '<i class="fas fa-exclamation-circle"></i> Camera OFF';
                this.cameraStatus.style.color = '#ef4444';
            }
        }
    }

    // ========== LOAD QUESTIONS WITH CORRECT COUNT ==========
    // ========== LOAD QUESTIONS - FIXED 10 QUESTIONS ==========
async loadQuestions() {
    // Fixed 10 questions total
    this.totalQuestionCount = 10;
    
    console.log('🎯 INTERVIEW CONFIG:', { 
        examType: this.examType, 
        difficulty: this.difficulty, 
        totalCount: this.totalQuestionCount
    });
    
    this.showToast(`Generating 10 questions with AI...`, 'info');
    
    // Fixed first 3 general questions
    const generalQuestions = [
        "Tell me about yourself.",
        "What are your greatest strengths?",
        "What are your weaknesses?"
    ];
    
    // Calculate how many API questions needed (7 for 10 total)
    const generalCount = generalQuestions.length;
    const apiCount = this.totalQuestionCount - generalCount; // 10 - 3 = 7
    
    console.log(`📊 Question Distribution: ${this.totalQuestionCount} total = ${generalCount} general + ${apiCount} API`);
    
    // Determine subject from exam type
    let subject = 'technical';
    if (this.examType && (this.examType.includes('UPSC') || this.examType.includes('IBPS') || this.examType.includes('SBI'))) {
        subject = 'aptitude';
    } else if (this.examType && (this.examType.includes('Google') || this.examType.includes('Microsoft') || 
        this.examType.includes('Amazon') || this.examType.includes('TCS') || this.examType.includes('Infosys'))) {
        subject = 'technical';
    } else {
        subject = 'general';
    }
    
    // Get API generated questions
    let apiQuestions = [];
    
    if (apiCount > 0) {
        try {
            const response = await fetch('http://localhost:5000/api/ai/generate-questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject: subject,
                    difficulty: this.difficulty.toLowerCase(),
                    count: apiCount,
                    examType: this.examType
                })
            });
            
            const data = await response.json();
            console.log('API Response:', data);
            
            if (data.success && data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
                apiQuestions = data.questions;
                console.log(`✅ API returned ${apiQuestions.length} questions`);
            } else {
                console.log('⚠️ API returned no questions, using fallback');
                apiQuestions = this.getFallbackQuestions(subject, apiCount);
            }
            
        } catch (error) {
            console.error('❌ API Error:', error);
            apiQuestions = this.getFallbackQuestions(subject, apiCount);
        }
    }
    
    // Ensure we have exactly 7 API questions
    if (apiQuestions.length < apiCount) {
        console.log(`⚠️ Need ${apiCount} API questions, have ${apiQuestions.length}. Adding more...`);
        const extra = this.getFallbackQuestions(subject, apiCount - apiQuestions.length);
        apiQuestions = [...apiQuestions, ...extra];
    }
    
    if (apiQuestions.length > apiCount) {
        apiQuestions = apiQuestions.slice(0, apiCount);
    }
    
    // Combine: 3 general + 7 API = 10 total
    this.questions = [...generalQuestions, ...apiQuestions];
    
    if (this.totalQuestionsEl) this.totalQuestionsEl.textContent = this.questions.length;
    this.updateProgress();
    
    console.log(`✅ FINAL: ${this.questions.length} questions loaded`);
    console.log(`   General: ${generalCount}, API: ${apiQuestions.length}`);
    console.log('Questions:', this.questions.map((q, i) => `${i+1}. ${q.substring(0, 50)}...`));
    this.showToast(`10 questions ready!`, 'success');
}

    // ========== GET FALLBACK QUESTIONS WITH COUNT ==========
    getFallbackQuestions(subject, count) {
        console.log(`📚 Generating ${count} fallback questions for ${subject}`);
        
        const questionBank = {
            technical: [
                "What is the difference between let, const, and var in JavaScript?",
                "Explain closures in JavaScript.",
                "What is the event loop?",
                "Explain promises in JavaScript.",
                "What is the difference between == and ===?",
                "What is hoisting?",
                "Explain the concept of this in JavaScript.",
                "What is the difference between map and forEach?",
                "Explain async/await in JavaScript.",
                "What is the difference between localStorage and sessionStorage?",
                "What is the difference between null and undefined?",
                "Explain the concept of prototypal inheritance.",
                "What is the difference between call, apply, and bind?",
                "Explain the concept of debouncing and throttling.",
                "What is the difference between REST and GraphQL?",
                "What is the difference between SQL and NoSQL?",
                "Explain the concept of indexing in databases.",
                "What is the difference between authentication and authorization?",
                "Explain the concept of JWT.",
                "What is the difference between HTTP and HTTPS?"
            ],
            aptitude: [
                "If a train travels at 60 km/h, how long to cover 180 km?",
                "What is the next number: 2, 4, 8, 16, ?",
                "A man buys a watch for Rs. 500, sells for Rs. 600. Profit percentage?",
                "What is the square root of 144?",
                "If 5 workers complete a task in 10 days, how many for 2 days?",
                "What is 15% of 200?",
                "What is the average of 10, 20, 30, 40, 50?",
                "A car travels 240 km in 4 hours. Speed?",
                "What is the area of a circle with radius 7 cm?",
                "What is the compound interest on ₹1000 at 10% for 2 years?",
                "What is the probability of getting a head when tossing a coin?",
                "What is 20% of 250?",
                "Find the median of 2, 4, 6, 8, 10.",
                "What is the volume of a cube with side 5 cm?",
                "If x + y = 10 and x - y = 4, find x and y.",
                "What is the value of 5! (5 factorial)?",
                "What is the sum of angles in a triangle?",
                "What is the perimeter of a rectangle with length 10 and width 5?",
                "What is 25% of 400?",
                "What is the next prime number after 7?"
            ],
            general: [
                "Tell me about a time you faced a challenge at work.",
                "How do you prioritize your tasks?",
                "Describe a situation where you had to work under pressure.",
                "What motivates you to perform well?",
                "How do you handle feedback and criticism?",
                "Tell me about a time you worked in a team.",
                "How do you handle conflicts with colleagues?",
                "Describe your leadership style.",
                "What is your biggest professional achievement?",
                "How do you stay updated with industry trends?",
                "Tell me about a time you failed and what you learned.",
                "How do you handle tight deadlines?",
                "Describe a time you went above and beyond.",
                "Why should we hire you?",
                "What are your career goals?",
                "Tell me about a time you demonstrated initiative.",
                "How do you adapt to change?",
                "Describe a time you had to learn something new quickly.",
                "What does success mean to you?",
                "How do you handle ambiguity?"
            ]
        };
        
        // Company-specific questions
        const companyQuestions = {
            'Google': [
                "Design an algorithm to find the shortest path in a graph.",
                "How would you design a URL shortening service?",
                "Explain load balancing and its types.",
                "What is the difference between process and thread?",
                "How would you handle a million requests per second?",
                "Design a web crawler.",
                "Explain the CAP theorem.",
                "What is consistent hashing?",
                "Explain distributed systems concepts.",
                "What is the difference between SQL and NoSQL?",
                "Design a distributed key-value store.",
                "Explain the concept of MapReduce.",
                "What is the difference between horizontal and vertical scaling?",
                "Explain the concept of eventual consistency.",
                "What is a message queue and how is it used?",
                "Design a rate limiter.",
                "Explain the concept of sharding.",
                "What is the difference between batch and stream processing?",
                "Design a notification system.",
                "Explain the concept of leader election."
            ],
            'Microsoft': [
                "Design a parking lot system using OOPs.",
                "Explain virtual memory.",
                "What is the difference between mutex and semaphore?",
                "How would you implement an LRU cache?",
                "Design a file system.",
                "What is the difference between HTTP and HTTPS?",
                "Explain garbage collection.",
                "What is deadlock and how to prevent it?",
                "Explain the concept of dependency injection.",
                "What is the difference between REST and SOAP?",
                "Design a URL shortener.",
                "Explain the concept of ACID properties.",
                "What is the difference between stack and heap memory?",
                "Explain the concept of threading.",
                "What is the difference between concurrency and parallelism?",
                "Design a thread pool.",
                "Explain the concept of virtual memory.",
                "What is the difference between paging and segmentation?",
                "Design a memory allocator.",
                "Explain the concept of interrupt handling."
            ],
            'Amazon': [
                "Design a recommendation system.",
                "Explain the CAP theorem in detail.",
                "How would you design a scalable e-commerce platform?",
                "What is the difference between SQL and NoSQL?",
                "Design a distributed key-value store.",
                "Explain eventual consistency.",
                "What is a message queue?",
                "How would you handle data consistency?",
                "Explain the concept of leader election.",
                "What is the difference between horizontal and vertical scaling?",
                "Design a URL shortener.",
                "Explain the concept of load balancing.",
                "What is the difference between stateful and stateless applications?",
                "Explain the concept of circuit breaker pattern.",
                "What is the difference between caching and database?",
                "Design a rate limiter for API.",
                "Explain the concept of idempotency.",
                "What is the difference between optimistic and pessimistic locking?",
                "Design a payment processing system.",
                "Explain the concept of eventual consistency vs strong consistency."
            ]
        };
        
        // Use company-specific questions if available
        let bank = companyQuestions[this.examType];
        if (!bank) {
            bank = questionBank[subject] || questionBank.general;
        }
        
        const result = [];
        for (let i = 0; i < count; i++) {
            result.push(bank[i % bank.length]);
        }
        return result;
    }

    startInterview() {
        console.log('🎤 Starting interview...');
        this.askQuestion();
    }

    askQuestion() {
        if (this.interviewCompleted) return;
        if (this.currentIndex >= this.questions.length) {
            this.completeInterview();
            return;
        }
        
        const question = this.questions[this.currentIndex];
        if (this.questionText) this.questionText.textContent = question;
        
        this.answerTimeLeft = 120;
        this.updateTimerDisplay();
        
        if (this.textToSpeech) {
            this.textToSpeech.speak(question);
        } else {
            this.onAIFinished();
        }
    }

    onAISpeaking() {
        if (this.aiStatusText) this.aiStatusText.textContent = 'AI is asking question...';
        if (this.statusIndicator) this.statusIndicator.className = 'status-indicator speaking';
        if (this.speakingAnimation) {
            this.speakingAnimation.style.display = 'block';
            this.speakingAnimation.classList.add('active', 'speaking');
        }
        if (this.speechRecognition) this.speechRecognition.stopListening();
        if (this.micStatus) {
            this.micStatus.innerHTML = '<i class="fas fa-microphone-slash"></i> Microphone off';
            this.micStatus.classList.remove('listening');
        }
        this.isAnswering = false;
    }

    onAIFinished() {
        if (this.interviewCompleted) return;
        
        if (this.aiStatusText) this.aiStatusText.textContent = 'Your turn - 2 minutes';
        if (this.statusIndicator) this.statusIndicator.className = 'status-indicator listening';
        if (this.speakingAnimation) {
            this.speakingAnimation.style.display = 'none';
            this.speakingAnimation.classList.remove('active', 'speaking');
        }
        if (this.speechRecognition) {
            this.speechRecognition.reset();
            this.speechRecognition.startListening();
        }
        if (this.micStatus) {
            this.micStatus.innerHTML = '<i class="fas fa-microphone"></i> Speak now...';
            this.micStatus.classList.add('listening');
        }
        this.isAnswering = true;
        this.startAnswerTimer();
    }

    startAnswerTimer() {
        if (this.answerTimer) clearInterval(this.answerTimer);
        this.answerTimer = setInterval(() => {
            if (this.answerTimeLeft > 0 && this.isAnswering && !this.interviewCompleted) {
                this.answerTimeLeft--;
                this.updateTimerDisplay();
                if (this.answerTimeLeft === 30) this.showToast('30 seconds remaining!', 'warning');
                if (this.answerTimeLeft === 0) {
                    clearInterval(this.answerTimer);
                    this.showToast('Time\'s up! Moving to next question.', 'warning');
                    this.saveAnswer('');
                    setTimeout(() => this.nextQuestion(), 2000);
                }
            }
        }, 1000);
    }

    updateTimerDisplay() {
        if (!this.timerValue) return;
        const minutes = Math.floor(this.answerTimeLeft / 60);
        const seconds = this.answerTimeLeft % 60;
        this.timerValue.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        this.timerValue.className = 'timer-value';
        if (this.answerTimeLeft <= 30) this.timerValue.classList.add('red');
        else if (this.answerTimeLeft <= 60) this.timerValue.classList.add('orange');
        else this.timerValue.classList.add('green');
    }

    updateOverallTimer() {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        const timerEl = document.getElementById('interview-timer');
        if (timerEl) timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    saveAnswer(transcript) {
        let confidence = this.confidenceAnalyzer.getCurrentConfidence();
        this.answers.push({
            question: this.questions[this.currentIndex],
            answer: transcript || 'No answer recorded',
            confidence: confidence,
            timestamp: new Date()
        });
        console.log(`✅ Answer saved for Q${this.currentIndex + 1} (Confidence: ${confidence}%)`);
        if (this.speechTranscript && transcript) this.speechTranscript.textContent = transcript;
    }

    nextQuestion() {
        if (this.interviewCompleted) return;
        if (this.answerTimer) clearInterval(this.answerTimer);
        
        if (this.currentIndex < this.questions.length - 1) {
            this.textToSpeech.stop();
            this.speechRecognition.stopListening();
            this.currentIndex++;
            this.updateProgress();
            setTimeout(() => this.askQuestion(), 1000);
        } else {
            this.completeInterview();
        }
    }

    updateProgress() {
        if (this.currentNum) this.currentNum.textContent = this.currentIndex + 1;
        const progress = ((this.currentIndex + 1) / this.questions.length) * 100;
        if (this.questionProgress) this.questionProgress.style.width = `${progress}%`;
    }

    async completeInterview() {
        this.interviewCompleted = true;
        this.speechRecognition.stopListening();
        if (this.answerTimer) clearInterval(this.answerTimer);
        
        const thankYouMessage = "Thank you for completing the interview! Your responses have been recorded. Generating your performance report now.";
        
        if (this.questionText) this.questionText.textContent = "🎉 Interview Completed! 🎉";
        if (this.aiStatusText) this.aiStatusText.textContent = "Interview Completed - Thank You!";
        if (this.statusIndicator) this.statusIndicator.className = 'status-indicator';
        if (this.speakingAnimation) {
            this.speakingAnimation.style.display = 'none';
            this.speakingAnimation.classList.remove('active', 'speaking');
        }
        if (this.micStatus) {
            this.micStatus.innerHTML = '<i class="fas fa-check-circle"></i> Interview Completed';
            this.micStatus.classList.remove('listening', 'off');
        }
        
        this.showToast(thankYouMessage, 'success');
        
        if (this.textToSpeech) {
            this.textToSpeech.speak(thankYouMessage);
            setTimeout(() => this.endInterview(), 3500);
        } else {
            setTimeout(() => this.endInterview(), 2000);
        }
    }

    showModal() {
        if (this.endModal) this.endModal.classList.add('active');
    }

    hideModal() {
        if (this.endModal) this.endModal.classList.remove('active');
    }

    async endInterview() {
        try {
            this.showToast('Generating report...', 'info');
            this.textToSpeech.stop();
            this.speechRecognition.stopListening();
            if (this.answerTimer) clearInterval(this.answerTimer);
            this.confidenceAnalyzer.stopAnalysis();
            if (this.webcamVideo && this.webcamVideo.srcObject) {
                this.webcamVideo.srcObject.getTracks().forEach(track => track.stop());
            }
            
            const report = this.generateReport();
            localStorage.setItem('lastReport', JSON.stringify(report));
            
            const user = JSON.parse(localStorage.getItem('currentUser'));
            if (user && user.email) {
                const allInterviews = JSON.parse(localStorage.getItem('allUserInterviews') || '{}');
                if (!allInterviews[user.email]) allInterviews[user.email] = [];
                allInterviews[user.email].push({
                    id: report.id,
                    exam: this.examType,
                    difficulty: this.difficulty,
                    score: report.overallScore,
                    confidence: report.confidenceScore,
                    status: 'completed',
                    date: new Date().toISOString()
                });
                localStorage.setItem('allUserInterviews', JSON.stringify(allInterviews));
            }
            
            this.showToast('Report ready! Redirecting...', 'success');
            setTimeout(() => window.location.href = `report.html?id=${report.id}`, 1500);
        } catch(e) {
            console.error('End interview error:', e);
            this.showToast('Error ending interview', 'error');
        }
        // Interview complete hone par
async function saveCompletedInterview(interviewData) {
    const token = localStorage.getItem('token');
    
    const interviewToSave = {
        id: Date.now(),
        exam: interviewData.exam || 'General',
        subject: interviewData.subject || 'Technical',
        difficulty: interviewData.difficulty || 'Intermediate',
        score: interviewData.score || 0,
        confidence: interviewData.confidence || 0,
        status: 'completed',
        date: new Date().toISOString(),
        questions: interviewData.questions || []
    };
    
    // Save to localStorage first (always)
    const saved = localStorage.getItem('userInterviews');
    let interviews = saved ? JSON.parse(saved) : [];
    interviews.unshift(interviewToSave);
    localStorage.setItem('userInterviews', JSON.stringify(interviews));
    console.log('✅ Interview saved to localStorage');
    
    // Try backend if token exists
    if (token) {
        try {
            const response = await fetch('https://intervai-backend.onrender.com/api/interviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(interviewToSave)
            });
            
            if (response.ok) {
                console.log('✅ Interview also saved to backend');
            }
        } catch (error) {
            console.log('⚠️ Backend save failed, but saved locally');
        }
    }
    // Jab interview complete ho jaye
saveCompletedInterview({
    exam: 'TCS NQT',
    subject: 'Technical',
    difficulty: 'Intermediate',
    score: 85,
    confidence: 82,
    questions: questionList
});
}
    }

    generateReport() {
        const questionAnalysis = this.answers.map((ans, idx) => {
            let score = 60;
            const len = (ans.answer || '').length;
            if (len > 200) score = 88;
            else if (len > 100) score = 78;
            else if (len > 50) score = 68;
            else if (len > 20) score = 58;
            const confidenceBonus = Math.floor((ans.confidence - 50) / 5);
            score = Math.min(98, score + confidenceBonus);
            return {
                question: this.questions[idx],
                answer: ans.answer || 'No answer recorded',
                score: score,
                feedback: score >= 75 ? "Good answer!" : score >= 60 ? "Decent answer." : "Too brief.",
                suggestions: "Add more details and examples."
            };
        });
        
        const overall = Math.round(questionAnalysis.reduce((s, q) => s + q.score, 0) / questionAnalysis.length);
        const avgConfidence = Math.round(this.answers.reduce((s, a) => s + (a.confidence || 70), 0) / this.answers.length);
        
        return {
            id: Date.now(),
            exam: this.examType,
            date: new Date().toISOString(),
            overallScore: overall,
            confidenceScore: avgConfidence,
            communicationScore: Math.round(overall * 0.95),
            technicalScore: Math.round(overall * 1.05),
            strengths: ["Completed the interview", `Answered ${this.answers.length} questions`],
            weaknesses: ["Need more detailed answers"],
            improvements: ["Practice with more questions", "Review core concepts"],
            summary: `You scored ${overall}% in this interview. ${overall >= 70 ? 'Good job!' : 'Keep practicing!'}`,
            recommendations: ["Take another mock interview", "Review weak topics"],
            questionAnalysis: questionAnalysis
        };
    }

    showToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            position: fixed; top: 20px; right: 20px; padding: 1rem 1.5rem;
            background: white; border-radius: 12px; box-shadow: 0 10px 15px rgba(0,0,0,0.1);
            z-index: 9999; border-left: 4px solid ${type === 'success' ? '#10b981' : '#3b82f6'};
            font-family: 'Inter', sans-serif;
        `;
        toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i> ${message}`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 Interview Room Initialized');
    window.interviewRoom = new InterviewRoom();
});