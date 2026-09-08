const mongoose = require('mongoose');

const testAssignmentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
      required: true,
    },
    status: {
      type: String,
      enum: ['assigned', 'in-progress', 'completed'],
      default: 'assigned',
      required: true,
    },
    startedAt: {
      type: Date,
    },
    submittedAt: {
      type: Date,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
  },
  { timestamps: true }
);

// Unique compound index so the same test cannot be assigned to the same student more than once
testAssignmentSchema.index({ studentId: 1, testId: 1 }, { unique: true });

module.exports = mongoose.model('TestAssignment', testAssignmentSchema);
