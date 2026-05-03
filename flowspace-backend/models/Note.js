const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String, // Markdown content
  },
  tags: [{
    type: String,
  }],
  pinned: {
    type: Boolean,
    default: false,
  },
  color: {
    type: String,
  },
  linkedTaskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
  }
}, {
  timestamps: true
});

noteSchema.index({ userId: 1, pinned: -1 });

const Note = mongoose.model('Note', noteSchema);
module.exports = Note;
