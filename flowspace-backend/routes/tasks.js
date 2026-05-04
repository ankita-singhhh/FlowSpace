const express = require('express');
const Task = require('../models/Task');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// @route   GET /api/tasks
router.get('/', async (req, res, next) => {
  try {
    const { status, category, priority, date } = req.query;
    let query = { userId: req.user._id };

    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.dueDate = { $gte: startDate, $lte: endDate };
    }

    const tasks = await Task.find(query).sort({ dueDate: 1, createdAt: -1 });
    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/tasks
router.post('/', async (req, res, next) => {
  try {
    const taskData = { ...req.body, userId: req.user._id };
    const task = await Task.create(taskData);
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/tasks/:id
router.put('/:id', async (req, res, next) => {
  try {
    let task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/tasks/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
});

// @route   PATCH /api/tasks/:id/status
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!['todo', 'in-progress', 'completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const updateData = { status };
    if (status === 'completed') {
      updateData.completedAt = Date.now();
    } else {
      updateData.$unset = { completedAt: 1 };
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/tasks/:id/subtasks
router.post('/:id/subtasks', async (req, res, next) => {
  try {
    const { title } = req.body;
    
    if (!title) {
      return res.status(400).json({ success: false, message: 'Subtask title is required' });
    }

    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    task.subtasks.push({ title });
    await task.save();

    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
});

// @route   PATCH /api/tasks/:id/subtasks/:sid
router.patch('/:id/subtasks/:sid', async (req, res, next) => {
  try {
    const { completed } = req.body;

    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const subtask = task.subtasks.id(req.params.sid);
    if (!subtask) {
      return res.status(404).json({ success: false, message: 'Subtask not found' });
    }

    if (completed !== undefined) {
      subtask.completed = completed;
    }

    await task.save();

    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/tasks/:id/session
router.post('/:id/session', async (req, res, next) => {
  try {
    const { durationMinutes, sessionType } = req.body;
    const taskId = req.params.id;

    if (!durationMinutes || !sessionType) {
      return res.status(400).json({
        success: false,
        message: 'durationMinutes and sessionType are required'
      });
    }

    // Find and update task
    const task = await Task.findOne({ _id: taskId, userId: req.user._id });
    
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Increment timerSessions
    task.timerSessions = (task.timerSessions || 0) + 1;
    
    let autoCompleted = false;
    
    // Auto-mark task as completed after 2 sessions
    if (task.timerSessions >= 2) {
      task.status = 'completed';
      task.completedAt = new Date();
      autoCompleted = true;
      
      // Update goal completion percentage if this task is linked to a goal
      if (task.goalId) {
        const Goal = require('../models/Goal');
        await Goal.findByIdAndUpdate(task.goalId, {
          $inc: { completedTasks: 1 }
        });
      }
    }

    await task.save();

    // Save BehaviorLog
    const BehaviorLog = require('../models/BehaviorLog');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Calculate tasks completed today
    const tasksCompletedToday = await Task.countDocuments({
      userId: req.user._id,
      status: 'completed',
      completedAt: { $gte: today }
    });

    // Calculate missed days in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    
    const daysWithActivity = await BehaviorLog.distinct('date', {
      userId: req.user._id,
      date: { $gte: sevenDaysAgo }
    });
    
    const missedDaysLast7 = Math.max(0, 7 - daysWithActivity.length);

    // Get user streak (this would need to be calculated from user model or behavior logs)
    // For now, we'll use a simple calculation
    const streak = await calculateUserStreak(req.user._id);

    const behaviorLog = await BehaviorLog.create({
      userId: req.user._id,
      date: new Date(),
      hourSlot: new Date().getHours(),
      tasksCompleted: tasksCompletedToday,
      avgSessionDuration: durationMinutes,
      dayOfWeek: new Date().getDay(),
      streak: streak,
      missedDaysLast7: missedDaysLast7
    });

    res.json({
      success: true,
      data: {
        task,
        autoCompleted,
        sessionCount: task.timerSessions,
        behaviorLog
      }
    });

  } catch (error) {
    console.error('Session endpoint error:', error);
    next(error);
  }
});

// Helper function to calculate user streak
async function calculateUserStreak(userId) {
  const BehaviorLog = require('../models/BehaviorLog');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  let currentDate = new Date(today);
  
  for (let i = 0; i < 365; i++) { // Check up to a year
    const log = await BehaviorLog.findOne({
      userId: userId,
      date: currentDate
    });
    
    if (log && log.tasksCompleted > 0) {
      streak++;
    } else if (i > 0) { // Don't break on first day (today)
      break;
    }
    
    currentDate.setDate(currentDate.getDate() - 1);
  }
  
  return streak;
}

module.exports = router;
