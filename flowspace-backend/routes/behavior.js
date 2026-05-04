const express = require('express');
const BehaviorLog = require('../models/BehaviorLog');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// @route   POST /api/behavior/log
router.post('/log', async (req, res, next) => {
  try {
    const { hourSlot, tasksCompleted, avgSessionDuration } = req.body;
    const userId = req.user._id;

    if (hourSlot === undefined || tasksCompleted === undefined || avgSessionDuration === undefined) {
      return res.status(400).json({
        success: false,
        message: 'hourSlot, tasksCompleted, and avgSessionDuration are required'
      });
    }

    // Calculate missed days in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    
    const daysWithActivity = await BehaviorLog.distinct('date', {
      userId: userId,
      date: { $gte: sevenDaysAgo }
    });
    
    const missedDaysLast7 = Math.max(0, 7 - daysWithActivity.length);

    // Calculate user streak
    const streak = await calculateUserStreak(userId);

    const behaviorLog = await BehaviorLog.create({
      userId: userId,
      date: new Date(),
      hourSlot: hourSlot,
      tasksCompleted: tasksCompleted,
      avgSessionDuration: avgSessionDuration,
      dayOfWeek: new Date().getDay(),
      streak: streak,
      missedDaysLast7: missedDaysLast7
    });

    res.json({
      success: true,
      data: behaviorLog
    });

  } catch (error) {
    console.error('Behavior log error:', error);
    next(error);
  }
});

// Helper function to calculate user streak
async function calculateUserStreak(userId) {
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
