const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/profileController');
const { protect, student } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(protect, student, getProfile)
  .put(protect, student, updateProfile);

module.exports = router;
