const Note = require('../models/Note');
const Subject = require('../models/Subject');
const Topic = require('../models/Topic');
const ActivityLog = require('../models/ActivityLog');

// @desc    Upload Note
// @route   POST /api/notes
// @access  Private
exports.uploadNote = async (req, res, next) => {
  try {
    const { title, content, subjectId, topicId, isPublic, category } = req.body;

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ success: false, error: 'Subject not found' });
    }

    let fileUrl = '';
    let fileType = 'text';

    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
      const ext = req.file.filename.split('.').pop().toLowerCase();
      fileType = ext === 'pdf' ? 'pdf' : (['jpg', 'jpeg', 'png'].includes(ext) ? 'image' : 'docx');
    }

    const note = await Note.create({
      title,
      content,
      subject: subjectId,
      topic: topicId || null,
      fileUrl,
      fileType,
      isPublic: isPublic === 'true' || isPublic === true,
      category: category || 'Lecture Notes',
      user: req.user.id,
    });

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      activityType: 'note_upload',
      description: `Uploaded new study notes: "${note.title}"`,
    });

    res.status(201).json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all notes (with search, filter, pagination)
// @route   GET /api/notes
// @access  Private
exports.getNotes = async (req, res, next) => {
  try {
    const { subjectId, category, search, publicOnly } = req.query;

    const query = {};
    
    // Privacy filter
    if (publicOnly === 'true') {
      query.isPublic = true;
    } else {
      // By default show user's own notes, OR public notes
      query.$or = [{ user: req.user.id }, { isPublic: true }];
    }

    if (subjectId) query.subject = subjectId;
    if (category) query.category = category;
    if (search) {
      query.$and = [
        query.$or ? { $or: query.$or } : {},
        {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { content: { $regex: search, $options: 'i' } },
          ]
        }
      ].filter(x => Object.keys(x).length > 0);
    }

    // Clean up query if $and/or are empty
    if (query.$and && query.$and.length === 0) delete query.$and;
    if (query.$or && query.$or.length === 0) delete query.$or;

    const notes = await Note.find(query)
      .populate('subject')
      .populate('topic')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: notes.length, data: notes });
  } catch (error) {
    next(error);
  }
};

// @desc    Download / Increment note download count
// @route   PUT /api/notes/:id/download
// @access  Private
exports.downloadNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, error: 'Note not found' });
    }

    note.downloadsCount += 1;
    await note.save();

    res.status(200).json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Note
// @route   DELETE /api/notes/:id
// @access  Private
exports.deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!note) {
      return res.status(404).json({ success: false, error: 'Note not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
