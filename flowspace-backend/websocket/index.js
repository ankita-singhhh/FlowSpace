const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Reminder = require('../models/Reminder');
const Task = require('../models/Task');

class WebSocketServer {
  constructor() {
    this.wss = null;
    this.clients = new Map(); // userId -> WebSocket connection
  }

  initialize(server) {
    this.wss = new WebSocket.Server({ 
      server,
      path: '/ws'
    });

    this.wss.on('connection', this.handleConnection.bind(this));
    
    // Start reminder checking interval
    this.startReminderChecker();
    
    console.log('WebSocket server initialized');
  }

  handleConnection(ws, req) {
    console.log('New WebSocket connection established');
    
    // Extract user ID from query parameters
    const urlParams = new URLSearchParams(req.url.split('?')[1]);
    const userId = urlParams.get('userId');
    
    if (!userId) {
      console.log('Connection rejected: No user ID provided');
      ws.close(1008, 'User ID required');
      return;
    }

    // Store client connection
    this.clients.set(userId, ws);
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        this.handleMessage(userId, message);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });

    ws.on('close', () => {
      console.log(`Client disconnected: ${userId}`);
      this.clients.delete(userId);
    });

    ws.on('error', (error) => {
      console.error(`WebSocket error for user ${userId}:`, error);
      this.clients.delete(userId);
    });

    // Send welcome message
    this.sendToClient(userId, {
      type: 'connected',
      message: 'Real-time connection established',
      timestamp: new Date().toISOString()
    });
  }

  handleMessage(userId, message) {
    switch (message.type) {
      case 'connect':
        console.log(`Client ${userId} connected`);
        break;
      
      case 'pong':
        // Client responded to ping
        break;
      
      case 'reminder_update':
        this.broadcastToOtherUsers(userId, {
          type: 'reminder_updated',
          reminder: message.reminder,
          timestamp: new Date().toISOString()
        });
        break;
      
      case 'reminder_delete':
        this.broadcastToOtherUsers(userId, {
          type: 'reminder_deleted',
          reminderId: message.reminderId,
          timestamp: new Date().toISOString()
        });
        break;
      
      default:
        console.log(`Unknown message type: ${message.type}`);
    }
  }

  sendToClient(userId, message) {
    const client = this.clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }

  broadcastToOtherUsers(excludeUserId, message) {
    this.clients.forEach((client, userId) => {
      if (userId !== excludeUserId && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  async startReminderChecker() {
    // Check for due reminders every 30 seconds
    setInterval(async () => {
      await this.checkDueReminders();
    }, 30000);

    // Send ping to all clients every 30 seconds to keep connections alive
    setInterval(() => {
      this.pingAllClients();
    }, 30000);
  }

  async checkDueReminders() {
    try {
      const now = new Date();
      const dueReminders = await Reminder.find({
        status: { $ne: 'done' },
        notificationSent: false,
        $or: [
          { date: { $lt: now.toISOString().split('T')[0] } },
          { 
            date: now.toISOString().split('T')[0],
            time: { $lte: now.toTimeString().slice(0, 5) }
          }
        ]
      }).populate('userId');

      for (const reminder of dueReminders) {
        // Send real-time notification
        this.sendToClient(reminder.userId._id.toString(), {
          type: 'reminder_due',
          reminder: {
            id: reminder._id,
            title: reminder.title,
            description: reminder.description,
            time: reminder.time,
            date: reminder.date
          },
          timestamp: new Date().toISOString()
        });

        // Mark notification as sent
        await Reminder.findByIdAndUpdate(reminder._id, {
          notificationSent: true
        });

        // Handle recurring reminders
        if (reminder.repeat !== 'once') {
          await this.createNextOccurrence(reminder);
        }
      }
    } catch (error) {
      console.error('Error checking due reminders:', error);
    }
  }

  async createNextOccurrence(reminder) {
    try {
      const nextDate = new Date(reminder.date);
      const [hours, minutes] = reminder.time.split(':').map(Number);

      switch (reminder.repeat) {
        case 'daily':
          nextDate.setDate(nextDate.getDate() + 1);
          break;
        case 'weekly':
          nextDate.setDate(nextDate.getDate() + 7);
          break;
        case 'monthly':
          nextDate.setMonth(nextDate.getMonth() + 1);
          break;
        default:
          return;
      }

      // Create next occurrence
      const newReminder = new Reminder({
        userId: reminder.userId,
        title: reminder.title,
        description: reminder.description,
        date: nextDate.toISOString().split('T')[0],
        time: reminder.time,
        color: reminder.color,
        repeat: reminder.repeat,
        weekDays: reminder.weekDays,
        monthlyDay: reminder.monthlyDay,
        repeatEndDate: reminder.repeatEndDate,
        linkedTask: reminder.linkedTask,
        status: 'pending',
        notificationSent: false
      });

      await newReminder.save();
    } catch (error) {
      console.error('Error creating next occurrence:', error);
    }
  }

  pingAllClients() {
    this.clients.forEach((client, userId) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'ping',
          timestamp: new Date().toISOString()
        }));
      }
    });
  }

  // Methods to be called from API routes
  notifyReminderUpdate(userId, reminder) {
    this.broadcastToOtherUsers(userId, {
      type: 'reminder_updated',
      reminder,
      timestamp: new Date().toISOString()
    });
  }

  notifyReminderDelete(userId, reminderId) {
    this.broadcastToOtherUsers(userId, {
      type: 'reminder_deleted',
      reminderId,
      timestamp: new Date().toISOString()
    });
  }

  notifyTaskUpdate(userId, task) {
    this.broadcastToOtherUsers(userId, {
      type: 'task_updated',
      task,
      timestamp: new Date().toISOString()
    });
  }

  notifyTaskDelete(userId, taskId) {
    this.broadcastToOtherUsers(userId, {
      type: 'task_deleted',
      taskId,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = WebSocketServer;
