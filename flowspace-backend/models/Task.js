const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
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
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium',
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'completed'],
    default: 'todo',
  },
  dueDate: {
    type: Date,
  },
  dueTime: {
    type: String,
  },
  category: {
    type: String,
    enum: ['Work', 'Personal', 'Health', 'Finance', 'Learning', 'Other'],
    default: 'Other',
  },
  tags: [{
    type: String,
  }],
  subtasks: [{
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  }],
  recurring: {
    enabled: { type: Boolean, default: false },
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly'] },
    endDate: { type: Date },
  },
  completedAt: {
    type: Date,
  },
  estimatedMinutes: {
    type: Number,
  },
  actualMinutes: {
    type: Number,
  },
  dayNumber: {
    type: Number,
  },
  taskType: {
    type: String,
    enum: ['study', 'practice', 'build', 'review'],
  },
  timerSessions: [{
    startTime: { type: Date },
    endTime: { type: Date },
    duration: { type: Number },
    paused: { type: Boolean, default: false }
  }],
  goalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal'
  }
}, {
  timestamps: true
});

// Indexes for fast querying
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ userId: 1, category: 1 });
taskSchema.index({ goalId: 1, dayNumber: 1 });

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
