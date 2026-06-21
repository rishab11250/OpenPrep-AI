const mongoose = require('mongoose');

const FlashcardSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
    },
    front: {
      type: String,
      required: [true, 'Please add a question or term for the front'],
    },
    back: {
      type: String,
      required: [true, 'Please add an answer or definition for the back'],
    },
    // Spaced Repetition details (SuperMemo SM-2 adaptation)
    interval: {
      type: Number,
      default: 1, // in days
    },
    repetitions: {
      type: Number,
      default: 0,
    },
    efactor: {
      type: Number,
      default: 2.5,
    },
    nextReviewDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Flashcard', FlashcardSchema);
