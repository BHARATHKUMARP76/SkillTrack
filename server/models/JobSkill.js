const mongoose = require('mongoose');

const jobSkillSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    skillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: true,
    },
    requiredLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Intermediate',
    },
    importance: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'High',
    },
  },
  { timestamps: true }
);

jobSkillSchema.index({ jobId: 1, skillId: 1 }, { unique: true });

module.exports = mongoose.model('JobSkill', jobSkillSchema);
