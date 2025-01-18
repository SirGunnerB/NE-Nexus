const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Job, Application, User } = require('../models');
const { authenticate } = require('../middleware/auth');

// Get all jobs (public)
router.get('/', async (req, res) => {
  try {
    const { status, type, experience, search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
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

    const jobs = await Job.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'recruiter',
        attributes: ['id', 'name', 'email']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      jobs: jobs.rows,
      total: jobs.count,
      totalPages: Math.ceil(jobs.count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Get recruiter's jobs
router.get('/my-jobs', authenticate, async (req, res) => {
  try {
    const jobs = await Job.findAll({
      where: { recruiterId: req.user.id },
      include: [{
        model: Application,
        as: 'applications',
        attributes: ['id', 'status']
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching recruiter jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Get single job
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'recruiter',
        attributes: ['id', 'name', 'email', 'company']
      }]
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Increment views
    await job.increment('views');
    
    res.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

// Create job
router.post('/', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ error: 'Only recruiters can create jobs' });
    }

    const job = await Job.create({
      ...req.body,
      recruiterId: req.user.id,
      status: 'draft'
    });

    res.status(201).json(job);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

// Update job
router.put('/:id', authenticate, async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.recruiterId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this job' });
    }

    await job.update(req.body);
    res.json(job);
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
});

// Delete job
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.recruiterId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this job' });
    }

    await job.destroy();
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

module.exports = router; 