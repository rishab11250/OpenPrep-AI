const express = require('express');
const {
  generateAIQuiz,
  getQuizzes,
  getQuizDetails,
  submitQuizAttempt,
  getAttemptHistory,
} = require('../controllers/quizController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/generate-ai', protect, generateAIQuiz);
router.get('/', protect, getQuizzes);
router.get('/attempts/history', protect, getAttemptHistory);
router.get('/:id', protect, getQuizDetails);
router.post('/:id/submit', protect, submitQuizAttempt);

module.exports = router;
