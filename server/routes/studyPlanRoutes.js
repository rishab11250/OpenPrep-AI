const express = require('express');
const { generateAIPlan, getActivePlan, toggleTaskCompletion } = require('../controllers/studyPlanController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/generate-ai', protect, generateAIPlan);
router.get('/active', protect, getActivePlan);
router.put('/:planId/tasks/:taskId', protect, toggleTaskCompletion);

module.exports = router;
