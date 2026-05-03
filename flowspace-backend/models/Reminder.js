const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  repeat: {
    type: String,
    enum: ['once', 'daily', 'weekly', 'monthly'],
    default: 'once',
  },
  repeatEndDate: {
    type: Date,
  },
  snoozedUntil: {
    type: Date,
  },
  done: {
    type: Boolean,
    default: false,
  },
  notificationSent: {
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

reminderSchema.index({ userId: 1, date: 1 });
reminderSchema.index({ userId: 1, done: 1 });

const Reminder = mongoose.model('Reminder', reminderSchema);
module.exports = Reminder;
