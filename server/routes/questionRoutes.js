const express = require('express');
const router = express.Router();
const {
  addQuestion,
  getQuestionsByAssessment,
  updateQuestion,
  deleteQuestion,
} = require('../controllers/assessmentController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, admin, addQuestion);
router.get('/:assessmentId', protect, getQuestionsByAssessment);
router.put('/:id', protect, admin, updateQuestion);
router.delete('/:id', protect, admin, deleteQuestion);

module.exports = router;
