const mongoose = require('mongoose');

const PYQSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a paper title'],
    },
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    analyzed: {
      type: Boolean,
      default: false,
    },
    analysisResults: {
      chapterWeightage: [
        {
          chapterName: String,
          weightage: Number, // percentage or score
        }
      ],
      importantTopics: [
        {
          topicName: String,
          importance: String, // 'High', 'Medium', 'Low'
          frequency: Number, // approximate appearances
        }
      ],
      repeatedQuestions: [
        {
          questionText: String,
          years: [Number],
        }
      ],
      trendAnalysis: {
        type: String, // Description of exam trend
      },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PYQ', PYQSchema);
