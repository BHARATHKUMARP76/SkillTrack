const Assessment = require('../models/Assessment');
const Question = require('../models/Question');
const AssessmentResult = require('../models/AssessmentResult');
const Skill = require('../models/Skill');
const TestAssignment = require('../models/TestAssignment');
const User = require('../models/User');

// @desc Get all assessments
// @route GET /api/assessments
// @access Private
const getAssessments = async (req, res) => {
  try {
    const assessments = await Assessment.find()
      .populate('skillId', 'name category')
      .sort({ createdAt: -1 });

    const assessmentsWithCount = await Promise.all(
      assessments.map(async (item) => {
        const questionCount = await Question.countDocuments({ assessmentId: item._id });
        return {
          ...item.toObject(),
          questionCount,
        };
      })
    );

    res.json(assessmentsWithCount);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching assessments' });
  }
};

// @desc Get single assessment (with questions for student quiz or admin edit)
// @route GET /api/assessments/:id
// @access Private
const getAssessmentById = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id).populate(
      'skillId',
      'name category'
    );

    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    // If user is a student, verify test assignment and check attempt status
    if (req.user.role === 'student') {
      const assignment = await TestAssignment.findOne({
        studentId: req.user._id,
        testId: assessment._id,
      });

      if (!assignment) {
        return res.status(403).json({ message: 'This test is not assigned to you.' });
      }

      if (assignment.status === 'completed') {
        return res.status(400).json({ message: 'You have already attempted this test.' });
      }
    }

    const questions = await Question.find({ assessmentId: assessment._id });

    // If student is fetching quiz, strip correctAnswer from payload so they can't inspect element to cheat!
    const sanitizedQuestions = questions.map((q) => {
      const qObj = q.toObject();
      if (req.user.role === 'student') {
        delete qObj.correctAnswer;
      }
      return qObj;
    });

    res.json({
      ...assessment.toObject(),
      questions: sanitizedQuestions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching assessment details' });
  }
};

// @desc Create assessment
// @route POST /api/assessments
// @access Private/Admin
const createAssessment = async (req, res) => {
  try {
    const { skillId, title, description, duration } = req.body;

    if (!skillId || !title || !duration) {
      return res.status(400).json({ message: 'Skill, title, and duration are required' });
    }

    const skill = await Skill.findById(skillId);
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    const assessment = await Assessment.create({
      skillId,
      title,
      description: description || '',
      duration: Number(duration),
      createdBy: req.user._id,
    });

    const populated = await assessment.populate('skillId', 'name category');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error creating assessment' });
  }
};

// @desc Update assessment
// @route PUT /api/assessments/:id
// @access Private/Admin
const updateAssessment = async (req, res) => {
  try {
    const { skillId, title, description, duration } = req.body;
    const assessment = await Assessment.findById(req.params.id);

    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    if (skillId) assessment.skillId = skillId;
    if (title) assessment.title = title;
    if (description !== undefined) assessment.description = description;
    if (duration) assessment.duration = Number(duration);

    const updated = await assessment.save();
    const populated = await updated.populate('skillId', 'name category');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating assessment' });
  }
};

// @desc Delete assessment
// @route DELETE /api/assessments/:id
// @access Private/Admin
const deleteAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    await Question.deleteMany({ assessmentId: assessment._id });
    await AssessmentResult.deleteMany({ assessmentId: assessment._id });
    await TestAssignment.deleteMany({ testId: assessment._id });
    await assessment.deleteOne();

    res.json({ message: 'Assessment and related data removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error deleting assessment' });
  }
};

// --- Test Assignment Endpoints ---

// @desc Admin assigns a test to a student
// @route POST /api/assessments/assign
// @access Private/Admin
const assignTest = async (req, res) => {
  try {
    const { studentId, testId } = req.body;

    if (!studentId || !testId) {
      return res.status(400).json({ message: 'Student ID and Test ID are required' });
    }

    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Valid student user not found' });
    }

    const assessment = await Assessment.findById(testId);
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    const existingAssignment = await TestAssignment.findOne({ studentId, testId });
    if (existingAssignment) {
      return res.status(400).json({ message: 'This test is already assigned to this student.' });
    }

    const assignment = await TestAssignment.create({
      studentId,
      testId,
      status: 'assigned',
    });

    const populated = await assignment.populate([
      { path: 'studentId', select: 'name email' },
      { path: 'testId', select: 'title duration skillId', populate: { path: 'skillId', select: 'name category' } },
    ]);

    res.status(201).json(populated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'This test is already assigned to this student.' });
    }
    res.status(500).json({ message: error.message || 'Error assigning test' });
  }
};

// @desc Get all test assignments (for Admin)
// @route GET /api/assessments/assignments
// @access Private/Admin
const getAssignments = async (req, res) => {
  try {
    const assignments = await TestAssignment.find()
      .populate('studentId', 'name email')
      .populate({
        path: 'testId',
        populate: { path: 'skillId', select: 'name category' },
      })
      .sort({ createdAt: -1 });

    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching test assignments' });
  }
};

// @desc Get student's assigned tests (for Student Dashboard / Assessment list)
// @route GET /api/assessments/my-assignments
// @access Private/Student
const getStudentAssignedTests = async (req, res) => {
  try {
    const assignments = await TestAssignment.find({ studentId: req.user._id })
      .populate({
        path: 'testId',
        populate: { path: 'skillId', select: 'name category' },
      })
      .sort({ createdAt: -1 });

    const assignmentsWithDetails = await Promise.all(
      assignments.map(async (item) => {
        const itemObj = item.toObject();
        if (itemObj.testId) {
          const questionCount = await Question.countDocuments({ assessmentId: itemObj.testId._id });
          itemObj.testId.questionCount = questionCount;
        }
        return itemObj;
      })
    );

    res.json(assignmentsWithDetails);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching your assigned tests' });
  }
};

