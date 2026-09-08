const Skill = require('../models/Skill');
const StudentSkill = require('../models/StudentSkill');
const JobSkill = require('../models/JobSkill');
const Assessment = require('../models/Assessment');
const AssessmentResult = require('../models/AssessmentResult');

const levelTargetValues = { Beginner: 25, Intermediate: 50, Advanced: 75, Expert: 100 };

// @desc Generate learning recommendations for next skill to improve
// @route GET /api/recommendations
// @access Private/Student
const getRecommendations = async (req, res) => {
  try {
    const studentId = req.user._id;

    // 1. Fetch student's tracked skills
    const studentSkills = await StudentSkill.find({ studentId }).populate('skillId');
    const studentSkillMap = {};
    studentSkills.forEach((sk) => {
      if (sk.skillId) {
        studentSkillMap[sk.skillId._id.toString()] = sk;
      }
    });

    // 2. Fetch all master skills
    const allSkills = await Skill.find();
    if (allSkills.length === 0) {
      return res.json({
        hasRecommendations: false,
        message: 'Complete more assessments and add job requirements to receive personalized recommendations.',
        recommendations: [],
      });
    }

    // 3. Fetch Job Demands for each skill
    const jobSkills = await JobSkill.find().populate('skillId');
    const jobDemandMap = {};
    jobSkills.forEach((js) => {
      if (js.skillId) {
        const idStr = js.skillId._id.toString();
        jobDemandMap[idStr] = (jobDemandMap[idStr] || 0) + 1;
      }
    });

    // 4. Fetch Assessment Results for weakness calculation
    const assessmentResults = await AssessmentResult.find({ studentId }).populate({
      path: 'assessmentId',
      select: 'skillId title',
    });

    const skillAssessmentScores = {};
    assessmentResults.forEach((ar) => {
      if (ar.assessmentId && ar.assessmentId.skillId) {
        const skillIdStr = ar.assessmentId.skillId.toString();
        // Keep highest or latest score
        if (
          skillAssessmentScores[skillIdStr] === undefined ||
          ar.score < skillAssessmentScores[skillIdStr]
        ) {
          skillAssessmentScores[skillIdStr] = ar.score;
        }
      }
    });

    // 5. Calculate Priority Score for each candidate skill
    const candidates = [];

    allSkills.forEach((skill) => {
      const skillIdStr = skill._id.toString();
      const studentEntry = studentSkillMap[skillIdStr];

      let skillGap = 0;
      let isMissing = false;

      if (studentEntry) {
        const targetVal = levelTargetValues[studentEntry.targetLevel] || 75;
        skillGap = Math.max(0, targetVal - studentEntry.progress);
      } else {
        // Missing skill: if required by jobs, gap is considered high (100)
        isMissing = true;
        skillGap = jobDemandMap[skillIdStr] ? 100 : 0;
      }

      // Job Demand Weight
      const demandCount = jobDemandMap[skillIdStr] || 0;
      const jobDemandWeight = demandCount > 0 ? 1 + demandCount * 0.5 : 1;

      // Weakness Factor based on assessment score
      let weaknessFactor = 1.0;
      let assessmentScore = null;
      if (skillAssessmentScores[skillIdStr] !== undefined) {
        assessmentScore = skillAssessmentScores[skillIdStr];
        weaknessFactor = Math.max(0.2, (100 - assessmentScore) / 100 + 0.5);
      }

      // Priority Formula: Skill Gap * Job Demand Weight * Weakness Factor
      const priorityScore = Math.round(skillGap * jobDemandWeight * weaknessFactor);

      if (priorityScore > 0 || (isMissing && demandCount > 0)) {
        // Build reason string
        const reasons = [];
        if (skillGap > 0) reasons.push(`${Math.round(skillGap)}% skill gap`);
        if (demandCount > 0)
          reasons.push(`Required by ${demandCount} active job${demandCount > 1 ? 's' : ''}`);
        if (assessmentScore !== null && assessmentScore < 70)
          reasons.push(`Low assessment score (${assessmentScore}%)`);
        if (isMissing) reasons.push(`Missing skill required for career match`);

        candidates.push({
          skill: {
            _id: skill._id,
            name: skill.name,
            category: skill.category,
            description: skill.description,
          },
          priorityScore,
          skillGap: Math.round(skillGap),
          jobDemandCount: demandCount,
          assessmentScore,
          isMissing,
          priorityLevel:
            priorityScore > 150 ? 'High Priority' : priorityScore > 75 ? 'Medium Priority' : 'Low Priority',
          reason: reasons.join(' • '),
        });
      }
    });

    // Sort candidates descending by priorityScore
    candidates.sort((a, b) => b.priorityScore - a.priorityScore);

    const hasRecommendations = candidates.length > 0;

    res.json({
      hasRecommendations,
      message: hasRecommendations
        ? 'Personalized skill recommendations generated based on career gaps, job demands, and assessment performance.'
        : 'Complete more assessments and add job requirements to receive personalized recommendations.',
      recommendations: candidates,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error generating recommendations' });
  }
};

module.exports = {
  getRecommendations,
};
