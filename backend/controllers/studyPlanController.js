const StudyPlan = require('../models/StudyPlan');
const Exam = require('../models/Exam');
const Subject = require('../models/Subject');
const Topic = require('../models/Topic');
const ActivityLog = require('../models/ActivityLog');
const geminiService = require('../services/geminiService');

// @desc    Generate AI Study Plan
// @route   POST /api/study-plans/generate-ai
// @access  Private
exports.generateAIPlan = async (req, res, next) => {
  try {
    const { examId, startDate, endDate, studyHoursPerDay } = req.body;

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ success: false, error: 'Exam not found' });
    }

    // Retrieve subjects and topics to construct syllabus payload
    const subjects = await Subject.find({ exam: examId, user: req.user.id });
    const syllabus = [];

    for (const sub of subjects) {
      const topics = await Topic.find({ subject: sub._id, user: req.user.id });
      syllabus.push({
        subjectName: sub.name,
        topics: topics.map((t) => t.name),
      });
    }

    if (syllabus.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please add subjects and topics to your syllabus before generating a plan.',
      });
    }

    // Call Gemini API to structure plan
    const generatedGoals = await geminiService.generateStudyPlan(
      exam.name,
      syllabus,
      startDate,
      endDate,
      studyHoursPerDay || 3,
      req.query.refresh === 'true'
    );

    // Format goals for Mongoose insertion (resolve Topic ObjectIds if names match)
    const formattedGoals = [];
    for (const day of generatedGoals) {
      const tasks = [];
      for (const t of day.tasks) {
        // Try finding matching Topic ObjectId
        const matchedTopic = await Topic.findOne({
          name: { $regex: new RegExp(`^${t.topicName.trim()}$`, 'i') },
          user: req.user.id,
        });

        tasks.push({
          title: t.title,
          duration: t.duration || 60,
          completed: false,
          topic: matchedTopic ? matchedTopic._id : null,
        });
      }
      formattedGoals.push({
        date: new Date(day.date),
        tasks,
      });
    }

    // Archive previous active plans
    await StudyPlan.updateMany(
      { user: req.user.id, exam: examId, status: 'active' },
      { status: 'archived' }
    );

    const studyPlan = await StudyPlan.create({
      exam: examId,
      user: req.user.id,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      dailyGoals: formattedGoals,
      status: 'active',
    });

    // Log Activity
    await ActivityLog.create({
      user: req.user.id,
      activityType: 'study_plan_create',
      description: `Generated AI Study Plan for exam: ${exam.name}`,
    });

    res.status(201).json({
      success: true,
      data: studyPlan,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Active Study Plan
// @route   GET /api/study-plans/active
// @access  Private
exports.getActivePlan = async (req, res, next) => {
  try {
    const { examId } = req.query;
    const filter = { user: req.user.id, status: 'active' };
    if (examId) filter.exam = examId;

    const plan = await StudyPlan.findOne(filter)
      .populate('exam')
      .populate('dailyGoals.tasks.topic');

    if (!plan) {
      return res.status(200).json({ success: true, data: null });
    }

    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle Task Completion Status
// @route   PUT /api/study-plans/:planId/tasks/:taskId
// @access  Private
exports.toggleTaskCompletion = async (req, res, next) => {
  try {
    const { planId, taskId } = req.params;
    const { completed, studyTimeMinutes } = req.body; // option to track study hours completed

    const plan = await StudyPlan.findOne({ _id: planId, user: req.user.id });
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Study plan not found' });
    }

    // Find and update task
    let taskFound = false;
    for (const goal of plan.dailyGoals) {
      const task = goal.tasks.id(taskId);
      if (task) {
        task.completed = completed;
        taskFound = true;
        break;
      }
    }

    if (!taskFound) {
      return res.status(404).json({ success: false, error: 'Task not found in plan' });
    }

    await plan.save();

    // If task was completed, add study hours to User profile
    if (completed && studyTimeMinutes) {
      const hours = studyTimeMinutes / 60;
      await req.user.constructor.findByIdAndUpdate(req.user.id, {
        $inc: { studyHours: Number(hours.toFixed(2)) },
      });
    }

    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};
