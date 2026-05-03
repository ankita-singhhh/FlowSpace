const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Habit = require('../models/Habit');
const jwt = require('jsonwebtoken');

describe('Habits Endpoints', () => {
  let token;
  let user;

  beforeEach(async () => {
    user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
    await user.save();
    
    token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'test-secret');
  });

  describe('GET /api/habits', () => {
    it('should get all habits for authenticated user', async () => {
      await Habit.create([
        { title: 'Exercise', user: user._id, frequency: 'daily' },
        { title: 'Read', user: user._id, frequency: 'daily' }
      ]);

      const response = await request(app)
        .get('/api/habits')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should not get habits without authentication', async () => {
      const response = await request(app)
        .get('/api/habits')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/habits', () => {
    it('should create a new habit', async () => {
      const habitData = {
        title: 'Meditation',
        frequency: 'daily',
        color: '#00d4ff',
        icon: '🧘'
      };

      const response = await request(app)
        .post('/api/habits')
        .set('Authorization', `Bearer ${token}`)
        .send(habitData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(habitData.title);
      expect(response.body.data.frequency).toBe(habitData.frequency);
    });

    it('should not create habit without title', async () => {
      const habitData = {
        frequency: 'daily'
      };

      const response = await request(app)
        .post('/api/habits')
        .set('Authorization', `Bearer ${token}`)
        .send(habitData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/habits/:id/check', () => {
    let habit;

    beforeEach(async () => {
      habit = await Habit.create({
        title: 'Exercise',
        user: user._id,
        frequency: 'daily'
      });
    });

    it('should check in a habit', async () => {
      const response = await request(app)
        .patch(`/api/habits/${habit._id}/check`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.checkIns).toHaveLength(1);
    });

    it('should not check in habit of another user', async () => {
      const otherUser = new User({
        name: 'Other User',
        email: 'other@example.com',
        password: 'password123'
      });
      await otherUser.save();

      const otherToken = jwt.sign({ id: otherUser._id }, process.env.JWT_SECRET || 'test-secret');

      const response = await request(app)
        .patch(`/api/habits/${habit._id}/check`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
