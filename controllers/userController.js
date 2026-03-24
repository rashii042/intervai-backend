const User = require('../models/User');

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profile: user.profile || {},
                stats: user.stats || {
                    totalInterviews: 0,
                    averageScore: 0,
                    confidenceScore: 0,
                    technicalScore: 0
                },
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Error in getUserProfile:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const { name, profile } = req.body;
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        // Update fields
        if (name) user.name = name;
        if (profile) {
            user.profile = {
                ...user.profile,
                ...profile
            };
        }
        
        await user.save();
        
        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                profile: user.profile,
                stats: user.stats
            }
        });
    } catch (error) {
        console.error('Error in updateUserProfile:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
const deleteUserAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        await user.deleteOne();
        
        res.json({ 
            success: true, 
            message: 'Account deleted successfully' 
        });
    } catch (error) {
        console.error('Error in deleteUserAccount:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// @desc    Update user stats after interview
// @route   PUT /api/users/stats
// @access  Private
const updateUserStats = async (req, res) => {
    try {
        const { totalInterviews, averageScore, confidenceScore, technicalScore } = req.body;
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        // Update stats
        user.stats = {
            totalInterviews: totalInterviews || user.stats.totalInterviews,
            averageScore: averageScore || user.stats.averageScore,
            confidenceScore: confidenceScore || user.stats.confidenceScore,
            technicalScore: technicalScore || user.stats.technicalScore
        };
        
        await user.save();
        
        res.json({
            success: true,
            stats: user.stats
        });
    } catch (error) {
        console.error('Error in updateUserStats:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied. Admin only.' 
            });
        }
        
        const users = await User.find({}).select('-password');
        
        res.json({
            success: true,
            count: users.length,
            users: users.map(user => ({
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                stats: user.stats,
                createdAt: user.createdAt
            }))
        });
    } catch (error) {
        console.error('Error in getAllUsers:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// @desc    Get user by ID (Admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied. Admin only.' 
            });
        }
        
        const user = await User.findById(req.params.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profile: user.profile,
                stats: user.stats,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Error in getUserById:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// EXPORT ALL FUNCTIONS
module.exports = {
    getUserProfile,
    updateUserProfile,
    deleteUserAccount,
    updateUserStats,
    getAllUsers,
    getUserById
};