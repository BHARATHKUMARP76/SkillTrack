const Job = require('../models/Job');
const JobSkill = require('../models/JobSkill');
const StudentSkill = require('../models/StudentSkill');

const LEVEL_VALUES = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
  Expert: 4,
};

// @desc Calculate job skill matches for logged-in student
// @route GET /api/jobs/matches
// @access Private/Student
const getJobMatches = async (req, res) => {
  try {
    const studentId = req.user._id;

    // Fetch student's tracked skills
    const studentSkills = await StudentSkill.find({ studentId }).populate('skillId');

    // Build skill lookup maps (by ID and by normalized name)
    const studentSkillMap = new Map();
    const studentSkillNameMap = new Map();

    studentSkills.forEach((sk) => {
      if (sk.skillId) {
        const skillIdStr = sk.skillId._id.toString();
        const skillNameNorm = (sk.skillId.name || '').toLowerCase().trim();
        const currentLevel = sk.currentLevel || 'Beginner';
        const levelVal = LEVEL_VALUES[currentLevel] || 1;

        const info = {
          _id: sk.skillId._id,
          name: sk.skillId.name,
          category: sk.skillId.category,
          currentLevel,
          levelVal,
        };

        studentSkillMap.set(skillIdStr, info);
        studentSkillNameMap.set(skillNameNorm, info);
      }
    });

    // Fetch all active job postings (status !== 'inactive')
    const activeJobs = await Job.find({ status: { $ne: 'inactive' } }).sort({ createdAt: -1 });

    const matches = await Promise.all(
      activeJobs.map(async (job) => {
        const rawJobSkills = await JobSkill.find({ jobId: job._id }).populate('skillId');
        const requiredJobSkills = rawJobSkills.filter((rs) => rs && rs.skillId);

        const matchedSkills = [];
        const skillsToImprove = [];
        const missingSkills = [];

        let totalEarnedScore = 0;

        requiredJobSkills.forEach((reqSkill) => {
          if (reqSkill.skillId) {
            const skillIdStr = reqSkill.skillId._id.toString();
            const skillNameNorm = (reqSkill.skillId.name || '').toLowerCase().trim();
            const requiredLevel = reqSkill.requiredLevel || 'Intermediate';
            const reqLevelVal = LEVEL_VALUES[requiredLevel] || 2;

            // Check match by skillId or by normalized name
            const studentSkill = studentSkillMap.get(skillIdStr) || studentSkillNameMap.get(skillNameNorm);

            if (studentSkill) {
              if (studentSkill.levelVal >= reqLevelVal) {
                // Exact or higher level match
                matchedSkills.push({
                  _id: reqSkill.skillId._id,
                  name: reqSkill.skillId.name,
                  category: reqSkill.skillId.category,
                  requiredLevel,
                  studentLevel: studentSkill.currentLevel,
                  importance: reqSkill.importance || 'High',
                });
                totalEarnedScore += 1.0;
              } else {
                // Partial match with level gap
                skillsToImprove.push({
                  _id: reqSkill.skillId._id,
                  name: reqSkill.skillId.name,
                  category: reqSkill.skillId.category,
                  requiredLevel,
                  studentLevel: studentSkill.currentLevel,
                  importance: reqSkill.importance || 'High',
                  gap: `${studentSkill.currentLevel} → ${requiredLevel}`,
                });
                totalEarnedScore += 0.5;
              }
            } else {
              // Missing skill
              missingSkills.push({
                _id: reqSkill.skillId._id,
                name: reqSkill.skillId.name,
                category: reqSkill.skillId.category,
                requiredLevel,
                importance: reqSkill.importance || 'High',
              });
              totalEarnedScore += 0;
            }
          }
        });

        const totalRequired = requiredJobSkills.length;
        let matchPercentage = null;
        let matchGrade = 'Not Specified';
        let hasSkillRequirements = true;

        if (totalRequired > 0) {
          const rawPercentage = (totalEarnedScore / totalRequired) * 100;
          matchPercentage = Math.min(100, Math.max(0, Math.round(rawPercentage)));

          if (matchPercentage >= 80) matchGrade = 'Excellent Match';
          else if (matchPercentage >= 60) matchGrade = 'Good Match';
          else if (matchPercentage >= 40) matchGrade = 'Partial Match';
          else matchGrade = 'Low Match';
        } else {
          hasSkillRequirements = false;
        }

        // Generate dynamic learning recommendation path specifically for this job's missing/weak skills
        const recommendedLearning = [];
        let stepCount = 1;

        skillsToImprove.forEach((sk) => {
          recommendedLearning.push(`${stepCount++}. Upgrade ${sk.name} from ${sk.studentLevel} to ${sk.requiredLevel}`);
        });

        missingSkills.forEach((sk) => {
          recommendedLearning.push(`${stepCount++}. Learn ${sk.name} (${sk.requiredLevel} level)`);
        });

        return {
          job: {
            _id: job._id,
            title: job.title,
            company: job.company,
            description: job.description,
            location: job.location,
            employmentType: job.employmentType,
            status: job.status || 'active',
            createdAt: job.createdAt,
          },
          hasSkillRequirements,
          matchPercentage,
          matchGrade,
          totalRequired,
          matchedCount: matchedSkills.length,
          toImproveCount: skillsToImprove.length,
          missingCount: missingSkills.length,
          matchedSkills,
          skillsToImprove,
          missingSkills,
          recommendedLearning,
        };
      })
    );

    // Sort jobs by highest match percentage (null percentages placed at bottom)
    matches.sort((a, b) => {
      if (a.matchPercentage === null) return 1;
      if (b.matchPercentage === null) return -1;
      return b.matchPercentage - a.matchPercentage;
    });

    res.json(matches);
  } catch (error) {
    console.error('MATCH CONTROLLER ERROR:', error);
    res.status(500).json({ message: error.message || 'Error calculating job matches' });
  }
};

module.exports = {
  getJobMatches,
};
