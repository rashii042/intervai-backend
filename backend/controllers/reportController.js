const Report = require('../models/Report');
const Interview = require('../models/Interview');

// @desc    Get report by ID
// @route   GET /api/reports/:id
// @access  Private
const getReport = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id)
            .populate('interview', 'subject difficulty questions answers');

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        // Check if user owns this report
        if (report.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json({
            success: true,
            report: {
                id: report._id,
                overallScore: report.overallScore,
                confidenceScore: report.confidenceScore,
                communicationScore: report.communicationScore,
                technicalScore: report.technicalScore,
                strengths: report.strengths,
                weaknesses: report.weaknesses,
                improvements: report.improvements,
                questionAnalysis: report.questionAnalysis,
                summary: report.summary,
                recommendations: report.recommendations,
                createdAt: report.createdAt,
                interview: {
                    subject: report.interview.subject,
                    difficulty: report.interview.difficulty
                }
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get user's reports
// @route   GET /api/reports
// @access  Private
const getUserReports = async (req, res) => {
    try {
        const reports = await Report.find({ user: req.user.id })
            .populate('interview', 'subject difficulty')
            .sort('-createdAt');

        res.json({
            success: true,
            reports: reports.map(report => ({
                id: report._id,
                overallScore: report.overallScore,
                subject: report.interview.subject,
                difficulty: report.interview.difficulty,
                date: report.createdAt
            }))
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getReport,
    getUserReports
};