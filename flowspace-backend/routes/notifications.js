const express = require('express');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// @route   GET /api/notifications
// @desc    Get user notifications
router.get('/', async (req, res, next) => {
  try {
    // For now, return empty notifications for new users
    // In a real app, this would fetch from a notifications collection
    const notifications = [];
    
    res.json(notifications);
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/notifications
// @desc    Create a notification (for system use)
router.post('/', async (req, res, next) => {
  try {
    const { title, message, type, action } = req.body;
    
    const notification = {
      id: Date.now(),
      title,
      message,
      type: type || 'info',
      timestamp: new Date(),
      read: false,
      action: action || null,
      userId: req.user._id
    };
    
    // In a real app, this would save to database
    // For now, just return the created notification
    
    res.status(201).json(notification);
  } catch (error) {
    next(error);
  }
});

// @route   PATCH /api/notifications/:id/read
// @desc    Mark notification as read
router.patch('/:id/read', async (req, res, next) => {
  try {
    // In a real app, this would update the notification in database
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete a notification
router.delete('/:id', async (req, res, next) => {
  try {
    // In a real app, this would delete from database
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
