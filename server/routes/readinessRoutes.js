const express = require('express');
const router = express.Router();
const { getPlacementReadiness } = require('../controllers/readinessController');
const { protect, student } = require('../middleware/authMiddleware');

router.get('/', protect, student, getPlacementReadiness);

module.exports = router;
