const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Skill = require('../models/Skill');
const Assessment = require('../models/Assessment');
const Question = require('../models/Question');
const TestAssignment = require('../models/TestAssignment');
const AssessmentResult = require('../models/AssessmentResult');

describe('One-Time Test Attempt System API Tests', () => {
  let isConnected = false;
  let adminToken = '';
  let studentToken = '';
  let studentId = '';
  let skillId = '';
  let assessmentId = '';
  let questionId = '';

  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skilltrack_test';
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
      isConnected = true;
    } catch (err) {
      console.log('Local MongoDB not running - skipping DB integration tests');
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

  it('1. Setup Admin and Student users', async () => {
    if (!isConnected) return;

    // Register Admin
    const adminRes = await request(app).post('/api/auth/register').send({
      name: 'Test Admin',
      email: 'admin_test@test.com',
      password: 'password123',
      confirmPassword: 'password123',
      role: 'admin',
    });
    expect(adminRes.statusCode).toEqual(201);
    adminToken = adminRes.body.token;

    // Register Student
    const studentRes = await request(app).post('/api/auth/register').send({
      name: 'Test Student One',
      email: 'student_one@test.com',
      password: 'password123',
      confirmPassword: 'password123',
      role: 'student',
    });
    expect(studentRes.statusCode).toEqual(201);
    studentToken = studentRes.body.token;
    studentId = studentRes.body._id;
  }, 30000);

  it('2. Admin creates Skill, Assessment and Question', async () => {
    if (!isConnected) return;

    // Create Skill
    const skillRes = await request(app)
      .post('/api/skills')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Node.js Mastery', category: 'Backend' });
    expect(skillRes.statusCode).toEqual(201);
    skillId = skillRes.body._id;

    // Create Assessment
    const assessRes = await request(app)
      .post('/api/assessments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        skillId,
        title: 'Node.js Core Backend Assessment',
        description: 'Test event loop and express knowledge',
        duration: 20,
      });
    expect(assessRes.statusCode).toEqual(201);
    assessmentId = assessRes.body._id;

    // Add Question
    const qRes = await request(app)
      .post('/api/questions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        assessmentId,
        questionText: 'Which node module is used for HTTP server?',
        options: ['fs', 'http', 'path', 'url'],
        correctAnswer: 'http',
        topic: 'Node Core',
        difficulty: 'Easy',
      });
    expect(qRes.statusCode).toEqual(201);
    questionId = qRes.body._id;
  }, 30000);

  it('3. Admin assigns test to student & rejects duplicate assignment', async () => {
    if (!isConnected) return;

    // Assign test to student
    const assignRes = await request(app)
      .post('/api/assessments/assign')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ studentId, testId: assessmentId });

    expect(assignRes.statusCode).toEqual(201);
    expect(assignRes.body.status).toEqual('assigned');

    // Attempt to assign the same test to the same student again
    const duplicateRes = await request(app)
      .post('/api/assessments/assign')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ studentId, testId: assessmentId });

    expect(duplicateRes.statusCode).toEqual(400);
    expect(duplicateRes.body.message).toContain('already assigned');
  }, 30000);

  it('4. Student checks assigned tests and starts assessment (assigned -> in-progress)', async () => {
    if (!isConnected) return;

    // Student fetches assigned tests
    const myAssignRes = await request(app)
      .get('/api/assessments/my-assignments')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(myAssignRes.statusCode).toEqual(200);
    expect(myAssignRes.body.length).toEqual(1);
    expect(myAssignRes.body[0].status).toEqual('assigned');

    // Student starts assessment
    const startRes = await request(app)
      .post(`/api/assessments/${assessmentId}/start`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(startRes.statusCode).toEqual(200);
    expect(startRes.body.assignment.status).toEqual('in-progress');
  }, 30000);

  it('5. Student submits assessment (in-progress -> completed) and saves score', async () => {
    if (!isConnected) return;

    const answersPayload = {};
    answersPayload[questionId] = 'http';

    const submitRes = await request(app)
      .post(`/api/assessments/${assessmentId}/submit`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ answers: answersPayload });

    expect(submitRes.statusCode).toEqual(201);
    expect(submitRes.body.score).toEqual(100);

    // Verify assignment status is updated in DB
    const assignmentInDb = await TestAssignment.findOne({ studentId, testId: assessmentId });
    expect(assignmentInDb.status).toEqual('completed');
    expect(assignmentInDb.score).toEqual(100);
    expect(assignmentInDb.submittedAt).toBeDefined();
  }, 30000);

  it('6. Re-attempting completed assessment must be rejected by backend API', async () => {
    if (!isConnected) return;

    // 1. Trying to start again
    const startAgainRes = await request(app)
      .post(`/api/assessments/${assessmentId}/start`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(startAgainRes.statusCode).toEqual(400);
    expect(startAgainRes.body.message).toEqual('You have already attempted this test.');

    // 2. Trying to fetch test questions again
    const getAgainRes = await request(app)
      .get(`/api/assessments/${assessmentId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(getAgainRes.statusCode).toEqual(400);
    expect(getAgainRes.body.message).toEqual('You have already attempted this test.');

    // 3. Trying to submit answers directly via API again
    const answersPayload = {};
    answersPayload[questionId] = 'http';

    const submitAgainRes = await request(app)
      .post(`/api/assessments/${assessmentId}/submit`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ answers: answersPayload });

    expect(submitAgainRes.statusCode).toEqual(400);
    expect(submitAgainRes.body.message).toEqual('You have already attempted this test.');
  }, 30000);
});
