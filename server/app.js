const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).send('SkillTrack API is running');
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/skills', require('./routes/skillRoutes'));
app.use('/api/student-skills', require('./routes/studentSkillRoutes'));
app.use('/api/assessments', require('./routes/assessmentRoutes'));
app.use('/api/questions', require('./routes/questionRoutes'));
app.use('/api/assessment-results', require('./routes/assessmentResultRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/dsa', require('./routes/dsaRoutes'));
app.use('/api/jobs', require('./routes/matchRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/readiness', require('./routes/readinessRoutes'));
app.use('/api/recommendations', require('./routes/recommendationRoutes'));

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app;
