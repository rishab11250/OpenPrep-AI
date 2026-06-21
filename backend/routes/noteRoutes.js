const express = require('express');
const { uploadNote, getNotes, downloadNote, deleteNote } = require('../controllers/noteController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/', protect, upload.single('file'), uploadNote);
router.get('/', protect, getNotes);
router.put('/:id/download', protect, downloadNote);
router.delete('/:id', protect, deleteNote);

module.exports = router;
