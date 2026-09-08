const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');

describe('Student Profile Flow API Tests', () => {
  let isConnected = false;
  let studentToken = '';
  let studentId = '';

  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skilltrack_test';
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
      isConnected = true;
    } catch (err) {
      console.log('Local MongoDB not running - skipping DB tests');
    }
  }, 15000);

  afterAll(async () => {
    if (isConnected) {
      if (mongoose.connection.db) {
        await mongoose.connection.db.dropDatabase();
      }
      await mongoose.connection.close();
    }
  });

  it('1. Student registration sets profileCompleted to false by default', async () => {
    if (!isConnected) return;

    const res = await request(app).post('/api/auth/register').send({
      name: 'Profile Flow Student',
      email: 'profile_flow_student@test.com',
      password: 'password123',
      confirmPassword: 'password123',
      role: 'student',
    });

    expect(res.statusCode).toEqual(201);
    expect(res.body.profileCompleted).toEqual(false);
    studentToken = res.body.token;
    studentId = res.body._id;

    const userInDb = await User.findById(studentId);
    expect(userInDb.profileCompleted).toEqual(false);
  }, 30000);

  it('2. Login returns profileCompleted = false for first-time student', async () => {
    if (!isConnected) return;

    const res = await request(app).post('/api/auth/login').send({
      email: 'profile_flow_student@test.com',
      password: 'password123',
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.profileCompleted).toEqual(false);
  }, 30000);

  it('3. Saving profile updates MongoDB and sets profileCompleted to true', async () => {
    if (!isConnected) return;

    const res = await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        name: 'Profile Flow Student Updated',
        college: 'State Engineering College',
        department: 'Information Technology',
        graduationYear: '2026',
        phone: '+91 9999999999',
        bio: 'Passionate full stack developer and DSA enthusiast.',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.userId.profileCompleted).toEqual(true);
    expect(res.body.college).toEqual('State Engineering College');

    const userInDb = await User.findById(studentId);
    expect(userInDb.profileCompleted).toEqual(true);
  }, 30000);

  it('4. GET /api/auth/me returns profileCompleted = true for completed student', async () => {
    if (!isConnected) return;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.profileCompleted).toEqual(true);
  }, 30000);

  it('5. Updating profile again retains profileCompleted = true', async () => {
    if (!isConnected) return;

    const res = await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        college: 'State Engineering College (Main Campus)',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.userId.profileCompleted).toEqual(true);
    expect(res.body.college).toEqual('State Engineering College (Main Campus)');

    const userInDb = await User.findById(studentId);
    expect(userInDb.profileCompleted).toEqual(true);
  }, 30000);
});
