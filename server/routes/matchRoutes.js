const express = require('express');
const router = express.Router();
const { getJobMatches } = require('../controllers/matchController');
const { protect, student } = require('../middleware/authMiddleware');

router.get('/matches', protect, student, getJobMatches);

module.exports = router;
