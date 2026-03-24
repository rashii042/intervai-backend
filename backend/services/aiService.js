const axios = require('axios');

class AIService {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY;
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
    }

    // ==================== QUESTION GENERATION ====================
    async generateQuestions(subject, difficulty, count = 5) {
        try {
            // 🔥 PEHLA QUESTION FIXED
            const firstQuestion = "Tell me about yourself.";
            
            // Baaki general questions count: 3 (kyunki 1 already fix hai)
            const remainingGeneralCount = Math.min(3, count - 1);
            const technicalCount = count - 1 - remainingGeneralCount;
            
            console.log(`📋 1 fixed + ${remainingGeneralCount} general + ${technicalCount} technical questions`);
            
            // ========== GENERAL QUESTIONS (HR) ==========
            const generalQuestions = [
                "What are your greatest strengths?",
                "What are your weaknesses?",
                "Why do you want to work here?",
                "Where do you see yourself in 5 years?",
                "Tell me about a challenge you faced.",
                "How do you handle pressure?",
                "Why should we hire you?",
                "Tell me about a time you led a team.",
                "What is your greatest achievement?",
                "How do you handle criticism?",
                "What motivates you?",
                "Tell me about a time you failed.",
                "How do you stay updated with industry trends?"
            ];
            
            const shuffledGeneral = [...generalQuestions].sort(() => 0.5 - Math.random());
            const selectedGeneral = shuffledGeneral.slice(0, remainingGeneralCount);
            
            // ========== TECHNICAL QUESTIONS ==========
            const prompt = this.buildQuestionPrompt(subject, difficulty, technicalCount);
            
            console.log(`📡 Calling Gemini API for ${technicalCount} technical questions`);
            
            const response = await axios.post(
                `${this.apiUrl}/gemini-2.5-flash-lite:generateContent?key=${this.apiKey}`,
                {
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }]
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            let technicalQuestions = this.parseQuestions(response.data);
            
            const finalQuestions = [
                firstQuestion,
                ...selectedGeneral,
                ...technicalQuestions.slice(0, technicalCount)
            ];
            
            console.log(`✅ Generated ${finalQuestions.length} questions`);
            return finalQuestions;
            
        } catch (error) {
            console.error('❌ Gemini API Error:', error.response?.data || error.message);
            return this.getFallbackQuestions(subject, difficulty, count);
        }
    }

    buildQuestionPrompt(subject, difficulty, count) {
        return `Generate ${count} unique and different ${difficulty} level technical interview questions for ${subject}. 
                The questions should be technical, relevant, and suitable for a job interview.
                Do NOT include any HR or personal questions.
                Return only the questions, each on a new line starting with "Q:".`;
    }

    parseQuestions(response) {
        try {
            const text = response.candidates[0].content.parts[0].text;
            const questions = text
                .split('\n')
                .filter(line => line.trim().startsWith('Q:') || line.match(/^\d+\./))
                .map(line => line.replace(/^Q:\s*/, '').replace(/^\d+\.\s*/, '').trim())
                .filter(q => q.length > 10);
            return questions;
        } catch (error) {
            console.error('Error parsing questions:', error);
            return [];
        }
    }

    // ==================== FALLBACK QUESTIONS (All 17+ Exams) ====================
    getFallbackQuestions(exam, difficulty, count) {
        console.log(`📚 Using fallback questions for exam: ${exam}, count: ${count}`);
        
        const firstQuestion = "Tell me about yourself.";
        
        const generalQuestions = [
            "What are your greatest strengths?",
            "What are your weaknesses?",
            "Why do you want to work here?",
            "Where do you see yourself in 5 years?",
            "Tell me about a challenge you faced.",
            "How do you handle pressure?",
            "Why should we hire you?",
            "Tell me about a time you led a team.",
            "What is your greatest achievement?",
            "How do you handle criticism?",
            "What motivates you?",
            "Tell me about a time you failed."
        ];
        
        // ==================== EXAM-WISE TECHNICAL QUESTIONS ====================
        const technicalBank = {
            // ----- GOVERNMENT EXAMS -----
            'UPSC-ESE': [
                "Explain the working principle of a synchronous motor.",
                "What is the difference between thermodynamics and heat transfer?",
                "Explain the concept of stress and strain in materials.",
                "What are the different types of beams and supports?",
                "Explain the working of a centrifugal pump.",
                "What is the difference between otto cycle and diesel cycle?",
                "Explain the concept of power factor improvement.",
                "What are the different types of turbines?",
                "Explain the working of a transformer.",
                "What is the difference between analog and digital communication?",
                "Explain the working of a 3-phase induction motor.",
                "What are the different types of power plants?",
                "Explain the concept of renewable energy sources."
            ],
            'UPSC-CSE': [
                "What is the significance of the Preamble to the Indian Constitution?",
                "Explain the difference between fundamental rights and directive principles.",
                "What are the causes of poverty in India?",
                "Explain the structure of Indian economy.",
                "What is the role of NITI Aayog in policy formulation?",
                "Explain the concept of federalism in India.",
                "What are the challenges of urbanization in India?",
                "Explain the role of RBI in Indian economy.",
                "What is the difference between Lok Sabha and Rajya Sabha?",
                "Explain the emergency provisions in the Indian Constitution.",
                "What are the different types of budgets in India?",
                "Explain the concept of inflation and its causes.",
                "What is the role of Election Commission of India?"
            ],
            'IBPS-SO-IT': [
                "What is the difference between HTTP and HTTPS?",
                "Explain the concept of normalization in databases.",
                "What are the different types of operating systems?",
                "Explain the OSI model layers.",
                "What is a firewall and how does it work?",
                "Explain the difference between TCP and UDP.",
                "What is cloud computing? Explain its service models.",
                "What is the difference between symmetric and asymmetric encryption?",
                "Explain the concept of data warehousing.",
                "What is the role of a system analyst?",
                "Explain the concept of blockchain technology.",
                "What are the different types of NoSQL databases?",
                "Explain the software development life cycle."
            ],
            'SBI-SO-IT': [
                "What is the difference between authentication and authorization?",
                "Explain the concept of VPN.",
                "What are the different types of cyber attacks?",
                "Explain the software development life cycle.",
                "What is the difference between verification and validation?",
                "Explain the concept of blockchain technology.",
                "What is the difference between machine learning and deep learning?",
                "Explain the concept of big data.",
                "What are the different types of NoSQL databases?",
                "Explain the concept of DevOps.",
                "What is the difference between agile and waterfall model?",
                "Explain the concept of containerization using Docker.",
                "What are the different types of cloud deployment models?"
            ],
            
            // ----- PSU EXAMS -----
            'GATE-PSU': [
                "What is the difference between a microprocessor and a microcontroller?",
                "Explain the working of a DC motor.",
                "What are the different types of control systems?",
                "Explain the concept of feedback in control systems.",
                "What is the difference between time domain and frequency domain analysis?",
                "Explain the working of a 3-phase induction motor.",
                "What are the different types of power electronic converters?",
                "Explain the concept of power factor correction.",
                "What is the difference between a generator and a motor?",
                "Explain the working of a synchronous generator.",
                "What are the different types of circuit breakers?",
                "Explain the concept of earthing in electrical systems.",
                "What is the difference between star and delta connection?"
            ],
            
            // ----- DEFENCE EXAMS -----
            'AFCAT': [
                "What are the qualities of a good leader?",
                "Explain the role of Indian Air Force in national security.",
                "What is situational awareness?",
                "Explain the importance of teamwork in defence.",
                "How do you handle stress in high-pressure situations?",
                "What is the difference between strategy and tactics?",
                "Explain the importance of discipline in armed forces.",
                "What are the principles of war?",
                "Explain the role of intelligence in military operations.",
                "What is the chain of command in the Indian Air Force?",
                "Explain the concept of air power.",
                "What are the different types of aircraft?",
                "Explain the role of radar in air defence."
            ],
            'CDS': [
                "What is the difference between strategy and tactics?",
                "Explain the importance of discipline in armed forces.",
                "What are the principles of war?",
                "Explain the role of intelligence in military operations.",
                "What is the chain of command in the Indian Army?",
                "Explain the concept of leadership in military context.",
                "What are the different types of military operations?",
                "Explain the importance of logistics in defence.",
                "What is the role of technology in modern warfare?",
                "Explain the concept of national security.",
                "What are the different types of terrain and their impact on operations?",
                "Explain the concept of counter-insurgency operations.",
                "What is the role of artillery in modern warfare?"
            ],
            
            // ----- RESEARCH EXAMS -----
            'DRDO': [
                "Explain the working of radar systems.",
                "What is the difference between missile and rocket?",
                "Explain the concept of stealth technology.",
                "What are composite materials and their applications in defence?",
                "Explain the working of sonar systems.",
                "What is the difference between active and passive homing?",
                "Explain the concept of electronic warfare.",
                "What are the different types of guidance systems?",
                "Explain the working of a jet engine.",
                "What is the difference between ballistic missile and cruise missile?",
                "Explain the concept of hypersonic technology.",
                "What are the different types of materials used in aerospace?",
                "Explain the working of an inertial navigation system."
            ],
            'ISRO': [
                "What is the difference between geostationary and polar orbits?",
                "Explain the working of a rocket engine.",
                "What are the different types of satellite launch vehicles?",
                "Explain the concept of remote sensing.",
                "What is the role of ISRO in space exploration?",
                "Explain the difference between PSLV and GSLV.",
                "What are the applications of satellites?",
                "Explain the concept of orbital mechanics.",
                "What is the difference between geosynchronous and geostationary orbit?",
                "Explain the working of a communication satellite.",
                "What are the different types of Earth observation satellites?",
                "Explain the concept of space debris and its management.",
                "What is the difference between LEO, MEO, and GEO orbits?"
            ],
            
            // ----- HIGHER STUDIES -----
            'GATE-MTECH': [
                "What is the difference between computer science and computer engineering?",
                "Explain the concept of machine learning.",
                "What are the different types of sorting algorithms?",
                "Explain the concept of database indexing.",
                "What is the difference between TCP and UDP?",
                "Explain the concept of time complexity.",
                "What are the different types of data structures?",
                "Explain the concept of operating system scheduling.",
                "What is the difference between process and thread?",
                "Explain the concept of virtual memory.",
                "What are the different types of artificial intelligence?",
                "Explain the concept of neural networks.",
                "What is the difference between supervised and unsupervised learning?"
            ],
            'BITS-HD': [
                "What are your research interests?",
                "Explain your undergraduate project work.",
                "What are your career goals?",
                "Why do you want to pursue higher studies?",
                "Explain any technical challenge you faced and how you solved it.",
                "What are your strengths and weaknesses?",
                "Why do you want to join BITS for higher studies?",
                "Explain your understanding of your chosen field.",
                "What are the current trends in your field of interest?",
                "How do you plan to contribute to research?",
                "What is your experience with teamwork and collaboration?",
                "Explain a time when you showed leadership skills.",
                "What are your long-term career aspirations?"
            ],
            
            // ----- PRIVATE IT COMPANIES -----
            'TCS-NQT': [
                "What is the difference between C and Java?",
                "Explain the concept of OOPs.",
                "What are the different types of SQL joins?",
                "Explain the software development life cycle.",
                "What is the difference between verification and validation?",
                "Explain the concept of inheritance.",
                "What is polymorphism? Give example.",
                "What is the difference between array and linked list?",
                "Explain the concept of exception handling.",
                "What is the difference between abstract class and interface?",
                "Explain the concept of multithreading.",
                "What is the difference between stack and queue?",
                "Explain the concept of garbage collection."
            ],
            'Infosys': [
                "What is the difference between abstract class and interface?",
                "Explain the concept of inheritance.",
                "What are the different types of polymorphism?",
                "Explain the concept of exception handling.",
                "What is the difference between array and linked list?",
                "Explain the concept of method overloading and overriding.",
                "What is the difference between stack and queue?",
                "Explain the concept of garbage collection in Java.",
                "What is the difference between String and StringBuilder?",
                "Explain the concept of multithreading.",
                "What is the difference between process and thread?",
                "Explain the concept of synchronization.",
                "What is the difference between HashMap and HashTable?"
            ],
            'Wipro': [
                "What is the difference between procedural and object-oriented programming?",
                "Explain the concept of encapsulation.",
                "What are the different types of constructors?",
                "Explain the concept of method overloading and overriding.",
                "What is the difference between stack and queue?",
                "Explain the concept of inheritance in Java.",
                "What is the difference between abstract class and interface?",
                "Explain the concept of exception hierarchy.",
                "What is the difference between final, finally, and finalize?",
                "Explain the concept of garbage collection.",
                "What is the difference between checked and unchecked exceptions?",
                "Explain the concept of multithreading in Java.",
                "What is the difference between ArrayList and LinkedList?"
            ],
            'Google': [
                "Design an algorithm to find the shortest path in a graph.",
                "How would you design a URL shortening service?",
                "Explain the concept of load balancing.",
                "What is the difference between process and thread?",
                "How would you handle a million requests per second?",
                "Design a distributed key-value store.",
                "Explain the concept of consistent hashing.",
                "How would you implement an LRU cache?",
                "Design a web crawler.",
                "Explain the concept of CAP theorem.",
                "How would you design a recommendation system?",
                "Design a parking lot system using OOPs.",
                "Explain the concept of MapReduce."
            ],
            'Microsoft': [
                "Design a parking lot system using OOPs.",
                "Explain the concept of virtual memory.",
                "What is the difference between mutex and semaphore?",
                "How would you implement an LRU cache?",
                "Design a file system.",
                "Explain the concept of deadlock and its prevention.",
                "How would you design a thread pool?",
                "Design a garbage collection system.",
                "Explain the concept of memory management in OS.",
                "Design a chat application.",
                "Explain the concept of asynchronous programming.",
                "How would you design a task scheduler?",
                "Design a distributed locking system."
            ],
            'Amazon': [
                "Design a recommendation system.",
                "Explain the concept of CAP theorem.",
                "How would you design a scalable e-commerce platform?",
                "What is the difference between SQL and NoSQL?",
                "Design a distributed key-value store.",
                "Explain the concept of eventual consistency.",
                "How would you design a rate limiter?",
                "Design a logging system.",
                "Explain the concept of load balancing algorithms.",
                "Design a distributed cache.",
                "How would you design a payment system?",
                "Design an inventory management system.",
                "Explain the concept of microservices architecture."
            ]
        };

        let technicalQuestions = technicalBank[exam] || technicalBank['TCS-NQT'] || [
            "What is your technical background?",
            "Explain your favorite programming language.",
            "What projects have you worked on?",
            "How do you approach problem-solving?",
            "What technologies are you familiar with?"
        ];
        
        const remainingGeneralCount = Math.min(3, count - 1);
        const technicalCount = count - 1 - remainingGeneralCount;
        
        const shuffledGeneral = [...generalQuestions].sort(() => 0.5 - Math.random());
        const selectedGeneral = shuffledGeneral.slice(0, remainingGeneralCount);
        const shuffledTechnical = [...technicalQuestions].sort(() => 0.5 - Math.random());
        
        const finalQuestions = [
            firstQuestion,
            ...selectedGeneral,
            ...shuffledTechnical.slice(0, technicalCount)
        ];
        
        console.log(`📊 Generated ${finalQuestions.length} fallback questions (1 fixed + ${remainingGeneralCount} general + ${finalQuestions.length - 1 - remainingGeneralCount} technical)`);
        return finalQuestions;
    }

    // ==================== REPORT GENERATION ====================
    async generateReport(interview, answers, confidenceScores) {
        try {
            // Calculate question-wise analysis
            const questionAnalysis = answers.map((answer, index) => ({
                question: interview.questions[index],
                answer: answer.answer,
                score: this.calculateAnswerScore(answer, confidenceScores[index]),
                feedback: this.generateFeedback(answer.answer),
                suggestions: this.generateSuggestions(answer.answer)
            }));
            
            // Calculate overall scores
            const overallScore = questionAnalysis.reduce((sum, q) => sum + q.score, 0) / questionAnalysis.length;
            const avgConfidence = confidenceScores.reduce((sum, c) => sum + c, 0) / confidenceScores.length;
            const communicationScore = this.calculateCommunicationScore(answers);
            const technicalScore = this.calculateTechnicalScore(answers);
            
            // Identify strengths and weaknesses
            const strengths = this.identifyStrengths(questionAnalysis);
            const weaknesses = this.identifyWeaknesses(questionAnalysis);
            const improvements = this.generateImprovements(weaknesses);
            
            return {
                overallScore: Math.round(overallScore),
                confidenceScore: Math.round(avgConfidence),
                communicationScore: Math.round(communicationScore),
                technicalScore: Math.round(technicalScore),
                questionAnalysis: questionAnalysis,
                strengths: strengths.length ? strengths : ["Good attempt at answering all questions"],
                weaknesses: weaknesses.length ? weaknesses : ["Could provide more detailed answers"],
                improvements: improvements,
                summary: this.generateSummary(overallScore, avgConfidence, communicationScore),
                recommendations: this.generateRecommendations(questionAnalysis)
            };
            
        } catch (error) {
            console.error('Error generating report:', error);
            return this.getFallbackReport(interview, answers, confidenceScores);
        }
    }

    calculateAnswerScore(answer, confidence) {
        let score = 60;
        const length = answer.answer?.length || 0;
        
        if (length > 200) score += 20;
        else if (length > 100) score += 15;
        else if (length > 50) score += 10;
        else if (length > 20) score += 5;
        
        score += (confidence - 50) * 0.2;
        
        return Math.min(100, Math.max(0, score));
    }

    generateFeedback(answer) {
        const length = answer?.length || 0;
        if (length < 30) return "Answer too brief. Provide more details and examples.";
        if (length < 100) return "Good answer. Could include more specific examples.";
        if (length < 200) return "Well-structured answer with good details.";
        return "Excellent answer! Comprehensive and well-articulated.";
    }

    generateSuggestions(answer) {
        return "Consider adding real-world examples from your experience to strengthen your answers.";
    }

    calculateCommunicationScore(answers) {
        let totalScore = 0;
        answers.forEach(answer => {
            let score = 70;
            const length = answer.answer?.length || 0;
            if (length > 150) score += 15;
            else if (length > 50) score += 5;
            totalScore += score;
        });
        return totalScore / answers.length;
    }

    calculateTechnicalScore(answers) {
        const technicalKeywords = ['function', 'variable', 'class', 'algorithm', 'data', 'structure', 'code', 'programming', 'javascript', 'python', 'java', 'react', 'node', 'database', 'api', 'server', 'client', 'array', 'object', 'loop', 'async', 'promise', 'closure', 'hoisting', 'inheritance', 'polymorphism'];
        let totalScore = 0;
        
        answers.forEach(answer => {
            let score = 60;
            const text = (answer.answer?.toLowerCase() || '');
            let keywordCount = 0;
            
            technicalKeywords.forEach(keyword => {
                if (text.includes(keyword)) keywordCount++;
            });
            
            score += Math.min(30, keywordCount * 3);
            totalScore += Math.min(100, score);
        });
        
        return totalScore / answers.length;
    }

    identifyStrengths(questionAnalysis) {
        const strengths = [];
        const highScores = questionAnalysis.filter(q => q.score >= 80);
        
        if (highScores.length >= 3) {
            strengths.push(`Strong performance on ${highScores.length} questions`);
        }
        if (questionAnalysis.some(q => q.score >= 90)) {
            strengths.push("Excellent technical knowledge demonstrated");
        }
        const avgScore = questionAnalysis.reduce((sum, q) => sum + q.score, 0) / questionAnalysis.length;
        if (avgScore >= 75) {
            strengths.push("Consistent performance across all questions");
        }
        
        return strengths;
    }

    identifyWeaknesses(questionAnalysis) {
        const weaknesses = [];
        const lowScores = questionAnalysis.filter(q => q.score < 60);
        const mediumScores = questionAnalysis.filter(q => q.score >= 60 && q.score < 75);
        
        if (lowScores.length > 0) {
            weaknesses.push(`${lowScores.length} answers lacked depth and detail`);
        }
        if (mediumScores.length > 3) {
            weaknesses.push(`${mediumScores.length} answers could be improved with more examples`);
        }
        
        return weaknesses;
    }

    generateImprovements(weaknesses) {
        return [
            "Practice answering questions with more specific examples",
            "Structure your answers using the STAR method (Situation, Task, Action, Result)",
            "Review fundamental concepts in your domain",
            "Record yourself and listen to identify areas for improvement",
            "Take another mock interview to track progress"
        ];
    }

    generateSummary(overall, confidence, communication) {
        if (overall >= 85) {
            return `Excellent performance! You scored ${Math.round(overall)}% with ${Math.round(confidence)}% confidence. You're well prepared for real interviews! Keep up the great work.`;
        } else if (overall >= 70) {
            return `Good performance (${Math.round(overall)}%). Your confidence level was ${Math.round(confidence)}% and communication score ${Math.round(communication)}%. With a bit more practice, you'll be ready for interviews.`;
        } else if (overall >= 55) {
            return `Fair performance (${Math.round(overall)}%). Focus on improving your technical answers and confidence. Review the feedback section for specific areas to work on.`;
        } else {
            return `You scored ${Math.round(overall)}%. Don't worry - every interview is a learning opportunity! Focus on the suggested areas and try again. Practice makes perfect!`;
        }
    }

    generateRecommendations(questionAnalysis) {
        const recommendations = [];
        const weakQuestions = questionAnalysis.filter(q => q.score < 60);
        
        if (weakQuestions.length > 0) {
            const topics = weakQuestions.slice(0, 2).map(q => q.question.substring(0, 50));
            recommendations.push(`Review these topics: ${topics.join(', ')}...`);
        }
        recommendations.push("Practice mock interviews with friends or mentors");
        recommendations.push("Review common interview questions in your field");
        recommendations.push("Work on structuring answers using the STAR method");
        
        return recommendations;
    }

    getFallbackReport(interview, answers, confidenceScores) {
        const avgConfidence = confidenceScores.reduce((sum, c) => sum + c, 0) / confidenceScores.length;
        const questionAnalysis = answers.map((answer, i) => ({
            question: interview.questions[i],
            answer: answer.answer,
            score: 70,
            feedback: "Good attempt. Keep practicing to improve your answers.",
            suggestions: "Try to add more specific examples from your experience."
        }));
        
        const avgScore = 70;
        
        return {
            overallScore: avgScore,
            confidenceScore: Math.round(avgConfidence),
            communicationScore: 70,
            technicalScore: 68,
            questionAnalysis: questionAnalysis,
            strengths: ["Good effort in answering all questions", "Completed the interview"],
            weaknesses: ["Answers could be more detailed", "More specific examples needed"],
            improvements: ["Practice with more examples", "Work on structuring answers", "Take another mock interview"],
            summary: `You completed the interview with ${Math.round(avgConfidence)}% confidence. Keep practicing to improve your answers.`,
            recommendations: ["Take another mock interview", "Review technical concepts", "Practice answering with the STAR method"]
        };
    }
}

module.exports = new AIService();