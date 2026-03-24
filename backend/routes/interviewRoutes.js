const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const {
    startInterview,
    uploadResume,
    completeInterview,
    getInterview,
    getUserInterviews,
    generateQuestions,
    generateReport  // ✨ ADD THIS - Report generation function
} = require('../controllers/interviewController');

// All routes require authentication
router.use(protect);

// ========== INTERVIEW ROUTES ==========
router.post('/start', startInterview);
router.post('/upload-resume', upload.single('resume'), uploadResume);
router.post('/:id/complete', completeInterview);
router.get('/:id', getInterview);
router.get('/', getUserInterviews);

// ========== AI QUESTION GENERATION ==========
router.post('/generate-questions', generateQuestions);

// ========== ✨ REPORT GENERATION ==========
router.post('/generate-report', generateReport);

module.exports = router;