const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Task = require('../models/Task');
const jwt = require('jsonwebtoken');

describe('Tasks Endpoints', () => {
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

  describe('GET /api/tasks', () => {
    it('should get all tasks for authenticated user', async () => {
      // Create test tasks
      await Task.create([
        { title: 'Task 1', user: user._id },
        { title: 'Task 2', user: user._id },
        { title: 'Task 3', user: user._id }
      ]);

      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.data[0].title).toBe('Task 1');
    });

    it('should not get tasks without authentication', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const taskData = {
        title: 'New Task',
        description: 'Task description',
        priority: 'High',
        category: 'Work'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(taskData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(taskData.title);
      expect(response.body.data.description).toBe(taskData.description);
      expect(response.body.data.priority).toBe(taskData.priority);
      expect(response.body.data.category).toBe(taskData.category);
    });

    it('should not create task without title', async () => {
      const taskData = {
        description: 'Task description',
        priority: 'High'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(taskData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should not create task without authentication', async () => {
      const taskData = {
        title: 'New Task',
        description: 'Task description'
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(taskData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    let task;

    beforeEach(async () => {
      task = await Task.create({
        title: 'Original Task',
        user: user._id
      });
    });

    it('should update a task', async () => {
      const updateData = {
        title: 'Updated Task',
        status: 'completed'
      };

      const response = await request(app)
        .put(`/api/tasks/${task._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updateData.title);
      expect(response.body.data.status).toBe(updateData.status);
    });

    it('should not update task of another user', async () => {
      const otherUser = new User({
        name: 'Other User',
        email: 'other@example.com',
        password: 'password123'
      });
      await otherUser.save();

      const otherToken = jwt.sign({ id: otherUser._id }, process.env.JWT_SECRET || 'test-secret');

      const response = await request(app)
        .put(`/api/tasks/${task._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ title: 'Updated Task' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should not update non-existent task', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .put(`/api/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated Task' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    let task;

    beforeEach(async () => {
      task = await Task.create({
        title: 'Task to Delete',
        user: user._id
      });
    });

    it('should delete a task', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${task._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      
      // Verify task is deleted
      const deletedTask = await Task.findById(task._id);
      expect(deletedTask).toBeNull();
    });

    it('should not delete task of another user', async () => {
      const otherUser = new User({
        name: 'Other User',
        email: 'other@example.com',
        password: 'password123'
      });
      await otherUser.save();

      const otherToken = jwt.sign({ id: otherUser._id }, process.env.JWT_SECRET || 'test-secret');

      const response = await request(app)
        .delete(`/api/tasks/${task._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should not delete non-existent task', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .delete(`/api/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/tasks/:id/status', () => {
    let task;

    beforeEach(async () => {
      task = await Task.create({
        title: 'Task for Status Update',
        status: 'todo',
        user: user._id
      });
    });

    it('should update task status', async () => {
      const response = await request(app)
        .patch(`/api/tasks/${task._id}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'completed' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('completed');
    });

    it('should not update status with invalid status', async () => {
      const response = await request(app)
        .patch(`/api/tasks/${task._id}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'invalid' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
