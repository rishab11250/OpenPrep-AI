const express = require('express');
const {
  generateAIFlashcards,
  createFlashcard,
  getFlashcards,
  reviewFlashcard,
  deleteFlashcard,
} = require('../controllers/flashcardController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/generate-ai', protect, generateAIFlashcards);
router.post('/', protect, createFlashcard);
router.get('/', protect, getFlashcards);
router.put('/:id/review', protect, reviewFlashcard);
router.delete('/:id', protect, deleteFlashcard);

module.exports = router;
