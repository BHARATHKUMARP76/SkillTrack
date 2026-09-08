const Project = require('../models/Project');

// @desc Get student projects
// @route GET /api/projects
// @access Private/Student
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ studentId: req.user._id }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching projects' });
  }
};

// @desc Create project
// @route POST /api/projects
// @access Private/Student
const createProject = async (req, res) => {
  try {
    const { name, description, technologies, githubUrl, status, startDate, endDate } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    if (githubUrl && githubUrl.trim() !== '') {
      const githubRegex = /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+.*$/;
      if (!githubRegex.test(githubUrl.trim())) {
        return res.status(400).json({ message: 'Please provide a valid GitHub repository URL' });
      }
    }

    let parsedTech = [];
    if (Array.isArray(technologies)) {
      parsedTech = technologies;
    } else if (typeof technologies === 'string' && technologies.trim()) {
      parsedTech = technologies.split(',').map((t) => t.trim());
    }

    const project = await Project.create({
      studentId: req.user._id,
      name,
      description: description || '',
      technologies: parsedTech,
      githubUrl: githubUrl || '',
      status: status || 'In Progress',
      startDate: startDate || null,
      endDate: endDate || null,
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error creating project' });
  }
};

// @desc Update project
// @route PUT /api/projects/:id
// @access Private/Student
const updateProject = async (req, res) => {
  try {
    const { name, description, technologies, githubUrl, status, startDate, endDate } = req.body;

    const project = await Project.findOne({ _id: req.params.id, studentId: req.user._id });

    if (!project) {
      return res.status(404).json({ message: 'Project not found or unauthorized' });
    }

    if (githubUrl && githubUrl.trim() !== '') {
      const githubRegex = /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+.*$/;
      if (!githubRegex.test(githubUrl.trim())) {
        return res.status(400).json({ message: 'Please provide a valid GitHub repository URL' });
      }
    }

    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (technologies !== undefined) {
      if (Array.isArray(technologies)) {
        project.technologies = technologies;
      } else if (typeof technologies === 'string') {
        project.technologies = technologies.split(',').map((t) => t.trim()).filter(Boolean);
      }
    }
    if (githubUrl !== undefined) project.githubUrl = githubUrl;
    if (status) project.status = status;
    if (startDate !== undefined) project.startDate = startDate || null;
    if (endDate !== undefined) project.endDate = endDate || null;

    const updated = await project.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating project' });
  }
};

// @desc Delete project
// @route DELETE /api/projects/:id
// @access Private/Student
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, studentId: req.user._id });

    if (!project) {
      return res.status(404).json({ message: 'Project not found or unauthorized' });
    }

    await project.deleteOne();
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error deleting project' });
  }
};

module.exports = {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
};
