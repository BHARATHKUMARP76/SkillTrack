const express = require('express');
const router = express.Router();
const { getRecommendations } = require('../controllers/recommendationController');
const { protect, student } = require('../middleware/authMiddleware');

router.get('/', protect, student, getRecommendations);

module.exports = router;
