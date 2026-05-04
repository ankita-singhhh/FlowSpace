const mongoose = require('mongoose');

const behaviorLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  hourSlot: {
    type: Number,
    required: true,
    min: 0,
    max: 23
  },
  tasksCompleted: {
    type: Number,
    required: true,
    default: 0
  },
  avgSessionDuration: {
    type: Number,
    required: true,
    default: 0
  },
  dayOfWeek: {
    type: Number,
    required: true,
    min: 0,
    max: 6
  },
  streak: {
    type: Number,
    required: true,
    default: 0
  },
  missedDaysLast7: {
    type: Number,
    required: true,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for faster queries
behaviorLogSchema.index({ userId: 1, date: -1 });
behaviorLogSchema.index({ userId: 1, date: 1 });
behaviorLogSchema.index({ userId: 1, hourSlot: 1 });

module.exports = mongoose.model('BehaviorLog', behaviorLogSchema);
