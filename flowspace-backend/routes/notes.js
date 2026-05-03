const express = require('express');
const Note = require('../models/Note');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// @route   GET /api/notes
router.get('/', async (req, res, next) => {
  try {
    const { pinned, tag } = req.query;
    let query = { userId: req.user._id };

    if (pinned !== undefined) {
      query.pinned = pinned === 'true';
    }

    if (tag) {
      query.tags = tag;
    }

    const notes = await Note.find(query).sort({ pinned: -1, updatedAt: -1 });
    res.json({ success: true, count: notes.length, data: notes });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/notes
router.post('/', async (req, res, next) => {
  try {
    const noteData = { ...req.body, userId: req.user._id };
    const note = await Note.create(noteData);
    res.status(201).json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/notes/:id
router.put('/:id', async (req, res, next) => {
  try {
    let note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    note = await Note.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/notes/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    res.json({ success: true, message: 'Note deleted' });
  } catch (error) {
    next(error);
  }
});

// @route   PATCH /api/notes/:id/pin
router.patch('/:id/pin', async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    note.pinned = !note.pinned;
    await note.save();

    res.json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
