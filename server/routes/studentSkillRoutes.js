const express = require('express');
const router = express.Router();
const {
  getStudentSkills,
  addStudentSkill,
  updateStudentSkill,
  deleteStudentSkill,
} = require('../controllers/studentSkillController');
const { protect, student } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(protect, student, getStudentSkills)
  .post(protect, student, addStudentSkill);

router
  .route('/:id')
  .put(protect, student, updateStudentSkill)
  .delete(protect, student, deleteStudentSkill);

module.exports = router;
