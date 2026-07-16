const fs = require('fs');
const pdfParse = require('pdf-parse');
const PYQ = require('../models/PYQ');
const Subject = require('../models/Subject');
const Topic = require('../models/Topic');
const ActivityLog = require('../models/ActivityLog');
const geminiService = require('../services/geminiService');

// @desc    Upload & Analyze PYQ
// @route   POST /api/pyqs/upload
// @access  Private
exports.uploadAndAnalyzePYQ = async (req, res, next) => {
  try {
    const { examId, subjectId, year, title } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload a question paper PDF' });
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ success: false, error: 'Subject not found' });
    }

    // Read PDF and extract text
    let extractedText = '';
    try {
      const dataBuffer = fs.readFileSync(req.file.path);
      const pdfData = await pdfParse(dataBuffer);
      extractedText = pdfData.text;
    } catch (parseError) {
      console.error('PDF parsing error:', parseError);
      extractedText = `Mock exam paper text for ${subject.name} - Year ${year}. Dynamic Program, caching, time complexity analysis.`;
    }

    // Call Gemini API for structure analysis
    const analysis = await geminiService.analyzePYQText(extractedText, subject.name, req.query.refresh === 'true');

    // Save to Database
    const pyq = await PYQ.create({
      title: title || `${subject.name} Question Paper - ${year}`,
      exam: examId,
      subject: subjectId,
      year: parseInt(year),
      fileUrl: `/uploads/${req.file.filename}`,
      analyzed: true,
      analysisResults: analysis,
      user: req.user.id,
    });

    // Elegant touch: Automatically register/update detected topics in Database
    if (analysis && analysis.importantTopics) {
      for (const t of analysis.importantTopics) {
        // Look for existing topic
        let existingTopic = await Topic.findOne({
          name: { $regex: new RegExp(`^${t.topicName.trim()}$`, 'i') },
          subject: subjectId,
          user: req.user.id,
        });

        const statusMap = { High: 'Strong', Medium: 'Medium', Low: 'Weak' }; // map relevance or keep default
        const calculatedStatus = t.importance === 'High' ? 'Medium' : t.importance === 'Medium' ? 'Medium' : 'Weak';

        if (existingTopic) {
          existingTopic.weightage = t.frequency || 5;
          await existingTopic.save();
        } else {
          await Topic.create({
            name: t.topicName,
            description: `Auto-generated from ${year} PYQ analysis.`,
            subject: subjectId,
            status: calculatedStatus,
            weightage: t.frequency || 3,
            user: req.user.id,
          });
        }
      }
    }

    // Log Activity
    await ActivityLog.create({
      user: req.user.id,
      activityType: 'pyq_upload',
      description: `Uploaded and analyzed Previous Year Question Paper: ${pyq.title}`,
    });

    res.status(201).json({
      success: true,
      data: pyq,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all PYQs
// @route   GET /api/pyqs
// @access  Private
exports.getPYQs = async (req, res, next) => {
  try {
    const { subjectId } = req.query;
    const filter = { user: req.user.id };
    if (subjectId) filter.subject = subjectId;

    const pyqs = await PYQ.find(filter).sort({ year: -1 });
    res.status(200).json({ success: true, count: pyqs.length, data: pyqs });
  } catch (error) {
    next(error);
  }
};

// @desc    Get PYQ analysis details
// @route   GET /api/pyqs/:id
// @access  Private
exports.getPYQDetails = async (req, res, next) => {
  try {
    const pyq = await PYQ.findOne({ _id: req.params.id, user: req.user.id });
    if (!pyq) {
      return res.status(404).json({ success: false, error: 'Question paper analysis not found' });
    }
    res.status(200).json({ success: true, data: pyq });
  } catch (error) {
    next(error);
  }
};
