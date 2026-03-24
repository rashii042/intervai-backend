const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Import user controller functions
const {
    getUserProfile,
    updateUserProfile,
    deleteUserAccount,
    updateUserStats,
    getAllUsers,
    getUserById
} = require('../controllers/userController');

// All routes below this line require authentication
router.use(protect);

// @route   GET /api/users/profile
// @desc    Get current user's profile
// @access  Private
router.get('/profile', getUserProfile);

// @route   PUT /api/users/profile
// @desc    Update current user's profile
// @access  Private
router.put('/profile', updateUserProfile);

// @route   DELETE /api/users/account
// @desc    Delete current user's account
// @access  Private
router.delete('/account', deleteUserAccount);

// @route   PUT /api/users/stats
// @desc    Update user's interview stats
// @access  Private
router.put('/stats', updateUserStats);

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/', protect, getAllUsers);

// @route   GET /api/users/:id
// @desc    Get user by ID (admin only)
// @access  Private/Admin
router.get('/:id', protect, getUserById);

module.exports = router;