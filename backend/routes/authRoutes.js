const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendPasswordResetEmail } = require('../services/emailService');

// Forgot Password - Send Reset Email
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        
        // Find user (don't reveal if user exists for security)
        const user = await User.findOne({ email: email.toLowerCase() });
        
        // Always return success even if user not found (security best practice)
        if (!user) {
            console.log(`Password reset requested for non-existent email: ${email}`);
            return res.status(200).json({ 
                success: true, 
                message: 'If this email is registered, you will receive a reset link.' 
            });
        }
        
        // Generate reset token (expires in 1 hour)
        const resetToken = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        
        // Store token in database (optional, for extra security)
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();
        
        // Send email
        const emailSent = await sendPasswordResetEmail(user.email, resetToken, user.name);
        
        if (emailSent) {
            res.status(200).json({ 
                success: true, 
                message: 'Password reset email sent! Check your inbox.' 
            });
        } else {
            res.status(500).json({ 
                success: false, 
                message: 'Failed to send email. Please try again later.' 
            });
        }
        
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Reset Password - Verify Token and Update
router.post('/reset-password', async (req, res) => {
    try {
        const { token, email, newPassword } = req.body;
        
        if (!token || !email || !newPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }
        
        // Find user
        const user = await User.findOne({ 
            email: email.toLowerCase(),
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }
        
        // Update password
        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        
        res.status(200).json({ 
            success: true, 
            message: 'Password reset successful! You can now login.' 
        });
        
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;