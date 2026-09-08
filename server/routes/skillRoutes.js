const express = require('express');
const router = express.Router();
const {
  getSkills,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill,
} = require('../controllers/skillController');
const { protect, admin } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(protect, getSkills)
  .post(protect, admin, createSkill);

router
  .route('/:id')
  .get(protect, getSkillById)
  .put(protect, admin, updateSkill)
  .delete(protect, admin, deleteSkill);

module.exports = router;
