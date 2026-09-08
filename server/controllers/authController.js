const jwt = require('jsonwebtoken');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'skilltrack_jwt_secret_key_2026_production_secure_token',
    { expiresIn: '30d' }
  );
};

// @desc Register user
// @route POST /api/auth/register
// @access Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role } = req.body;

    if (!name || !email || !password || !confirmPassword || !role) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const normalizedRole = role.toLowerCase();
    if (!['student', 'admin'].includes(normalizedRole)) {
      return res.status(400).json({ message: 'Role must be Student or Admin' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: normalizedRole,
    });

    if (user.role === 'student') {
      await StudentProfile.create({
        userId: user._id,
        college: '',
        department: '',
        graduationYear: '',
        phone: '',
        bio: '',
      });
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileCompleted: user.profileCompleted || false,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error registering user' });
  }
};

// @desc Auth user & get token
// @route POST /api/auth/login
// @access Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileCompleted: user.profileCompleted || false,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error logging in' });
  }
};

// @desc Get current logged in user
// @route GET /api/auth/me
// @access Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching user profile' });
  }
};

// @desc Get all registered students (Admin only)
// @route GET /api/auth/students
// @access Private/Admin
const getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password').sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching students' });
  }
};

// @desc Get admin dashboard overview metrics (Admin only)
// @route GET /api/auth/admin-stats
// @access Private/Admin
const getAdminStats = async (req, res) => {
  try {
    const Skill = require('../models/Skill');
    const Assessment = require('../models/Assessment');
    const Job = require('../models/Job');

    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalSkills = await Skill.countDocuments();
    const totalAssessments = await Assessment.countDocuments();
    const totalJobs = await Job.countDocuments();

    res.json({
      totalStudents,
      totalSkills,
      totalAssessments,
      totalJobs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching admin stats' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  getStudents,
  getAdminStats,
};
