const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');

// @desc Get student profile
// @route GET /api/profile
// @access Private/Student
const getProfile = async (req, res) => {
  try {
    let profile = await StudentProfile.findOne({ userId: req.user._id }).populate(
      'userId',
      'name email role profileCompleted'
    );

    if (!profile) {
      profile = await StudentProfile.create({
        userId: req.user._id,
        college: '',
        department: '',
        graduationYear: '',
        phone: '',
        bio: '',
      });
      profile = await profile.populate('userId', 'name email role profileCompleted');
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching profile' });
  }
};

// @desc Update student profile
// @route PUT /api/profile
// @access Private/Student
const updateProfile = async (req, res) => {
  try {
    const { name, college, department, graduationYear, phone, bio } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) {
      user.name = name;
    }
    user.profileCompleted = true;
    await user.save();

    let profile = await StudentProfile.findOne({ userId: req.user._id });

    if (!profile) {
      profile = new StudentProfile({ userId: req.user._id });
    }

    profile.college = college !== undefined ? college : profile.college;
    profile.department = department !== undefined ? department : profile.department;
    profile.graduationYear =
      graduationYear !== undefined ? graduationYear : profile.graduationYear;
    profile.phone = phone !== undefined ? phone : profile.phone;
    profile.bio = bio !== undefined ? bio : profile.bio;

    const updatedProfile = await profile.save();
    const populatedProfile = await updatedProfile.populate('userId', 'name email role profileCompleted');

    res.json(populatedProfile);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating profile' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
