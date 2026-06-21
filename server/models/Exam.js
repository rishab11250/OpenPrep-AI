const mongoose = require('mongoose');

const ExamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add an exam name'],
      trim: true,
    },
    description: {
      type: String,
    },
    date: {
      type: Date,
      required: [true, 'Please add an exam date'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Exam', ExamSchema);
