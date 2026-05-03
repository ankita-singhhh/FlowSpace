const express = require('express');
const PlannerSlot = require('../models/PlannerSlot');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// @route   GET /api/planner
// @desc    Get planner slots for a specific week
router.get('/', async (req, res, next) => {
  try {
    const { weekStart } = req.query; // Expecting YYYY-MM-DD
    
    if (!weekStart) {
      return res.status(400).json({ success: false, message: 'weekStart query parameter is required' });
    }

    const weekStartDate = new Date(weekStart);
    weekStartDate.setHours(0, 0, 0, 0);

    const slots = await PlannerSlot.find({ 
      userId: req.user._id,
      weekStartDate: weekStartDate
    }).populate('taskId', 'title priority status');

    res.json({ success: true, count: slots.length, data: slots });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/planner
// @desc    Add a task to a slot
router.post('/', async (req, res, next) => {
  try {
    const { weekStartDate, dayIndex, slot, taskId, customNote, timeFrom, timeTo } = req.body;
    
    const parsedDate = new Date(weekStartDate);
    parsedDate.setHours(0, 0, 0, 0);

    const newSlot = await PlannerSlot.create({
      userId: req.user._id,
      weekStartDate: parsedDate,
      dayIndex,
      slot,
      taskId,
      customNote,
      timeFrom,
      timeTo
    });

    res.status(201).json({ success: true, data: newSlot });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/planner/:id
// @desc    Update a slot
router.put('/:id', async (req, res, next) => {
  try {
    let plannerSlot = await PlannerSlot.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!plannerSlot) {
      return res.status(404).json({ success: false, message: 'Planner slot not found' });
    }

    plannerSlot = await PlannerSlot.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, data: plannerSlot });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/planner/:id
// @desc    Remove a slot
router.delete('/:id', async (req, res, next) => {
  try {
    const plannerSlot = await PlannerSlot.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    
    if (!plannerSlot) {
      return res.status(404).json({ success: false, message: 'Planner slot not found' });
    }

    res.json({ success: true, message: 'Planner slot deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
