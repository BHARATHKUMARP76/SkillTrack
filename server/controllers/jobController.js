const Job = require('../models/Job');
const JobSkill = require('../models/JobSkill');
const Skill = require('../models/Skill');

// @desc Get all jobs with required skills
// @route GET /api/jobs
// @access Private
const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });

    const jobsWithSkills = await Promise.all(
      jobs.map(async (job) => {
        const requiredSkills = await JobSkill.find({ jobId: job._id }).populate('skillId');
        return {
          ...job.toObject(),
          requiredSkills,
        };
      })
    );

    res.json(jobsWithSkills);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching jobs' });
  }
};

// @desc Get single job
// @route GET /api/jobs/:id
// @access Private
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job posting not found' });
    }

    const requiredSkills = await JobSkill.find({ jobId: job._id }).populate('skillId');

    res.json({
      ...job.toObject(),
      requiredSkills,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching job' });
  }
};

// @desc Create job posting
// @route POST /api/jobs
// @access Private/Admin
const createJob = async (req, res) => {
  try {
    const { title, company, description, location, employmentType, status, skills } = req.body;

    if (!title || !company) {
      return res.status(400).json({ message: 'Job title and company are required' });
    }

    const job = await Job.create({
      title,
      company,
      description: description || '',
      location: location || 'Remote',
      employmentType: employmentType || 'Full-time',
      status: status || 'active',
      createdBy: req.user._id,
    });

    // If skills array passed during creation: [{ skillId, requiredLevel, importance }]
    if (Array.isArray(skills) && skills.length > 0) {
      for (const sk of skills) {
        if (sk.skillId) {
          await JobSkill.create({
            jobId: job._id,
            skillId: sk.skillId,
            requiredLevel: sk.requiredLevel || 'Intermediate',
            importance: sk.importance || 'High',
          });
        }
      }
    }

    const requiredSkills = await JobSkill.find({ jobId: job._id }).populate('skillId');
    res.status(201).json({
      ...job.toObject(),
      requiredSkills,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error creating job' });
  }
};

// @desc Update job posting
// @route PUT /api/jobs/:id
// @access Private/Admin
const updateJob = async (req, res) => {
  try {
    const { title, company, description, location, employmentType, status } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (title) job.title = title;
    if (company) job.company = company;
    if (description !== undefined) job.description = description;
    if (location) job.location = location;
    if (employmentType) job.employmentType = employmentType;
    if (status) job.status = status;

    const updatedJob = await job.save();
    const requiredSkills = await JobSkill.find({ jobId: updatedJob._id }).populate('skillId');

    res.json({
      ...updatedJob.toObject(),
      requiredSkills,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating job' });
  }
};

// @desc Delete job posting
// @route DELETE /api/jobs/:id
// @access Private/Admin
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    await JobSkill.deleteMany({ jobId: job._id });
    await job.deleteOne();

    res.json({ message: 'Job and required skills removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error deleting job' });
  }
};

// @desc Assign/Update required skill to a job
// @route POST /api/jobs/:id/skills
// @access Private/Admin
const assignJobSkill = async (req, res) => {
  try {
    const jobId = req.params.id;
    const { skillId, requiredLevel, importance } = req.body;

    if (!skillId) {
      return res.status(400).json({ message: 'Skill selection is required' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const masterSkill = await Skill.findById(skillId);
    if (!masterSkill) {
      return res.status(404).json({ message: 'Master skill not found' });
    }

    let jobSkill = await JobSkill.findOne({ jobId, skillId });

    if (jobSkill) {
      jobSkill.requiredLevel = requiredLevel || jobSkill.requiredLevel;
      jobSkill.importance = importance || jobSkill.importance;
      await jobSkill.save();
    } else {
      jobSkill = await JobSkill.create({
        jobId,
        skillId,
        requiredLevel: requiredLevel || 'Intermediate',
        importance: importance || 'High',
      });
    }

    const populated = await jobSkill.populate('skillId');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error assigning skill to job' });
  }
};

// @desc Remove required skill from job
// @route DELETE /api/jobs/:id/skills/:skillId
// @access Private/Admin
const removeJobSkill = async (req, res) => {
  try {
    const { id: jobId, skillId } = req.params;

    const jobSkill = await JobSkill.findOne({ jobId, skillId });
    if (!jobSkill) {
      return res.status(404).json({ message: 'Job skill requirement not found' });
    }

    await jobSkill.deleteOne();
    res.json({ message: 'Required skill removed from job' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error removing skill from job' });
  }
};

module.exports = {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  assignJobSkill,
  removeJobSkill,
};
