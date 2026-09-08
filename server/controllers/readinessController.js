const StudentSkill = require('../models/StudentSkill');
const AssessmentResult = require('../models/AssessmentResult');
const Project = require('../models/Project');
const DSATracker = require('../models/DSATracker');

// @desc Calculate student placement readiness
// @route GET /api/readiness
// @access Private/Student
const getPlacementReadiness = async (req, res) => {
  try {
    const studentId = req.user._id;

    // 1. Technical Skills Score (Average of progress across all added student skills)
    const studentSkills = await StudentSkill.find({ studentId }).populate('skillId');
    let techScore = 0;
    const totalSkillsCount = studentSkills.length;
    if (totalSkillsCount > 0) {
      const sumTech = studentSkills.reduce((acc, curr) => acc + (curr.progress || 0), 0);
      techScore = sumTech / totalSkillsCount;
    }

    // 2. Assessment Score (Average score of all attempted assessments)
    const assessmentResults = await AssessmentResult.find({ studentId });
    let assessmentScore = 0;
    const totalAssessmentsCount = assessmentResults.length;
    if (totalAssessmentsCount > 0) {
      const sumAssess = assessmentResults.reduce((acc, curr) => acc + (curr.score || 0), 0);
      assessmentScore = sumAssess / totalAssessmentsCount;
    }

    // 3. Project Score (Based on completed projects)
    const completedProjectsCount = await Project.countDocuments({
      studentId,
      status: 'Completed',
    });
    const totalProjectsCount = await Project.countDocuments({ studentId });

    let projectScore = 0;
    if (completedProjectsCount === 1) projectScore = 40;
    else if (completedProjectsCount === 2) projectScore = 60;
    else if (completedProjectsCount === 3) projectScore = 80;
    else if (completedProjectsCount >= 4) projectScore = 100;

    // 4. DSA Score (Solved / Total * 100 across all DSA topics)
    const dsaEntries = await DSATracker.find({ studentId });
    let dsaScore = 0;
    let totalDsaProblems = 0;
    let totalDsaSolved = 0;
    if (dsaEntries.length > 0) {
      totalDsaProblems = dsaEntries.reduce((acc, curr) => acc + curr.totalProblems, 0);
      totalDsaSolved = dsaEntries.reduce((acc, curr) => acc + curr.solvedProblems, 0);
      if (totalDsaProblems > 0) {
        dsaScore = (totalDsaSolved / totalDsaProblems) * 100;
      }
    }

    // Determine if student has sufficient data
    const hasData =
      totalSkillsCount > 0 ||
      totalAssessmentsCount > 0 ||
      totalProjectsCount > 0 ||
      dsaEntries.length > 0;

    // Readiness formula: Tech*0.4 + Assess*0.3 + Project*0.2 + DSA*0.1
    const rawReadiness =
      techScore * 0.4 + assessmentScore * 0.3 + projectScore * 0.2 + dsaScore * 0.1;
    const readinessScore = Math.round(rawReadiness * 100) / 100;

    // Status mapping
    let status = 'Beginner';
    if (readinessScore >= 90) status = 'Highly Ready';
    else if (readinessScore >= 75) status = 'Placement Ready';
    else if (readinessScore >= 60) status = 'Almost Ready';
    else if (readinessScore >= 40) status = 'Developing';

    // Skill Gap Analysis
    const levelTargetValues = { Beginner: 25, Intermediate: 50, Advanced: 75, Expert: 100 };
    const skillGaps = studentSkills
      .map((sk) => {
        const targetVal = levelTargetValues[sk.targetLevel] || 75;
        const gap = Math.max(0, targetVal - sk.progress);
        return {
          skillName: sk.skillId ? sk.skillId.name : 'Unknown Skill',
          category: sk.skillId ? sk.skillId.category : 'General',
          currentProgress: sk.progress,
          targetLevel: sk.targetLevel,
          gapPercentage: gap,
        };
      })
      .sort((a, b) => b.gapPercentage - a.gapPercentage);

    res.json({
      hasData,
      readinessScore,
      status,
      breakdown: {
        technicalSkills: Math.round(techScore * 100) / 100,
        assessments: Math.round(assessmentScore * 100) / 100,
        projects: projectScore,
        dsa: Math.round(dsaScore * 100) / 100,
      },
      counts: {
        totalSkills: totalSkillsCount,
        totalAssessments: totalAssessmentsCount,
        totalProjects: totalProjectsCount,
        completedProjects: completedProjectsCount,
        dsaTopics: dsaEntries.length,
      },
      skillGaps,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error calculating placement readiness' });
  }
};

module.exports = {
  getPlacementReadiness,
};
