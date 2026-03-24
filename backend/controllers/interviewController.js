const Interview = require('../models/Interview');
const Report = require('../models/Report');
const Resume = require('../models/Resume');
const aiService = require('../services/aiService');
const resumeParser = require('../services/resumeParser');
const fs = require('fs');

// ========== HELPER FUNCTIONS ==========
function getTechFallback(skills) {
    const fallback = [];
    const techMap = {
        'javascript': [
            "What is closure in JavaScript? Explain with example.",
            "What is event loop in JavaScript?",
            "Explain promises and async/await.",
            "What is the 'this' keyword?",
            "What is hoisting in JavaScript?",
            "Explain the difference between let, const, and var.",
            "What is prototypal inheritance?"
        ],
        'react': [
            "What is Virtual DOM and how does it work?",
            "Explain React lifecycle methods.",
            "What are React Hooks? Explain useState and useEffect.",
            "Difference between props and state.",
            "What is JSX?",
            "Explain the concept of lifting state up.",
            "What is Context API?"
        ],
        'python': [
            "What is list comprehension in Python?",
            "Explain decorators with example.",
            "Difference between list and tuple.",
            "What is GIL in Python?",
            "Explain generators and yield.",
            "What are lambda functions?",
            "Explain OOP concepts in Python."
        ],
        'node.js': [
            "What is Node.js and how does it work?",
            "Explain event-driven architecture in Node.js.",
            "What is the purpose of package.json?",
            "Explain middleware in Express.",
            "How does Node.js handle asynchronous operations?",
            "What is the event loop in Node.js?"
        ],
        'mongodb': [
            "What is MongoDB and how is it different from SQL?",
            "Explain indexing in MongoDB.",
            "What are aggregation pipelines?",
            "What is sharding in MongoDB?",
            "Explain MongoDB's document structure."
        ]
    };
    
    for (let skill of skills) {
        const key = skill.toLowerCase();
        if (techMap[key]) {
            fallback.push(...techMap[key]);
            break;
        }
    }
    
    if (fallback.length === 0) {
        fallback.push(...techMap['javascript']);
    }
    
    return fallback.slice(0, 5);
}

function getGeneralQuestion() {
    const questions = [
        "Tell me about a time you showed leadership.",
        "How do you handle constructive criticism?",
        "What motivates you to do your best work?",
        "Describe a situation where you had to learn something quickly.",
        "How do you prioritize tasks when working on multiple projects?",
        "Tell me about a time you had a conflict with a colleague and how you resolved it.",
        "What do you do when you don't know the answer to a problem?",
        "How do you measure success in your work?",
        "Describe your ideal work environment.",
        "What are your career aspirations?"
    ];
    return questions[Math.floor(Math.random() * questions.length)];
}

