require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Import routes
const authRoutes = require('./routes/authRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const userRoutes = require('./routes/userRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in environment variables');
    process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected successfully'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL_NAME = "gemini-2.5-flash-lite";

// ========== GENERATE QUESTIONS USING GEMINI API ==========
app.post('/api/ai/generate-questions', async (req, res) => {
    try {
        const { subject, difficulty, count, examType } = req.body;
        
        console.log('📡 Gemini API - Generating questions...');
        console.log('Subject:', subject, 'Difficulty:', difficulty, 'Count:', count, 'Exam:', examType);
        
        let prompt = '';
        
        if (examType && examType !== 'general' && examType !== 'null') {
            prompt = `Generate ${count} interview questions for ${examType} company interview with ${difficulty} difficulty level.
            The questions should be relevant to ${subject} subject and typical ${examType} interview style.
            Return ONLY a JSON array of questions. No other text, no explanations.
            Example format: ["Question 1", "Question 2", "Question 3"]`;
        } else {
            prompt = `Generate ${count} ${subject} interview questions for ${difficulty} level.
            Return ONLY a JSON array of questions. No other text.
            Example format: ["Question 1", "Question 2", "Question 3"]`;
        }
        
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        let questions = [];
        try {
            let cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const jsonMatch = cleanText.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                questions = JSON.parse(jsonMatch[0]);
            } else {
                questions = JSON.parse(cleanText);
            }
        } catch (e) {
            const lines = text.split('\n');
            questions = lines
                .filter(line => line.match(/^\d+\./) || line.match(/^["']/))
                .map(line => line.replace(/^\d+\.\s*/, '').replace(/^["']|["']$/g, '').trim())
                .filter(q => q.length > 0 && !q.includes('```') && q !== '[' && q !== ']');
        }
        
        if (!questions || questions.length === 0) {
            questions = getFallbackQuestions(subject, examType);
        }
        
        const finalQuestions = questions.slice(0, count || 8);
        
        res.json({
            success: true,
            questions: finalQuestions,
            count: finalQuestions.length,
            source: 'gemini',
            model: MODEL_NAME
        });
        
    } catch (error) {
        console.error('❌ Gemini API Error:', error.message);
        const fallbackQuestions = getFallbackQuestions(req.body.subject, req.body.examType);
        res.json({
            success: true,
            questions: fallbackQuestions.slice(0, req.body.count || 8),
            count: fallbackQuestions.slice(0, req.body.count || 8).length,
            source: 'fallback'
        });
    }
});

// Fallback Questions
function getFallbackQuestions(subject, examType) {
    const companyQuestions = {
        'Google': [
            "Design an algorithm to find the shortest path in a graph.",
            "How would you design a URL shortening service?",
            "Explain load balancing and its types.",
            "What is the difference between process and thread?",
            "How would you handle a million requests per second?",
            "Design a web crawler.",
            "Explain the CAP theorem.",
            "What is consistent hashing?"
        ],
        'Microsoft': [
            "Design a parking lot system using OOPs.",
            "Explain virtual memory.",
            "What is the difference between mutex and semaphore?",
            "How would you implement an LRU cache?",
            "Design a file system.",
            "What is the difference between HTTP and HTTPS?",
            "Explain garbage collection.",
            "What is deadlock and how to prevent it?"
        ],
        'Amazon': [
            "Design a recommendation system.",
            "Explain the CAP theorem in detail.",
            "How would you design a scalable e-commerce platform?",
            "What is the difference between SQL and NoSQL?",
            "Design a distributed key-value store.",
            "Explain eventual consistency.",
            "What is a message queue?",
            "How would you handle data consistency?"
        ],
        'TCS-NQT': [
            "What is the difference between C and Java?",
            "Explain OOP concepts.",
            "What are SQL joins?",
            "Explain SDLC.",
            "What is polymorphism?",
            "Difference between array and linked list?",
            "Explain exception handling.",
            "Abstract class vs Interface?"
        ]
    };
    
    if (examType && companyQuestions[examType]) {
        return companyQuestions[examType];
    }
    
    const subjectQuestions = {
        'technical': [
            "What is the difference between let, const, and var in JavaScript?",
            "Explain closures in JavaScript.",
            "What is the event loop?",
            "Explain promises in JavaScript.",
            "What is the difference between == and ===?",
            "What is hoisting?",
            "Explain the concept of this in JavaScript.",
            "What is the difference between map and forEach?"
        ],
        'aptitude': [
            "If a train travels at 60 km/h, how long to cover 180 km?",
            "What is the next number: 2, 4, 8, 16, ?",
            "A man buys a watch for Rs. 500, sells for Rs. 600. Profit percentage?",
            "What is the square root of 144?",
            "If 5 workers complete a task in 10 days, how many for 2 days?",
            "What is 15% of 200?",
            "What is the average of 10, 20, 30, 40, 50?",
            "A car travels 240 km in 4 hours. Speed?"
        ],
        'general': [
            "Tell me about yourself.",
            "What are your greatest strengths?",
            "What are your weaknesses?",
            "Why do you want to work here?",
            "Where do you see yourself in 5 years?",
            "Tell me about a challenge you faced.",
            "How do you handle pressure?",
            "Why should we hire you?"
        ]
    };
    
    return subjectQuestions[subject] || subjectQuestions.general;
}

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is working! Gemini API ready.' });
});

app.listen(process.env.PORT || 5000, () => {
    console.log(`✅ Server running on port ${process.env.PORT || 5000}`);
    console.log('📡 POST /api/ai/generate-questions (Gemini)');
    console.log('📡 GET /api/test');
});