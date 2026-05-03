const express = require('express');
const Habit = require('../models/Habit');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// @route   GET /api/habits
router.get('/', async (req, res, next) => {
  try {
    const habits = await Habit.find({ userId: req.user._id });
    res.json({ success: true, count: habits.length, data: habits });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/habits
router.post('/', async (req, res, next) => {
  try {
    const habitData = { ...req.body, userId: req.user._id };
    const habit = await Habit.create(habitData);
    res.status(201).json({ success: true, data: habit });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/habits/:id
router.put('/:id', async (req, res, next) => {
  try {
    let habit = await Habit.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!habit) {
      return res.status(404).json({ success: false, message: 'Habit not found' });
    }

    habit = await Habit.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, data: habit });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/habits/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const habit = await Habit.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    
    if (!habit) {
      return res.status(404).json({ success: false, message: 'Habit not found' });
    }

    res.json({ success: true, message: 'Habit deleted' });
  } catch (error) {
    next(error);
  }
});

// @route   PATCH /api/habits/:id/check
// @desc    Mark done for today (updates streak)
router.patch('/:id/check', async (req, res, next) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!habit) {
      return res.status(404).json({ success: false, message: 'Habit not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const alreadyCompleted = habit.completedDates.some(date => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });

    if (alreadyCompleted) {
      return res.status(400).json({ success: false, message: 'Habit already checked for today' });
    }

    habit.completedDates.push(new Date());

    // Simple streak calculation (assuming daily for this example)
    // For a real app, this logic would be more complex to handle weekly/daily gaps correctly
    habit.streak += 1;
    if (habit.streak > habit.longestStreak) {
      habit.longestStreak = habit.streak;
    }

    await habit.save();

    res.json({ success: true, data: habit });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/habits/:id/history
router.get('/:id/history', async (req, res, next) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!habit) {
      return res.status(404).json({ success: false, message: 'Habit not found' });
    }

    res.json({ success: true, data: habit.completedDates });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
