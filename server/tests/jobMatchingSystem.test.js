const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Skill = require('../models/Skill');
const Job = require('../models/Job');
const JobSkill = require('../models/JobSkill');
const StudentSkill = require('../models/StudentSkill');

describe('Job Matching System Integration Tests', () => {
  let isConnected = false;
  let adminToken = '';
  let studentToken = '';
  let studentId = '';

  let reactSkillId = '';
  let nodeSkillId = '';
  let mongoSkillId = '';

  let activeJobId = '';
  let inactiveJobId = '';

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

  it('1. Setup Admin, Student and Master Skills', async () => {
    if (!isConnected) return;

    // Register Admin
    const adminRes = await request(app).post('/api/auth/register').send({
      name: 'Job Admin',
      email: 'job_admin@test.com',
      password: 'password123',
      confirmPassword: 'password123',
      role: 'admin',
    });
    expect(adminRes.statusCode).toEqual(201);
    adminToken = adminRes.body.token;

    // Register Student
    const studentRes = await request(app).post('/api/auth/register').send({
      name: 'Job Matching Student',
      email: 'job_student@test.com',
      password: 'password123',
      confirmPassword: 'password123',
      role: 'student',
    });
    expect(studentRes.statusCode).toEqual(201);
    studentToken = studentRes.body.token;
    studentId = studentRes.body._id;

    // Create Master Skills
    const sk1 = await request(app)
      .post('/api/skills')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'React', category: 'Frontend' });
    reactSkillId = sk1.body._id;

    const sk2 = await request(app)
      .post('/api/skills')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Node.js', category: 'Backend' });
    nodeSkillId = sk2.body._id;

    const sk3 = await request(app)
      .post('/api/skills')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'MongoDB', category: 'Database' });
    mongoSkillId = sk3.body._id;
  }, 30000);

  it('2. Admin creates Active Job and Inactive Job', async () => {
    if (!isConnected) return;

    // Create Active Job
    const activeRes = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Full Stack Engineer',
        company: 'Tech Solutions Inc',
        description: 'MERN stack position',
        location: 'Bangalore',
        employmentType: 'Full-time',
        status: 'active',
      });
    expect(activeRes.statusCode).toEqual(201);
    activeJobId = activeRes.body._id;

    // Assign skills to active job
    await request(app)
      .post(`/api/jobs/${activeJobId}/skills`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ skillId: reactSkillId, requiredLevel: 'Advanced' });

    await request(app)
      .post(`/api/jobs/${activeJobId}/skills`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ skillId: nodeSkillId, requiredLevel: 'Intermediate' });

    await request(app)
      .post(`/api/jobs/${activeJobId}/skills`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ skillId: mongoSkillId, requiredLevel: 'Intermediate' });

    // Create Inactive Job
    const inactiveRes = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Archived Position',
        company: 'Old Corp',
        description: 'Closed opening',
        status: 'inactive',
      });
    expect(inactiveRes.statusCode).toEqual(201);
    inactiveJobId = inactiveRes.body._id;
  }, 30000);

  it('3. Student matching excludes inactive jobs and evaluates skill matches & levels', async () => {
    if (!isConnected) return;

    // Student has React at Intermediate (level gap vs Advanced) and Node.js at Intermediate (exact match)
    await request(app)
      .post('/api/student-skills')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ skillId: reactSkillId, currentLevel: 'Intermediate', targetLevel: 'Advanced', progress: 50 });

    await request(app)
      .post('/api/student-skills')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ skillId: nodeSkillId, currentLevel: 'Intermediate', targetLevel: 'Advanced', progress: 60 });

    const matchesRes = await request(app)
      .get('/api/jobs/matches')
      .set('Authorization', `Bearer ${studentToken}`);

    if (matchesRes.statusCode !== 200) {
      console.log('500 ERROR BODY:', matchesRes.body);
    }

    expect(matchesRes.statusCode).toEqual(200);

    // Inactive job must NOT be present
    const inactiveJobFound = matchesRes.body.find((m) => m.job._id === inactiveJobId.toString());
    expect(inactiveJobFound).toBeUndefined();

    // Active job must be present
    const activeMatch = matchesRes.body.find((m) => m.job._id === activeJobId.toString());
    expect(activeMatch).toBeDefined();

    // Node.js is matchedSkills (1.0), React is skillsToImprove (0.5), MongoDB is missingSkills (0)
    // Earned = 1.5 out of 3 = 50%
    expect(activeMatch.matchPercentage).toEqual(50);
    expect(activeMatch.matchedCount).toEqual(1);
    expect(activeMatch.toImproveCount).toEqual(1);
    expect(activeMatch.missingCount).toEqual(1);
    expect(activeMatch.recommendedLearning.length).toEqual(2);
  }, 30000);
});
