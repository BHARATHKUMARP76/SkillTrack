const Skill = require('../models/Skill');

// @desc Get all master skills
// @route GET /api/skills
// @access Private
const getSkills = async (req, res) => {
  try {
    const skills = await Skill.find().sort({ name: 1 });
    res.json(skills);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching skills' });
  }
};

// @desc Get single skill by ID
// @route GET /api/skills/:id
// @access Private
const getSkillById = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }
    res.json(skill);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching skill' });
  }
};

// @desc Create a new master skill
// @route POST /api/skills
// @access Private/Admin
const createSkill = async (req, res) => {
  try {
    const { name, category, description } = req.body;

    if (!name || !category) {
      return res.status(400).json({ message: 'Skill name and category are required' });
    }

    const existingSkill = await Skill.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingSkill) {
      return res.status(400).json({ message: 'Skill with this name already exists' });
    }

    const skill = await Skill.create({
      name,
      category,
      description: description || '',
    });

    res.status(201).json(skill);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error creating skill' });
  }
};

// @desc Update a master skill
// @route PUT /api/skills/:id
// @access Private/Admin
const updateSkill = async (req, res) => {
  try {
    const { name, category, description } = req.body;
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    if (name && name.toLowerCase() !== skill.name.toLowerCase()) {
      const duplicate = await Skill.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
      if (duplicate) {
        return res.status(400).json({ message: 'Skill name already in use' });
      }
    }

    skill.name = name || skill.name;
    skill.category = category || skill.category;
    skill.description = description !== undefined ? description : skill.description;

    const updatedSkill = await skill.save();
    res.json(updatedSkill);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating skill' });
  }
};

// @desc Delete a master skill
// @route DELETE /api/skills/:id
// @access Private/Admin
const deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    await skill.deleteOne();
    res.json({ message: 'Skill removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error deleting skill' });
  }
};

module.exports = {
  getSkills,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill,
};