// ========== START INTERVIEW ==========
const startInterview = async (req, res) => {
    try {
        const { type, subject, difficulty, exam, questions, resumeId } = req.body;
        
        console.log('🎯 START INTERVIEW CALLED');
        console.log('Type:', type);
        console.log('Resume ID:', resumeId);
        console.log('Difficulty:', difficulty);
        
        let finalQuestions = [];
        
        // ========== RESUME-BASED INTERVIEW ==========
        if (type === 'resume' && resumeId) {
            console.log('📄 Fetching resume with ID:', resumeId);
            
            const resume = await Resume.findById(resumeId);
            if (!resume) {
                console.log('❌ Resume not found!');
                return res.status(404).json({ message: 'Resume not found' });
            }
            
            // Safe parsing with defaults
            const data = resume.parsedData || {};
            const skills = data.skills || [];
            const experience = data.experience || [];
            const projects = data.projects || [];
            const name = data.name || 'Candidate';
            
            console.log('✅ Resume found:', resume.originalName);
            console.log('📊 Resume Analysis:', {
                name,
                skills: skills.slice(0, 3),
                experience: experience.slice(0, 2),
                projects: projects.slice(0, 2)
            });
            
            // ========== PERSONALIZED QUESTIONS ==========
            
            // Question 1: Introduction with name
            finalQuestions.push(`Hello ${name}, could you please introduce yourself and tell me about your background?`);
            
            // Question 2: Based on top skill
            if (skills.length > 0) {
                finalQuestions.push(`I see you have experience with ${skills[0]}. Can you explain a complex problem you solved using ${skills[0]}?`);
            } else {
                finalQuestions.push(`What programming languages and technologies are you most comfortable with?`);
            }
            
            // Question 3: Based on second skill
            if (skills.length > 1) {
                finalQuestions.push(`How do you typically use ${skills[1]} in your projects? Can you give a specific example?`);
            }
            
            // Question 4: Based on experience
            if (experience.length > 0) {
                const expText = experience[0];
                finalQuestions.push(`Tell me about your role and responsibilities at ${expText.substring(0, 50)}. What was your biggest achievement there?`);
            } else {
                finalQuestions.push(`Describe your most significant professional achievement.`);
            }
            
            // Question 5: Based on projects
            if (projects.length > 0) {
                const projectText = projects[0];
                finalQuestions.push(`I'm interested in your project: "${projectText.substring(0, 60)}". Can you walk me through the architecture and your contributions?`);
            } else {
                finalQuestions.push(`Tell me about a project you're proud of. What was your role and what did you learn?`);
            }
            
            // Question 6: Teamwork
            finalQuestions.push(`Describe a time when you had to work in a team to solve a difficult problem. How did you handle it?`);
            
            // Question 7: Challenge
            finalQuestions.push(`What was the most challenging technical problem you've faced, and how did you solve it?`);
            
            // Question 8: Learning
            finalQuestions.push(`How do you stay updated with the latest technologies and industry trends?`);
            
            // Question 9: Weakness/Strength
            finalQuestions.push(`What would you say are your greatest strengths and areas for improvement?`);
            
            // Question 10: Future
            finalQuestions.push(`Where do you see yourself in the next 3-5 years?`);
            
            // ========== TECHNICAL QUESTIONS ==========
            if (skills.length > 0) {
                const topSkill = skills[0].toLowerCase();
                let technicalCount = Math.min(5, 15 - finalQuestions.length);
                
                try {
                    const technicalQuestions = await aiService.generateQuestions(topSkill, difficulty, technicalCount);
                    finalQuestions.push(...technicalQuestions);
                } catch (error) {
                    console.log('Technical questions failed, using fallback');
                    finalQuestions.push(...getTechFallback(skills));
                }
            }
            
            // Add more general questions if needed
            while (finalQuestions.length < 15) {
                finalQuestions.push(getGeneralQuestion());
            }
            
            console.log(`✅ Generated ${finalQuestions.length} resume-based questions`);
        }
        
        // ========== EXAM-BASED INTERVIEW ==========
        else if (type === 'direct') {
            finalQuestions = questions || [];
            console.log('📥 EXAM-BASED INTERVIEW');
            console.log('Questions received:', finalQuestions?.length);
        }
        
        // ========== CREATE INTERVIEW ==========
        const interview = await Interview.create({
            user: req.user.id,
            type,
            subject,
            difficulty,
            exam,
            questions: finalQuestions,
            status: 'in-progress',
            startedAt: new Date()
        });
        
        console.log('💾 DATABASE SAVED QUESTIONS COUNT:', interview.questions?.length);
        
        res.json({
            success: true,
            interview: {
                id: interview._id,
                questions: interview.questions
            }
        });
        
    } catch (error) {
        console.error('❌ Start interview error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ========== UPLOAD RESUME ==========
const uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a file' });
        }

        console.log('📄 Processing resume:', req.file.originalname);
        console.log('File size:', req.file.size);

        const fileBuffer = fs.readFileSync(req.file.path);
        const fileText = fileBuffer.toString();

        // Helper functions for parsing
        const extractName = (text) => {
            const lines = text.split('\n');
            for (let line of lines) {
                line = line.trim();
                if (line && line.length > 0 && line.length < 50 && !line.includes('@') && !line.includes('http')) {
                    return line;
                }
            }
            return 'Candidate';
        };

        const extractEmail = (text) => {
            const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
            return match ? match[0] : '';
        };

        const extractPhone = (text) => {
            const match = text.match(/\d{10}/);
            return match ? match[0] : '';
        };

        const extractSkills = (text) => {
            const skills = [];
            const commonSkills = ['JavaScript', 'React', 'Node.js', 'Python', 'Java', 'MongoDB', 'SQL', 'Git', 'Docker', 'AWS', 'HTML', 'CSS', 'Express', 'TypeScript', 'Angular', 'Vue.js', 'Django', 'Flask', 'PostgreSQL', 'Redis', 'Kubernetes'];
            const lowerText = text.toLowerCase();
            
            commonSkills.forEach(skill => {
                if (lowerText.includes(skill.toLowerCase())) {
                    skills.push(skill);
                }
            });
            return skills;
        };

        const extractExperience = (text) => {
            const exp = [];
            const lines = text.split('\n');
            
            for (let line of lines) {
                const lowerLine = line.toLowerCase();
                if (lowerLine.includes('experience') || lowerLine.includes('developer') || 
                    lowerLine.includes('engineer') || lowerLine.includes('worked at') ||
                    lowerLine.includes('senior') || lowerLine.includes('lead')) {
                    exp.push(line.trim());
                }
            }
            return exp.slice(0, 5);
        };

        const extractEducation = (text) => {
            const edu = [];
            const lines = text.split('\n');
            
            for (let line of lines) {
                const lowerLine = line.toLowerCase();
                if (lowerLine.includes('b.tech') || lowerLine.includes('bachelor') || 
                    lowerLine.includes('master') || lowerLine.includes('university') ||
                    lowerLine.includes('college') || lowerLine.includes('degree') ||
                    lowerLine.includes('m.tech') || lowerLine.includes('b.e')) {
                    edu.push(line.trim());
                }
            }
            return edu.slice(0, 3);
        };

        const extractProjects = (text) => {
            const projects = [];
            const lines = text.split('\n');
            
            for (let line of lines) {
                const lowerLine = line.toLowerCase();
                if (lowerLine.includes('project') || lowerLine.includes('built using') ||
                    lowerLine.includes('developed') || lowerLine.includes('created')) {
                    projects.push(line.trim());
                }
            }
            return projects.slice(0, 5);
        };

        const parsedData = {
            name: extractName(fileText),
            email: extractEmail(fileText),
            phone: extractPhone(fileText),
            skills: extractSkills(fileText),
            experience: extractExperience(fileText),
            education: extractEducation(fileText),
            projects: extractProjects(fileText),
            rawText: fileText.substring(0, 1000)
        };

        console.log('📊 Parsed data:', {
            name: parsedData.name,
            skills: parsedData.skills.length,
            experience: parsedData.experience.length,
            education: parsedData.education.length,
            projects: parsedData.projects.length
        });

        const resume = await Resume.create({
            user: req.user.id,
            filename: req.file.filename,
            originalName: req.file.originalname,
            filePath: req.file.path,
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
            parsedData: parsedData
        });

        console.log('✅ Resume saved with ID:', resume._id);

        res.json({
            success: true,
            resume: {
                id: resume._id,
                filename: resume.originalName,
                parsedData: resume.parsedData
            }
        });
    } catch (error) {
        console.error('❌ Upload resume error:', error);
        res.status(500).json({ 
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// ========== COMPLETE INTERVIEW ==========
const completeInterview = async (req, res) => {
    try {
        const { answers, duration, confidenceScores } = req.body;
        
        const interview = await Interview.findById(req.params.id);
        if (!interview) {
            return res.status(404).json({ message: 'Interview not found' });
        }

        interview.answers = answers;
        interview.completedAt = new Date();
        interview.duration = duration;
        interview.status = 'completed';
        await interview.save();

        const reportData = await aiService.generateReport(interview, answers, confidenceScores);

        const report = await Report.create({
            user: req.user.id,
            interview: interview._id,
            ...reportData
        });

        await updateUserStats(req.user.id, report);

        res.json({
            success: true,
            report: {
                id: report._id,
                ...reportData
            }
        });
    } catch (error) {
        console.error('❌ Complete interview error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ========== GET INTERVIEW BY ID ==========
const getInterview = async (req, res) => {
    try {
        const interview = await Interview.findById(req.params.id);
        
        if (!interview) {
            return res.status(404).json({ message: 'Interview not found' });
        }

        if (interview.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        console.log('📤 Sending interview with', interview.questions?.length, 'questions');

        res.json({
            success: true,
            interview: {
                id: interview._id,
                type: interview.type,
                subject: interview.subject,
                difficulty: interview.difficulty,
                questions: interview.questions,
                status: interview.status
            }
        });
    } catch (error) {
        console.error('❌ Get interview error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ========== GET USER INTERVIEWS ==========
const getUserInterviews = async (req, res) => {
    try {
        const interviews = await Interview.find({ user: req.user.id })
            .sort('-createdAt')
            .limit(10);

        res.json({
            success: true,
            interviews: interviews.map(interview => ({
                id: interview._id,
                subject: interview.subject,
                difficulty: interview.difficulty,
                status: interview.status,
                score: interview.score,
                date: interview.completedAt || interview.startedAt
            }))
        });
    } catch (error) {
        console.error('❌ Get user interviews error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ========== GENERATE QUESTIONS ==========
const generateQuestions = async (req, res) => {
    try {
        const { subject, difficulty, count = 5 } = req.body;
        
        console.log('🎯 Generating questions for:', subject, difficulty, 'count:', count);
        
        const questions = await aiService.generateQuestions(subject, difficulty, count);
        
        console.log(`✅ Generated ${questions.length} questions`);
        
        res.json({
            success: true,
            questions: questions
        });
        
    } catch (error) {
        console.error('❌ Generate questions error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to generate questions' 
        });
    }
};

// ========== GENERATE REPORT ==========
const generateReport = async (req, res) => {
    try {
        const { exam, questions, answers, confidenceScores } = req.body;
        
        console.log('📊 Generating report for:', exam);
        console.log(`   Questions: ${questions?.length}, Answers: ${answers?.length}`);
        
        if (!answers || answers.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No answers provided for report generation'
            });
        }
        
        const questionAnalysis = answers.map((answer, index) => {
            const userAnswer = answer.answer || '';
            const answerConfidence = answer.confidence || 70;
            const question = questions[index] || 'Question not available';
            
            let score = 60;
            const length = userAnswer.length;
            
            if (length > 200) score += 20;
            else if (length > 100) score += 15;
            else if (length > 50) score += 10;
            else if (length > 20) score += 5;
            
            score += (answerConfidence - 50) * 0.2;
            
            const techKeywords = ['function', 'variable', 'class', 'object', 'array', 'promise', 'async', 'closure', 'hoisting', 'scope', 'callback'];
            let keywordCount = 0;
            techKeywords.forEach(keyword => {
                if (userAnswer.toLowerCase().includes(keyword)) keywordCount++;
            });
            score += Math.min(10, keywordCount);
            
            score = Math.min(100, Math.max(0, score));
            
            let feedback = "";
            if (score >= 85) feedback = "Excellent answer! Well-structured and detailed.";
            else if (score >= 70) feedback = "Good answer. Could add more details or examples.";
            else if (score >= 55) feedback = "Decent answer. Need more depth and specific examples.";
            else feedback = "Answer too brief. Please provide more details and examples.";
            
            let suggestions = "";
            if (score < 70) {
                suggestions = "Add specific examples from your experience.";
            } else if (score < 85) {
                suggestions = "Consider adding code examples or real-world scenarios.";
            } else {
                suggestions = "Great job! Keep up this quality.";
            }
            
            return {
                question: question,
                answer: userAnswer,
                score: Math.round(score),
                feedback: feedback,
                suggestions: suggestions
            };
        });
        
        const overallScore = questionAnalysis.reduce((sum, q) => sum + q.score, 0) / questionAnalysis.length;
        
        let avgConfidence = 70;
        if (confidenceScores && confidenceScores.length > 0) {
            const validScores = confidenceScores.filter(c => c && typeof c === 'number');
            if (validScores.length > 0) {
                avgConfidence = validScores.reduce((sum, c) => sum + c, 0) / validScores.length;
            }
        }
        
        const avgAnswerLength = answers.reduce((sum, a) => sum + (a.answer?.length || 0), 0) / answers.length;
        let communicationScore = 65;
        if (avgAnswerLength > 150) communicationScore = 85;
        else if (avgAnswerLength > 80) communicationScore = 75;
        else if (avgAnswerLength > 40) communicationScore = 65;
        
        const allAnswers = answers.map(a => a.answer || '').join(' ').toLowerCase();
        const techKeywords = ['function', 'variable', 'class', 'array', 'object', 'promise', 'async', 'closure'];
        let keywordCount = 0;
        techKeywords.forEach(k => { if (allAnswers.includes(k)) keywordCount++; });
        let technicalScore = Math.min(95, 65 + (keywordCount * 4));
        
        const strengths = [];
        const weaknesses = [];
        const highScores = questionAnalysis.filter(q => q.score >= 80);
        const lowScores = questionAnalysis.filter(q => q.score < 60);
        
        if (highScores.length >= 2) strengths.push(`Strong performance on ${highScores.length} questions`);
        if (overallScore >= 75) strengths.push("Good overall understanding of core concepts");
        
        if (lowScores.length > 0) weaknesses.push(`${lowScores.length} answers need more depth`);
        if (avgAnswerLength < 50) weaknesses.push("Answers are too brief. Provide more details.");
        
        if (strengths.length === 0) strengths.push("Good attempt at answering all questions");
        if (weaknesses.length === 0) weaknesses.push("Could provide more specific examples");
        
        const improvements = [
            "Practice with real-world coding scenarios",
            "Review core concepts in your domain",
            "Record yourself to improve flow and clarity",
            "Take another mock interview to track progress"
        ];
        
        let summary = "";
        if (overallScore >= 85) {
            summary = `Excellent performance! You scored ${Math.round(overallScore)}% with ${Math.round(avgConfidence)}% confidence. You're well prepared for real interviews!`;
        } else if (overallScore >= 70) {
            summary = `Good performance (${Math.round(overallScore)}%). With a bit more practice, you'll be ready for interviews.`;
        } else if (overallScore >= 55) {
            summary = `Fair performance (${Math.round(overallScore)}%). Focus on providing more detailed answers.`;
        } else {
            summary = `You scored ${Math.round(overallScore)}%. Review the feedback and try again.`;
        }
        
        const recommendations = [
            "Take another mock interview next week",
            "Review and practice answers for weaker topics",
            "Prepare 2-3 real-world project examples to share"
        ];
        
        const report = {
            id: Date.now(),
            exam: exam || "Technical Interview",
            date: new Date().toISOString(),
            overallScore: Math.round(overallScore),
            confidenceScore: Math.round(avgConfidence),
            communicationScore: Math.round(communicationScore),
            technicalScore: Math.round(technicalScore),
            strengths: strengths,
            weaknesses: weaknesses,
            improvements: improvements,
            summary: summary,
            recommendations: recommendations,
            questionAnalysis: questionAnalysis
        };
        
        console.log(`✅ Report generated - Overall Score: ${report.overallScore}%`);
        
        res.json({
            success: true,
            report: report
        });
        
    } catch (error) {
        console.error('❌ Error generating report:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate report',
            error: error.message
        });
    }
};

// ========== UPDATE USER STATS ==========
const updateUserStats = async (userId, report) => {
    const User = require('../models/User');
    const user = await User.findById(userId);
    
    if (!user) return;
    
    const totalInterviews = (user.stats.totalInterviews || 0) + 1;
    const totalScore = (user.stats.averageScore || 0) * (totalInterviews - 1) + (report.overallScore || 0);
    
    user.stats = {
        totalInterviews,
        averageScore: Math.round(totalScore / totalInterviews),
        confidenceScore: report.confidenceScore || user.stats.confidenceScore,
        technicalScore: report.technicalScore || user.stats.technicalScore
    };
    
    await user.save();
    console.log('📊 User stats updated for:', userId);
};

// ========== EXPORTS ==========
module.exports = {
    startInterview,
    uploadResume,
    completeInterview,
    getInterview,
    getUserInterviews,
    generateQuestions,
    generateReport
};