const express = require('express');
const { getDashboardStats, getSubjectBreakdown } = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/dashboard', protect, getDashboardStats);
router.get('/subjects', protect, getSubjectBreakdown);

module.exports = router;
