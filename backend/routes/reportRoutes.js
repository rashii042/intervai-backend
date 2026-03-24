const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getReport,
    getUserReports
} = require('../controllers/reportController');

router.use(protect);

router.get('/:id', getReport);
router.get('/', getUserReports);

module.exports = router;