const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');

describe('SkillTrack API Tests', () => {
  let isConnected = false;

  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skilltrack_test';
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2500 });
      isConnected = true;
    } catch (err) {
      console.log('Local MongoDB not running - running non-db tests only');
    }
  }, 10000);

  afterAll(async () => {
    if (isConnected) {
      if (mongoose.connection.db) {
        await mongoose.connection.db.dropDatabase();
      }
      await mongoose.connection.close();
    }
  });

  describe('GET /api/health', () => {
    it('should return health check string', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toEqual(200);
      expect(res.text).toContain('SkillTrack API is running');
    });
  });

  describe('Auth Endpoints (DB dependent)', () => {
    it('should register a new student if MongoDB is connected', async () => {
      if (!isConnected) return;
      const res = await request(app).post('/api/auth/register').send({
        name: 'Test Student',
        email: 'student@test.com',
        password: 'password123',
        confirmPassword: 'password123',
        role: 'student',
      });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.role).toEqual('student');
    });

    it('should reject login with wrong password if MongoDB is connected', async () => {
      if (!isConnected) return;
      const res = await request(app).post('/api/auth/login').send({
        email: 'student@test.com',
        password: 'wrongpassword',
      });
      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toEqual('Invalid email or password');
    });
  });
});
