const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get current user profile
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json({ success: true, user });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
    try {
        const { name, email, skills, experience, education, phone } = req.body;
        
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (phone) user.phone = phone;
        if (skills) user.skills = skills;
        if (experience) user.experience = experience;
        if (education) user.education = education;

        await user.save();

        const updatedUser = await User.findById(req.user.id).select('-password');
        res.json({ success: true, user: updatedUser, message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user stats for dashboard
router.get('/stats', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        // You can add interview stats here if you have Interview model
        res.json({
            success: true,
            stats: {
                interviewsTaken: user.interviewsTaken || 0,
                averageScore: user.averageScore || 0,
                totalQuestions: user.totalQuestions || 0
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;