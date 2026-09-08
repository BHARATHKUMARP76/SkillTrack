const DSATracker = require('../models/DSATracker');

// @desc Get student DSA topic progress
// @route GET /api/dsa
// @access Private/Student
const getDSATracker = async (req, res) => {
  try {
    const dsaEntries = await DSATracker.find({ studentId: req.user._id }).sort({ topic: 1 });
    res.json(dsaEntries);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching DSA progress' });
  }
};

// @desc Add or update DSA topic progress
// @route POST /api/dsa
// @access Private/Student
const addDSATopic = async (req, res) => {
  try {
    const { topic, totalProblems, solvedProblems } = req.body;

    if (!topic || totalProblems === undefined || solvedProblems === undefined) {
      return res.status(400).json({ message: 'Topic, total problems, and solved problems are required' });
    }

    const total = Number(totalProblems);
    const solved = Number(solvedProblems);

    if (isNaN(total) || isNaN(solved)) {
      return res.status(400).json({ message: 'Total and solved problems must be numbers' });
    }

    if (solved < 0) {
      return res.status(400).json({ message: 'Solved problems cannot be negative' });
    }

    if (total <= 0) {
      return res.status(400).json({ message: 'Total problems must be greater than 0' });
    }

    if (solved > total) {
      return res.status(400).json({ message: 'Solved problems cannot exceed total problems' });
    }

    const existingEntry = await DSATracker.findOne({
      studentId: req.user._id,
      topic: { $regex: new RegExp(`^${topic.trim()}$`, 'i') },
    });

    if (existingEntry) {
      return res.status(400).json({ message: `Progress for topic "${topic}" is already being tracked. Please update the existing entry.` });
    }

    const dsaEntry = await DSATracker.create({
      studentId: req.user._id,
      topic: topic.trim(),
      totalProblems: total,
      solvedProblems: solved,
      lastUpdated: new Date(),
    });

    res.status(201).json(dsaEntry);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error adding DSA topic' });
  }
};

// @desc Update DSA topic progress
// @route PUT /api/dsa/:id
// @access Private/Student
const updateDSATopic = async (req, res) => {
  try {
    const { totalProblems, solvedProblems } = req.body;

    const dsaEntry = await DSATracker.findOne({ _id: req.params.id, studentId: req.user._id });

    if (!dsaEntry) {
      return res.status(404).json({ message: 'DSA tracker entry not found' });
    }

    const total = totalProblems !== undefined ? Number(totalProblems) : dsaEntry.totalProblems;
    const solved = solvedProblems !== undefined ? Number(solvedProblems) : dsaEntry.solvedProblems;

    if (isNaN(total) || isNaN(solved)) {
      return res.status(400).json({ message: 'Total and solved problems must be numbers' });
    }

    if (solved < 0) {
      return res.status(400).json({ message: 'Solved problems cannot be negative' });
    }

    if (total <= 0) {
      return res.status(400).json({ message: 'Total problems must be greater than 0' });
    }

    if (solved > total) {
      return res.status(400).json({ message: 'Solved problems cannot exceed total problems' });
    }

    dsaEntry.totalProblems = total;
    dsaEntry.solvedProblems = solved;
    dsaEntry.lastUpdated = new Date();

    const updated = await dsaEntry.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating DSA topic' });
  }
};

// @desc Delete DSA topic entry
// @route DELETE /api/dsa/:id
// @access Private/Student
const deleteDSATopic = async (req, res) => {
  try {
    const dsaEntry = await DSATracker.findOne({ _id: req.params.id, studentId: req.user._id });

    if (!dsaEntry) {
      return res.status(404).json({ message: 'DSA tracker entry not found' });
    }

    await dsaEntry.deleteOne();
    res.json({ message: 'DSA topic removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error deleting DSA topic' });
  }
};

module.exports = {
  getDSATracker,
  addDSATopic,
  updateDSATopic,
  deleteDSATopic,
};
