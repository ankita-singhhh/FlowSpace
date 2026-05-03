require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Task = require('./models/Task');
const Reminder = require('./models/Reminder');
const Habit = require('./models/Habit');
const connectDB = require('./config/db');

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Task.deleteMany({});
    await Reminder.deleteMany({});
    await Habit.deleteMany({});

    console.log('Data Cleared!');

    // Create Test User
    const testUser = await User.create({
      name: 'Test User',
      email: 'test@flowspace.com',
      password: 'Test1234!', // Note: hook will hash this
    });

    console.log('Test User Created:', testUser.email);

    // Create 5 Sample Tasks
    const tasks = [
      {
        userId: testUser._id,
        title: 'Complete Project Proposal',
        description: 'Draft the initial project proposal for FlowSpace',
        priority: 'High',
        category: 'Work',
        status: 'in-progress',
        dueDate: new Date(Date.now() + 86400000 * 2), // 2 days from now
        tags: ['important', 'project'],
      },
      {
        userId: testUser._id,
        title: 'Buy Groceries',
        description: 'Milk, Eggs, Bread, Vegetables',
        priority: 'Medium',
        category: 'Personal',
        status: 'todo',
        dueDate: new Date(), // Today
      },
      {
        userId: testUser._id,
        title: 'Morning Workout',
        priority: 'High',
        category: 'Health',
        status: 'completed',
        completedAt: new Date(Date.now() - 86400000), // Yesterday
      },
      {
        userId: testUser._id,
        title: 'Review Finances',
        priority: 'Medium',
        category: 'Finance',
        status: 'todo',
      },
      {
        userId: testUser._id,
        title: 'Read Node.js Book',
        priority: 'Low',
        category: 'Learning',
        status: 'in-progress',
      }
    ];

    await Task.insertMany(tasks);
    console.log('Tasks Created!');

    // Create 3 Reminders
    const reminders = [
      {
        userId: testUser._id,
        title: 'Call Mom',
        date: new Date(Date.now() + 86400000), // Tomorrow
        time: '18:00',
        repeat: 'weekly',
      },
      {
        userId: testUser._id,
        title: 'Dentist Appointment',
        date: new Date(Date.now() + 86400000 * 7), // Next week
        time: '10:00',
      },
      {
        userId: testUser._id,
        title: 'Take Vitamins',
        date: new Date(),
        time: '08:00',
        repeat: 'daily',
        done: true,
      }
    ];

    await Reminder.insertMany(reminders);
    console.log('Reminders Created!');

    // Create 2 Habits
    const habits = [
      {
        userId: testUser._id,
        title: 'Drink Water',
        frequency: 'daily',
        streak: 5,
        longestStreak: 12,
        icon: '💧',
        color: '#3498db'
      },
      {
        userId: testUser._id,
        title: 'Read 10 Pages',
        frequency: 'daily',
        streak: 2,
        longestStreak: 5,
        icon: '📚',
        color: '#9b59b6'
      }
    ];

    await Habit.insertMany(habits);
    console.log('Habits Created!');

    console.log('Data Import Success');
    process.exit();
  } catch (error) {
    console.error('Error with data import', error);
    process.exit(1);
  }
};

seedData();
