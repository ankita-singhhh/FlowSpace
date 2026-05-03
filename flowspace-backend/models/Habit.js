const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
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
  frequency: {
    type: String,
    enum: ['daily', 'weekly'],
    required: true,
  },
  targetDays: [{
    type: Number,
    min: 0,
    max: 6,
  }], // 0-6 for weekly habits
  color: {
    type: String,
  },
  icon: {
    type: String,
  },
  streak: {
    type: Number,
    default: 0,
  },
  longestStreak: {
    type: Number,
    default: 0,
  },
  completedDates: [{
    type: Date,
  }]
}, {
  timestamps: true
});

habitSchema.index({ userId: 1 });

const Habit = mongoose.model('Habit', habitSchema);
module.exports = Habit;
