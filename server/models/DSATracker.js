const mongoose = require('mongoose');

const dsaTrackerSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    topic: {
      type: String,
      required: [true, 'DSA topic is required'],
      trim: true,
    },
    totalProblems: {
      type: Number,
      required: [true, 'Total problems count is required'],
      min: [1, 'Total problems must be greater than 0'],
    },
    solvedProblems: {
      type: Number,
      required: [true, 'Solved problems count is required'],
      min: [0, 'Solved problems cannot be negative'],
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

dsaTrackerSchema.pre('validate', function (next) {
  if (this.solvedProblems > this.totalProblems) {
    this.invalidate('solvedProblems', 'Solved problems cannot exceed total problems');
  }
  next();
});

dsaTrackerSchema.index({ studentId: 1, topic: 1 }, { unique: true });

module.exports = mongoose.model('DSATracker', dsaTrackerSchema);
