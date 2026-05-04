const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  skillLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true
  },
  dailyMinutes: {
    type: Number,
    required: true,
    min: 1
  },
  goalType: {
    type: String,
    enum: ['Study', 'Build Project', 'Exam Prep', 'Skill Learning'],
    required: true
  },
  enhancedPrompt: {
    type: String,
    required: true
  },
  totalDays: {
    type: Number,
    required: true,
    min: 1
  },
  deadline: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'archived'],
    default: 'active'
  },
  completedTasks: {
    type: Number,
    default: 0
  },
  totalTasks: {
    type: Number,
    required: true,
    min: 1
  },
  completionPct: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

// Calculate completion percentage when completedTasks changes
goalSchema.pre('save', function(next) {
  if (this.isModified('completedTasks') || this.isModified('totalTasks')) {
    this.completionPct = this.totalTasks > 0 ? Math.round((this.completedTasks / this.totalTasks) * 100) : 0;
  }
  if (typeof next === 'function') {
    next();
  }
});

// Index for faster queries
goalSchema.index({ userId: 1, status: 1 });
goalSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Goal', goalSchema);
