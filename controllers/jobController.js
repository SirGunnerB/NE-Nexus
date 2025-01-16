const { Op } = require('sequelize');
const Job = require('../models/Job');

// Create a new job
exports.createJob = async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      recruiterId: req.user.id,
      status: req.body.status || 'draft'
    };

    const job = await Job.create(jobData);
    res.status(201).json(job);
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ message: 'Error creating job posting' });
  }
};

// Get all jobs with filters
exports.getJobs = async (req, res) => {
  try {
    const {
      status,
      type,
      experience,
      search,
      page = 1,
      limit = 10
    } = req.query;

    const where = {};
    
    // Add filters
    if (status) where.status = status;
    if (type) where.type = type;
    if (experience) where.experience = experience;
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { company: { [Op.like]: `%${search}%` } },
        { location: { [Op.like]: `%${search}%` } }
      ];
    }

    // If user is a recruiter, only show their jobs
    if (req.user.role === 'recruiter') {
      where.recruiterId = req.user.id;
    }

    // If user is a candidate, only show published jobs
    if (req.user.role === 'candidate') {
      where.status = 'published';
    }

    const offset = (page - 1) * limit;

    const jobs = await Job.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      jobs: jobs.rows,
      total: jobs.count,
      totalPages: Math.ceil(jobs.count / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Error fetching jobs' });
  }
};

// Get a single job
exports.getJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user has access to view this job
    if (req.user.role === 'recruiter' && job.recruiterId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (req.user.role === 'candidate' && job.status !== 'published') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(job);
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ message: 'Error fetching job details' });
  }
};

// Update a job
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Only allow the recruiter who created the job to update it
    if (job.recruiterId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await job.update(req.body);
    res.json(job);
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ message: 'Error updating job posting' });
  }
};

// Delete a job
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Only allow the recruiter who created the job to delete it
    if (job.recruiterId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await job.destroy();
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ message: 'Error deleting job posting' });
  }
};

// Get job statistics
exports.getJobStats = async (req, res) => {
  try {
    const where = req.user.role === 'recruiter' ? { recruiterId: req.user.id } : {};
    
    const stats = await Job.findAll({
      where,
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    res.json(stats);
  } catch (error) {
    console.error('Get job stats error:', error);
    res.status(500).json({ message: 'Error fetching job statistics' });
  }
}; 