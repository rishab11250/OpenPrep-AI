const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a note title'],
      trim: true,
    },
    content: {
      type: String,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
    },
    fileUrl: {
      type: String,
    },
    fileType: {
      type: String, // 'pdf', 'image', 'docx', 'text'
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      enum: ['Lecture Notes', 'Study Guide', 'Cheat Sheet', 'Summary', 'Other'],
      default: 'Lecture Notes',
    },
    downloadsCount: {
      type: Number,
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

module.exports = mongoose.model('Note', NoteSchema);
