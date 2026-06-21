const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  topic: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
  duration: { type: Number, default: 60 }, // duration in minutes
});

const DailyGoalSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  tasks: [TaskSchema],
});

const StudyPlanSchema = new mongoose.Schema(
  {
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
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    dailyGoals: [DailyGoalSchema],
    status: {
      type: String,
      enum: ['active', 'completed', 'archived'],
      default: 'active',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StudyPlan', StudyPlanSchema);
