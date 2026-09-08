const StudentSkill = require('../models/StudentSkill');
const Skill = require('../models/Skill');

// Level to Progress Percentage helper
const levelToPercentage = {
  Beginner: 25,
  Intermediate: 50,
  Advanced: 75,
  Expert: 100,
};

// @desc Get student's tracked skills
// @route GET /api/student-skills
// @access Private/Student
const getStudentSkills = async (req, res) => {
  try {
    const studentSkills = await StudentSkill.find({ studentId: req.user._id })
      .populate('skillId')
      .sort({ updatedAt: -1 });

    res.json(studentSkills);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching student skills' });
  }
};

// @desc Add a skill to student's tracker
// @route POST /api/student-skills
// @access Private/Student
const addStudentSkill = async (req, res) => {
  try {
    const { skillId, currentLevel, targetLevel, progress } = req.body;

    if (!skillId) {
      return res.status(400).json({ message: 'Skill selection is required' });
    }

    const masterSkill = await Skill.findById(skillId);
    if (!masterSkill) {
      return res.status(404).json({ message: 'Master skill not found' });
    }

    const existingStudentSkill = await StudentSkill.findOne({
      studentId: req.user._id,
      skillId,
    });

    if (existingStudentSkill) {
      return res.status(400).json({ message: 'Skill already added to your profile' });
    }

    let calculatedProgress = Number(progress);
    if (isNaN(calculatedProgress)) {
      calculatedProgress = levelToPercentage[currentLevel || 'Beginner'] || 25;
    }

    if (calculatedProgress < 0 || calculatedProgress > 100) {
      return res.status(400).json({ message: 'Progress must be between 0 and 100' });
    }

    const studentSkill = await StudentSkill.create({
      studentId: req.user._id,
      skillId,
      currentLevel: currentLevel || 'Beginner',
      targetLevel: targetLevel || 'Advanced',
      progress: calculatedProgress,
      lastUpdated: new Date(),
    });

    const populated = await studentSkill.populate('skillId');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error adding student skill' });
  }
};

// @desc Update student skill level or progress
// @route PUT /api/student-skills/:id
// @access Private/Student
const updateStudentSkill = async (req, res) => {
  try {
    const { currentLevel, targetLevel, progress } = req.body;

    const studentSkill = await StudentSkill.findOne({
      _id: req.params.id,
      studentId: req.user._id,
    });

    if (!studentSkill) {
      return res.status(404).json({ message: 'Student skill entry not found' });
    }

    if (currentLevel) studentSkill.currentLevel = currentLevel;
    if (targetLevel) studentSkill.targetLevel = targetLevel;

    if (progress !== undefined && progress !== null) {
      const progNum = Number(progress);
      if (isNaN(progNum) || progNum < 0 || progNum > 100) {
        return res.status(400).json({ message: 'Progress must be a number between 0 and 100' });
      }
      studentSkill.progress = progNum;
    }

    studentSkill.lastUpdated = new Date();

    const updated = await studentSkill.save();
    const populated = await updated.populate('skillId');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating student skill' });
  }
};

// @desc Delete student skill entry
// @route DELETE /api/student-skills/:id
// @access Private/Student
const deleteStudentSkill = async (req, res) => {
  try {
    const studentSkill = await StudentSkill.findOne({
      _id: req.params.id,
      studentId: req.user._id,
    });

    if (!studentSkill) {
      return res.status(404).json({ message: 'Student skill entry not found' });
    }

    await studentSkill.deleteOne();
    res.json({ message: 'Student skill removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error removing student skill' });
  }
};

module.exports = {
  getStudentSkills,
  addStudentSkill,
  updateStudentSkill,
  deleteStudentSkill,
};
