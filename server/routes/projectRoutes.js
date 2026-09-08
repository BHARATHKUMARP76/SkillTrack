const express = require('express');
const router = express.Router();
const {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const { protect, student } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(protect, student, getProjects)
  .post(protect, student, createProject);

router
  .route('/:id')
  .put(protect, student, updateProject)
  .delete(protect, student, deleteProject);

module.exports = router;
