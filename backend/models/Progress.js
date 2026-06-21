const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema(
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
      required: true,
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    studyHours: {
      type: Number,
      default: 0,
    },
    quizScores: [
      {
        attempt: { type: mongoose.Schema.Types.ObjectId, ref: 'QuizAttempt' },
        score: Number,
        date: { type: Date, default: Date.now },
      },
    ],
    flashcardsMastered: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Progress', ProgressSchema);
