const express = require('express');
const Task = require('../models/Task');
const Habit = require('../models/Habit');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// @route   GET /api/analytics/summary
// @desc    Tasks completed per day (last 30 days)
router.get('/summary', async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const tasks = await Task.aggregate([
      { 
        $match: { 
          userId: req.user._id, 
          status: 'completed',
          completedAt: { $gte: thirtyDaysAgo }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$completedAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/analytics/productivity
// @desc    Best productive hours, category breakdown
router.get('/productivity', async (req, res, next) => {
  try {
    // This is a simplified version. A real app would analyze completion times for best hours.
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Category Breakdown
    const categoryBreakdown = await Task.aggregate([
      { 
        $match: { 
          userId: req.user._id,
          createdAt: { $gte: thirtyDaysAgo }
        } 
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      }
    ]);

    // Best hours (mocked based on actual completion times if we had detailed tracking, 
    // here we just extract hour from completedAt)
    const bestHours = await Task.aggregate([
      { 
        $match: { 
          userId: req.user._id, 
          status: 'completed',
          completedAt: { $exists: true }
        } 
      },
      {
        $group: {
          _id: { $hour: "$completedAt" },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({ 
      success: true, 
      data: {
        categoryBreakdown,
        bestHours
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/analytics/streaks
// @desc    Habit streak summary
router.get('/streaks', async (req, res, next) => {
  try {
    const habits = await Habit.find({ userId: req.user._id }, 'title streak longestStreak');
    
    const totalCurrentStreak = habits.reduce((acc, habit) => acc + habit.streak, 0);
    const totalLongestStreak = habits.reduce((acc, habit) => acc + habit.longestStreak, 0);

    res.json({ 
      success: true, 
      data: {
        habits,
        totalCurrentStreak,
        totalLongestStreak
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/analytics
// @desc    Get comprehensive analytics data
router.get('/', async (req, res, next) => {
  try {
    const { timeRange = '30days' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '7days':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(now.getDate() - 30);
        break;
      case '3months':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'alltime':
        startDate = new Date(0);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Get tasks completed over time
    const tasksCompleted = await Task.aggregate([
      {
        $match: {
          userId: req.user._id,
          status: 'completed',
          completedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$completedAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Category breakdown
    const categoryBreakdown = await Task.aggregate([
      {
        $match: {
          userId: req.user._id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      }
    ]);

    // Priority distribution
    const priorityDistribution = await Task.aggregate([
      {
        $match: {
          userId: req.user._id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 }
        }
      }
    ]);

    // Completion rate by day of week
    const completionRateByDay = await Task.aggregate([
      {
        $match: {
          userId: req.user._id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" },
          total: { $sum: 1 },
          completed: {
            $sum: {
              $cond: [{ $eq: ["$status", "completed"] }, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          day: {
            $let: {
              vars: { days: ["", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] },
              in: { $arrayElemAt: ["$$days", "$_id"] }
            }
          },
          rate: {
            $multiply: [
              { $divide: ["$completed", "$total"] },
              100
            ]
          }
        }
      },
      { $sort: { day: 1 } }
    ]);

    // Habit consistency
    const habitConsistency = await Habit.aggregate([
      {
        $match: {
          userId: req.user._id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $lookup: {
          from: 'habitcompletions',
          localField: '_id',
          foreignField: 'habitId',
          as: 'completions'
        }
      },
      {
        $project: {
          habit: "$title",
          completed: { $size: "$completions" },
          total: {
            $let: {
              vars: {
                days: {
                  $divide: [
                    { $subtract: [now, startDate] },
                    1000 * 60 * 60 * 24
                  ]
                }
              },
              in: { $ceil: "$$days" }
            }
          }
        }
      }
    ]);

    // Calculate summary stats
    const totalTasksCompleted = tasksCompleted.reduce((sum, day) => sum + day.count, 0);
    const averageTasksPerDay = tasksCompleted.length > 0 ? 
      (totalTasksCompleted / tasksCompleted.length).toFixed(1) : 0;
    
    // Find longest streak (simplified)
    const longestStreak = await Task.aggregate([
      {
        $match: {
          userId: req.user._id,
          status: 'completed',
          completedAt: { $gte: startDate }
        }
      },
      { $sort: { completedAt: 1 } },
      {
        $group: {
          _id: null,
          dates: { $push: { $dateToString: { format: "%Y-%m-%d", date: "$completedAt" } } }
        }
      }
    ]).then(result => {
      if (!result.length) return 0;
      // Simplified streak calculation
      return Math.floor(Math.random() * 15) + 1; // Mock for now
    });

    // Most productive day
    const mostProductiveDay = tasksCompleted.length > 0 ?
      tasksCompleted.reduce((max, day) => day.count > max.count ? day : max).date : 'N/A';

    const analyticsData = {
      summary: {
        totalTasksCompleted,
        averageTasksPerDay: parseFloat(averageTasksPerDay),
        longestStreak,
        mostProductiveDay
      },
      tasksCompleted,
      categoryBreakdown: categoryBreakdown.map(item => ({
        name: item._id || 'Uncategorized',
        value: item.count
      })),
      priorityDistribution: priorityDistribution.map(item => ({
        priority: item._id || 'Medium',
        count: item.count
      })),
      completionRateByDay: completionRateByDay.map(item => ({
        day: item.day,
        rate: Math.round(item.rate)
      })),
      habitConsistency
    };

    res.json(analyticsData);
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/analytics/insights
// @desc    Get AI-generated insights
router.get('/insights', async (req, res, next) => {
  try {
    // For now, return mock insights
    const insights = [
      "Your productivity peaks on Wednesdays - consider scheduling important tasks then",
      "You complete 23% more High priority tasks than Low priority ones",
      "Your current streak of 8 days is your best this month - keep it up!",
      "Morning tasks (9-12 AM) have a 15% higher completion rate"
    ];
    
    res.json({ insights });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/analytics/insights/refresh
// @desc    Refresh AI-generated insights
router.post('/insights/refresh', async (req, res, next) => {
  try {
    // Simulate AI analysis - in real app, this would call AI service
    const insights = [
      "Based on recent data, your completion rate improved by 12% this week",
      "You're most productive between 9-11 AM - protect this time block",
      "Consider breaking large tasks into smaller ones for better completion rates",
      "Your habit consistency has improved by 15% over the past month"
    ];
    
    res.json({ insights });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
