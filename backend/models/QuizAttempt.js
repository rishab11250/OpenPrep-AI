const mongoose = require('mongoose');

const QuizAttemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    answers: [
      {
        questionId: mongoose.Schema.Types.ObjectId,
        selectedAnswer: Number, // Index of user answer (0-3)
        isCorrect: Boolean,
      },
    ],
    timeSpent: {
      type: Number, // in seconds
      default: 0,
    },
    weakTopics: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic',
      },
    ],
    strongTopics: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic',
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('QuizAttempt', QuizAttemptSchema);
