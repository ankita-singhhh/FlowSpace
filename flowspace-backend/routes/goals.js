const express = require('express');
const Goal = require('../models/Goal');
const Task = require('../models/Task');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// POST /api/goals/enhance-prompt
router.post('/enhance-prompt', async (req, res, next) => {
  try {
    const { userInput, skillLevel, dailyMinutes, goalType } = req.body;

    if (!userInput || !skillLevel || !dailyMinutes || !goalType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userInput, skillLevel, dailyMinutes, goalType'
      });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      // Fallback response when no API key is configured
      const fallbackPrompt = `Create a structured learning plan for ${userInput}. This is a ${skillLevel} level goal requiring ${dailyMinutes} minutes daily commitment in the ${goalType} category. The plan should include clear daily milestones, progressive skill development, and measurable success criteria. Focus on practical application and consistent progress tracking with achievable daily targets that build toward comprehensive mastery.`;
      
      return res.json({
        success: true,
        data: { enhancedPrompt: fallbackPrompt }
      });
    }

    const prompt = `The user wants: ${userInput}. Skill: ${skillLevel}. Time: ${dailyMinutes}min/day. Goal type: ${goalType}. Rewrite as a detailed planning request with clear timeline, daily milestones, and success criteria. Under 150 words. Return ONLY the enhanced prompt text, nothing else.`;

    try {
      // First try to list available models to find the correct endpoint
      const modelsResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiApiKey}`);
      
      if (!modelsResponse.ok) {
        const errorData = await modelsResponse.json().catch(() => ({}));
        console.error('Models API error:', modelsResponse.status, errorData);
        throw new Error(`Gemini API key invalid or expired: ${modelsResponse.status}`);
      }

      const modelsData = await modelsResponse.json();
      console.log('Available models:', modelsData.models?.map(m => m.name).slice(0, 5));
      
      // Find a model that supports generateContent
      const supportedModel = modelsData.models?.find(m => 
        m.name.includes('gemini') && 
        m.supportedGenerationMethods?.includes('generateContent')
      );
      
      if (!supportedModel) {
        throw new Error('No Gemini model found that supports generateContent');
      }

      console.log('Using model:', supportedModel.name);
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${supportedModel.name}:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            maxOutputTokens: 200,
            temperature: 0.7
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Gemini API error response:', response.status, errorData);
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const enhancedPrompt = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      res.json({
        success: true,
        data: { enhancedPrompt }
      });

    } catch (apiError) {
      console.error('Gemini API failed, using fallback:', apiError.message);
      
      // Fallback response when API fails
      const fallbackPrompt = `Create a structured learning plan for ${userInput}. This is a ${skillLevel} level goal requiring ${dailyMinutes} minutes daily commitment in the ${goalType} category. The plan should include clear daily milestones, progressive skill development, and measurable success criteria. Focus on practical application and consistent progress tracking with achievable daily targets that build toward comprehensive mastery.`;
      
      res.json({
        success: true,
        data: { enhancedPrompt: fallbackPrompt }
      });
    }

  } catch (error) {
    console.error('Enhance prompt error:', error);
    next(error);
  }
});

// POST /api/goals/generate-plan
router.post('/generate-plan', async (req, res, next) => {
  try {
    const { enhancedPrompt, totalDays, skillLevel, dailyMinutes, goalType } = req.body;

    if (!enhancedPrompt || !totalDays || !skillLevel || !dailyMinutes || !goalType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    
    const generateFallbackPlan = () => {
      // Generate a structured fallback plan
      const tasks = [];
      const tasksPerDay = Math.ceil(totalDays / 4); // Distribute tasks across the duration
      
      for (let day = 1; day <= totalDays; day++) {
        const taskTypes = ['study', 'practice', 'build', 'review'];
        const taskType = taskTypes[(day - 1) % 4];
        
        if (day % tasksPerDay === 0 || day === totalDays) {
          tasks.push({
            dayNumber: day,
            title: `${goalType} - Day ${day}: ${taskType === 'study' ? 'Learn' : taskType === 'practice' ? 'Apply' : taskType === 'build' ? 'Create' : 'Review'} Core Concepts`,
            description: `Focus on ${taskType} activities for ${dailyMinutes} minutes to build ${skillLevel.toLowerCase()} level skills in ${goalType.toLowerCase()}`,
            taskType: taskType,
            estimatedMinutes: dailyMinutes
          });
        }
      }

      return {
        title: `${skillLevel} ${goalType} Plan`,
        description: `A structured ${totalDays}-day plan for ${goalType.toLowerCase()} at ${skillLevel.toLowerCase()} level with ${dailyMinutes} minutes daily commitment.`,
        tasks: tasks
      };
    };

    let planData;

    if (geminiApiKey) {
      const prompt = `Create a day-by-day plan for this goal: ${enhancedPrompt}. Total days: ${totalDays}. Return ONLY valid JSON in this exact format: { "title": string, "description": string, "tasks": [{"dayNumber": number, "title": string, "description": string, "taskType": "study|practice|build|review", "estimatedMinutes": number}] } No markdown, no explanation, ONLY the JSON object.`;

      const callGemini = async () => {
        try {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              contents: [{
                role: 'user',
                parts: [{ text: prompt }]
              }],
              generationConfig: {
                maxOutputTokens: 2000,
                temperature: 0.3
              }
            })
          });

          if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
          }

          const data = await response.json();
          return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        } catch (error) {
          console.error('Gemini API call failed:', error);
          throw error;
        }
      };

      try {
        let planText = await callGemini();
        
        try {
          // Clean the response and parse JSON
          planText = planText.replace(/```json/g, '').replace(/```/g, '').trim();
          planData = JSON.parse(planText);
        } catch (parseError) {
          console.error('Initial parse failed, retrying with stricter prompt...');
          // Retry once with stricter prompt
          const strictPrompt = `${prompt} Ensure the response is valid JSON without any markdown formatting.`;
          planText = await callGemini();
          planText = planText.replace(/```json/g, '').replace(/```/g, '').trim();
          planData = JSON.parse(planText);
        }

        // Validate the structure
        if (!planData.title || !planData.tasks || !Array.isArray(planData.tasks)) {
          throw new Error('Invalid plan structure from AI');
        }
      } catch (apiError) {
        console.error('Gemini API failed, using fallback plan:', apiError.message);
        planData = generateFallbackPlan();
      }
    } else {
      planData = generateFallbackPlan();
    }

    // Create the goal
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + totalDays);

    const goal = await Goal.create({
      userId: req.user._id,
      title: planData.title,
      description: planData.description,
      skillLevel,
      dailyMinutes,
      goalType,
      enhancedPrompt,
      totalDays,
      deadline,
      totalTasks: planData.tasks.length
    });

    // Create all tasks
    const tasks = planData.tasks.map(task => ({
      userId: req.user._id,
      title: task.title,
      description: task.description,
      taskType: task.taskType,
      estimatedMinutes: task.estimatedMinutes,
      dayNumber: task.dayNumber,
      goalId: goal._id,
      category: 'Learning',
      priority: 'Medium'
    }));

    const createdTasks = await Task.insertMany(tasks);

    res.json({
      success: true,
      data: {
        goal,
        tasks: createdTasks
      }
    });

  } catch (error) {
    console.error('Generate plan error:', error);
    next(error);
  }
});

// GET /api/goals
router.get('/', async (req, res, next) => {
  try {
    const { status } = req.query;
    let query = { userId: req.user._id };
    
    if (status) {
      query.status = status;
    }

    const goals = await Goal.find(query).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: goals.length,
      data: goals
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/goals/:id
router.get('/:id', async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    const tasks = await Task.find({ goalId: req.params.id }).sort({ dayNumber: 1 });
    
    // Group tasks by dayNumber
    const tasksByDay = {};
    tasks.forEach(task => {
      if (!tasksByDay[task.dayNumber]) {
        tasksByDay[task.dayNumber] = [];
      }
      tasksByDay[task.dayNumber].push(task);
    });

    res.json({
      success: true,
      data: {
        goal,
        tasksByDay
      }
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/goals/:id/stats
router.get('/:id/stats', async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    // Calculate completed tasks
    const completedTasks = await Task.countDocuments({ 
      goalId: req.params.id, 
      status: 'completed' 
    });

    const totalTasks = await Task.countDocuments({ goalId: req.params.id });

    // Calculate weekly progress (last 8 weeks)
    const eightWeeksAgo = new Date();
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

    const weeklyTasks = await Task.aggregate([
      {
        $match: {
          goalId: goal._id,
          completedAt: { $gte: eightWeeksAgo }
        }
      },
      {
        $group: {
          _id: {
            week: { $week: '$completedAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.week': 1 } }
    ]);

    // Calculate average tasks per day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentTasks = await Task.countDocuments({
      goalId: goal._id,
      completedAt: { $gte: sevenDaysAgo }
    });

    const avgTasksPerDay = recentTasks / 7;

    // Calculate ETA
    const remainingTasks = totalTasks - completedTasks;
    const etaDate = avgTasksPerDay > 0 ? 
      new Date(Date.now() + Math.ceil(remainingTasks / avgTasksPerDay) * 24 * 60 * 60 * 1000) :
      goal.deadline;

    // Calculate days behind
    const expectedTasksByNow = Math.floor((Date.now() - goal.createdAt.getTime()) / (24 * 60 * 60 * 1000)) * avgTasksPerDay;
    const daysBehind = Math.max(0, expectedTasksByNow - completedTasks);

    // Calculate streak (consecutive days with completed tasks)
    const streak = await calculateStreak(goal._id);

    res.json({
      success: true,
      data: {
        completionPct: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        streak,
        tasksDone: completedTasks,
        tasksTotal: totalTasks,
        etaDate,
        daysBehind,
        weeklyProgress: weeklyTasks.map(w => w.count)
      }
    });

  } catch (error) {
    next(error);
  }
});

// PUT /api/goals/:id
router.put('/:id', async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    res.json({
      success: true,
      data: goal
    });

  } catch (error) {
    next(error);
  }
});

// PATCH /api/goals/:id/status
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['active', 'paused', 'completed', 'archived'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status },
      { new: true }
    );

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    res.json({
      success: true,
      data: goal
    });

  } catch (error) {
    next(error);
  }
});

// Helper function to calculate streak
async function calculateStreak(goalId) {
  const tasks = await Task.find({
    goalId,
    completedAt: { $exists: true }
  }).sort({ completedAt: 1 });

  if (tasks.length === 0) return 0;

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  // Check backwards from today
  for (let i = tasks.length - 1; i >= 0; i--) {
    const taskDate = new Date(tasks[i].completedAt);
    taskDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((currentDate - taskDate) / (24 * 60 * 60 * 1000));
    
    if (daysDiff === streak) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

module.exports = router;
