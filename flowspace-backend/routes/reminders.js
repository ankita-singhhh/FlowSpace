const express = require('express');
const { ObjectId } = require('mongodb');
const Reminder = require('../models/Reminder');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// @route   GET /api/reminders
router.get('/', async (req, res, next) => {
  try {
    const { done, upcoming } = req.query;
    let query = { userId: req.user._id };

    if (done !== undefined) {
      query.done = done === 'true';
    }

    if (upcoming === 'true') {
      const now = new Date();
      query.date = { $gte: now };
      query.done = false;
    }

    const reminders = await Reminder.find(query).sort({ date: 1, time: 1 });
    res.json({ success: true, count: reminders.length, data: reminders });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/reminders
router.post('/', async (req, res, next) => {
  try {
    const reminderData = { ...req.body, userId: req.user._id };
    const reminder = await Reminder.create(reminderData);
    
    // Notify other users of new reminder
    try {
      if (req.app && req.app.wsServer) {
        req.app.wsServer.notifyReminderUpdate(req.user._id, reminder);
      }
    } catch (error) {
      console.error('WebSocket notification error:', error);
    }
    
    res.status(201).json({ success: true, data: reminder });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/reminders/:id
router.put('/:id', async (req, res, next) => {
  try {
    // Convert string ID to ObjectId
    let reminderId;
    try {
      reminderId = new ObjectId(req.params.id);
    } catch (error) {
      return res.status(400).json({ success: false, message: 'Invalid reminder ID format' });
    }
    
    const reminder = await Reminder.findOne({ _id: reminderId, userId: req.user._id });
    
    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    reminder = await Reminder.findByIdAndUpdate(reminderId, req.body, {
      new: true,
      runValidators: true
    });

    // Notify other users of reminder update
    try {
      if (req.app && req.app.wsServer) {
        req.app.wsServer.notifyReminderUpdate(req.user._id, reminder);
      }
    } catch (error) {
      console.error('WebSocket notification error:', error);
    }

    res.json({ success: true, data: reminder });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/reminders/:id
router.delete('/:id', async (req, res, next) => {
  try {
    // Convert string ID to ObjectId
    let reminderId;
    try {
      reminderId = new ObjectId(req.params.id);
    } catch (error) {
      return res.status(400).json({ success: false, message: 'Invalid reminder ID format' });
    }
    
    const reminder = await Reminder.findOneAndDelete({ _id: reminderId, userId: req.user._id });
    
    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    // Notify other users of reminder deletion
    try {
      if (req.app && req.app.wsServer) {
        req.app.wsServer.notifyReminderDelete(req.user._id, req.params.id);
      }
    } catch (error) {
      console.error('WebSocket notification error:', error);
    }

    res.json({ success: true, message: 'Reminder deleted' });
  } catch (error) {
    next(error);
  }
});

// @route   PATCH /api/reminders/:id/snooze
router.patch('/:id/snooze', async (req, res, next) => {
  try {
    const { duration } = req.body; // "1h" or "1d"
    
    // Convert string ID to ObjectId
    let reminderId;
    try {
      reminderId = new ObjectId(req.params.id);
    } catch (error) {
      return res.status(400).json({ success: false, message: 'Invalid reminder ID format' });
    }
    
    const reminder = await Reminder.findOne({ _id: reminderId, userId: req.user._id });
    
    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    const snoozeDate = new Date();
    if (duration === '1h') {
      snoozeDate.setHours(snoozeDate.getHours() + 1);
    } else if (duration === '1d') {
      snoozeDate.setDate(snoozeDate.getDate() + 1);
    } else {
      return res.status(400).json({ success: false, message: 'Invalid snooze duration' });
    }

    reminder.snoozedUntil = snoozeDate;
    await reminder.save();

    res.json({ success: true, data: reminder });
  } catch (error) {
    next(error);
  }
});

// @route   PATCH /api/reminders/:id/done
router.patch('/:id/done', async (req, res, next) => {
  try {
    const reminder = await Reminder.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    reminder.done = !reminder.done;
    await reminder.save();

    res.json({ success: true, data: reminder });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