// @desc Student starts an assigned test
// @route POST /api/assessments/:id/start
// @access Private/Student
const startAssessment = async (req, res) => {
  try {
    const testId = req.params.id;
    const studentId = req.user._id;

    const assignment = await TestAssignment.findOne({ studentId, testId });

    if (!assignment) {
      return res.status(403).json({ message: 'This test is not assigned to you.' });
    }

    if (assignment.status === 'completed') {
      return res.status(400).json({ message: 'You have already attempted this test.' });
    }

    if (assignment.status === 'assigned') {
      assignment.status = 'in-progress';
      assignment.startedAt = new Date();
      await assignment.save();
    }

    res.json({ message: 'Test started', assignment });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error starting test' });
  }
};

// --- Question Endpoints ---

// @desc Add question to assessment
// @route POST /api/questions
// @access Private/Admin
const addQuestion = async (req, res) => {
  try {
    const { assessmentId, questionText, options, correctAnswer, topic, difficulty } = req.body;

    if (!assessmentId || !questionText || !options || !correctAnswer || !topic) {
      return res.status(400).json({ message: 'Please provide all required question fields' });
    }

    if (!Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ message: 'Questions must have at least 2 options' });
    }

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    const question = await Question.create({
      assessmentId,
      questionText,
      options,
      correctAnswer,
      topic,
      difficulty: difficulty || 'Medium',
    });

    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error adding question' });
  }
};

// @desc Get questions for an assessment
// @route GET /api/questions/:assessmentId
// @access Private/Admin
const getQuestionsByAssessment = async (req, res) => {
  try {
    const questions = await Question.find({ assessmentId: req.params.assessmentId });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching questions' });
  }
};

// @desc Update question
// @route PUT /api/questions/:id
// @access Private/Admin
const updateQuestion = async (req, res) => {
  try {
    const { questionText, options, correctAnswer, topic, difficulty } = req.body;
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (questionText) question.questionText = questionText;
    if (options) question.options = options;
    if (correctAnswer) question.correctAnswer = correctAnswer;
    if (topic) question.topic = topic;
    if (difficulty) question.difficulty = difficulty;

    const updated = await question.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating question' });
  }
};

// @desc Delete question
// @route DELETE /api/questions/:id
// @access Private/Admin
const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    await question.deleteOne();
    res.json({ message: 'Question removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error deleting question' });
  }
};

// --- Assessment Submission & Results ---

// @desc Submit assessment answers and calculate result in backend
// @route POST /api/assessments/:id/submit
// @access Private/Student
const submitAssessment = async (req, res) => {
  try {
    const assessmentId = req.params.id;
    const studentId = req.user._id;
    const { answers } = req.body; // Map of { questionId: selectedOption }

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ message: 'Answers payload is required' });
    }

    // Verify assignment status first
    const assignment = await TestAssignment.findOne({ studentId, testId: assessmentId });

    if (!assignment) {
      return res.status(403).json({ message: 'This test is not assigned to you.' });
    }

    if (assignment.status === 'completed') {
      return res.status(400).json({ message: 'You have already attempted this test.' });
    }

    const assessment = await Assessment.findById(assessmentId).populate('skillId');
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    const questions = await Question.find({ assessmentId });
    if (!questions || questions.length === 0) {
      return res.status(400).json({ message: 'This assessment has no questions to evaluate' });
    }

    let correctCount = 0;
    const totalQuestions = questions.length;
    const topicStats = {};

    questions.forEach((q) => {
      const topic = q.topic || 'General';
      if (!topicStats[topic]) {
        topicStats[topic] = { correct: 0, total: 0 };
      }
      topicStats[topic].total += 1;

      const studentAnswer = answers[q._id.toString()];
      if (studentAnswer && studentAnswer.trim() === q.correctAnswer.trim()) {
        correctCount += 1;
        topicStats[topic].correct += 1;
      }
    });

    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);

    const topicResults = Object.keys(topicStats).map((topic) => {
      const stat = topicStats[topic];
      const percentage = Math.round((stat.correct / stat.total) * 100);
      return {
        topic,
        correct: stat.correct,
        total: stat.total,
        percentage,
      };
    });

    // Update assignment record to completed
    const submissionTime = new Date();
    assignment.status = 'completed';
    assignment.submittedAt = submissionTime;
    assignment.score = scorePercentage;
    await assignment.save();

    // Create AssessmentResult entry for historical tracking
    const result = await AssessmentResult.create({
      studentId: req.user._id,
      assessmentId,
      score: scorePercentage,
      totalQuestions,
      correctAnswers: correctCount,
      topicResults,
      attemptedAt: submissionTime,
    });

    const populatedResult = await result.populate({
      path: 'assessmentId',
      populate: { path: 'skillId', select: 'name category' },
    });

    res.status(201).json(populatedResult);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error submitting assessment' });
  }
};

// @desc Get student assessment results history
// @route GET /api/assessment-results
// @access Private/Student
const getStudentAssessmentResults = async (req, res) => {
  try {
    const results = await AssessmentResult.find({ studentId: req.user._id })
      .populate({
        path: 'assessmentId',
        populate: { path: 'skillId', select: 'name category' },
      })
      .sort({ attemptedAt: -1 });

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching assessment results' });
  }
};

module.exports = {
  getAssessments,
  getAssessmentById,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  assignTest,
  getAssignments,
  getStudentAssignedTests,
  startAssessment,
  addQuestion,
  getQuestionsByAssessment,
  updateQuestion,
  deleteQuestion,
  submitAssessment,
  getStudentAssessmentResults,
};

