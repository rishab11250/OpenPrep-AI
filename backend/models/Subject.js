const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a subject name'],
      trim: true,
    },
    description: {
      type: String,
    },
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subject', SubjectSchema);
