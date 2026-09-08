const express = require('express');
const router = express.Router();
const {
  getAssessments,
  getAssessmentById,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  assignTest,
  getAssignments,
  getStudentAssignedTests,
  startAssessment,
  submitAssessment,
} = require('../controllers/assessmentController');
const { protect, admin, student } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(protect, getAssessments)
  .post(protect, admin, createAssessment);

router.post('/assign', protect, admin, assignTest);
router.get('/assignments', protect, admin, getAssignments);
router.get('/my-assignments', protect, student, getStudentAssignedTests);
router.post('/:id/start', protect, student, startAssessment);

router
  .route('/:id')
  .get(protect, getAssessmentById)
  .put(protect, admin, updateAssessment)
  .delete(protect, admin, deleteAssessment);

router.post('/:id/submit', protect, student, submitAssessment);

module.exports = router;

