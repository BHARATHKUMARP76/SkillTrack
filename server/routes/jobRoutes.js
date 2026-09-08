const express = require('express');
const router = express.Router();
const {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  assignJobSkill,
  removeJobSkill,
} = require('../controllers/jobController');
const { protect, admin } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(protect, getJobs)
  .post(protect, admin, createJob);

router
  .route('/:id')
  .get(protect, getJobById)
  .put(protect, admin, updateJob)
  .delete(protect, admin, deleteJob);

router.post('/:id/skills', protect, admin, assignJobSkill);
router.delete('/:id/skills/:skillId', protect, admin, removeJobSkill);

module.exports = router;
