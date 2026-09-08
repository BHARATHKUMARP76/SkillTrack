const express = require('express');
const router = express.Router();
const { getStudentAssessmentResults } = require('../controllers/assessmentController');
const { protect, student } = require('../middleware/authMiddleware');

router.get('/', protect, student, getStudentAssessmentResults);

module.exports = router;
