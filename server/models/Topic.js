const mongoose = require('mongoose');

const TopicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a topic name'],
      trim: true,
    },
    description: {
      type: String,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    status: {
      type: String,
      enum: ['Weak', 'Medium', 'Strong'],
      default: 'Medium',
    },
    weightage: {
      type: Number, // Percentage of PYQ appearance or questions count
      default: 0,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Topic', TopicSchema);
