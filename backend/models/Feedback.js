const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    type: {
      type: String,
      enum: ['bug', 'feature_request'],
      required: true,
    },
    status: {
      type: String,
      enum: ['open', 'under_review', 'planned', 'in_development', 'completed', 'closed'],
      default: 'open',
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      }
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Feedback', FeedbackSchema);
