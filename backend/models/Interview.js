const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['direct', 'resume'],
        required: true
    },
    subject: {
        type: String,
        required: function() {
            return this.type === 'direct';
        }
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        required: function() {
            return this.type === 'direct';
        }
    },
    resume: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resume'
    },
    questions: [{
        type: String,
        required: true
    }],
    answers: [{
        question: String,
        answer: String,
        confidence: Number,
        timestamp: Date
    }],
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed'],
        default: 'pending'
    },
    score: {
        type: Number,
        min: 0,
        max: 100
    },
    confidenceScores: [{
        timestamp: Date,
        score: Number
    }],
    duration: Number,
    startedAt: Date,
    completedAt: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Interview', interviewSchema);