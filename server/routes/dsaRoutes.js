const express = require('express');
const router = express.Router();
const {
  getDSATracker,
  addDSATopic,
  updateDSATopic,
  deleteDSATopic,
} = require('../controllers/dsaController');
const { protect, student } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(protect, student, getDSATracker)
  .post(protect, student, addDSATopic);

router
  .route('/:id')
  .put(protect, student, updateDSATopic)
  .delete(protect, student, deleteDSATopic);

module.exports = router;
