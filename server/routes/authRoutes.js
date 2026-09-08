const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  getStudents,
  getAdminStats,
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.get('/students', protect, admin, getStudents);
router.get('/admin-stats', protect, admin, getAdminStats);

module.exports = router;
