const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const quizRoutes = require('../../routes/quizRoutes');
const errorHandler = require('../../middleware/error');
const User = require('../../models/User');
const Subject = require('../../models/Subject');
const Topic = require('../../models/Topic');

const app = express();
app.use(express.json());
app.use('/api/quizzes', quizRoutes);
app.use(errorHandler);

describe('Quiz Controller - Integration Tests', () => {
  let testUser;
  let testSubject;
  let testTopic;
  let authToken;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test_jwt_secret_for_quiz';

    testUser = await User.create({
      name: 'Quiz User',
      email: 'quiz@example.com',
      password: 'password123',
    });

    authToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET);

    testSubject = await Subject.create({
      name: 'Test Subject',
      description: 'A subject for testing',
      exam: new mongoose.Types.ObjectId(),
      user: testUser._id,
    });

    testTopic = await Topic.create({
      name: 'Test Topic',
      description: 'A topic for testing',
      subject: testSubject._id,
      user: testUser._id,
    });
  });

  afterAll(() => {
    delete process.env.JWT_SECRET;
  });

  describe('GET /api/quizzes', () => {
    it('should return empty array when no quizzes exist', async () => {
      const res = await request(app)
        .get('/api/quizzes')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(0);
      expect(res.body.data).toEqual([]);
    });
  });

  describe('GET /api/quizzes/attempts/history', () => {
    it('should return empty array when no attempts exist', async () => {
      const res = await request(app)
        .get('/api/quizzes/attempts/history')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(0);
      expect(res.body.data).toEqual([]);
    });
  });

  describe('GET /api/quizzes/:id', () => {
    it('should return 404 for non-existent quiz', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/quizzes/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Quiz not found');
    });

    it('should return 404 for invalid ObjectId format (CastError)', async () => {
      const res = await request(app)
        .get('/api/quizzes/invalid-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Resource not found');
    });
  });
});
