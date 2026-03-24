const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    interview: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Interview',
        required: true
    },
    overallScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    confidenceScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    communicationScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    technicalScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    strengths: [{
        type: String
    }],
    weaknesses: [{
        type: String
    }],
    improvements: [{
        type: String
    }],
    questionAnalysis: [{
        question: String,
        answer: String,
        score: Number,
        feedback: String,
        suggestions: String
    }],
    summary: {
        type: String,
        required: true
    },
    recommendations: [{
        type: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Report', reportSchema);