const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Application, Job, User } = require('../models');
const { authenticate } = require('../middleware/auth');
const { sendEmail, templates } = require('../utils/email');

// Get candidate's applications
router.get('/my-applications', authenticate, async (req, res) => {
  try {
    const applications = await Application.findAll({
      where: { candidateId: req.user.id },
      include: [{
        model: Job,
        as: 'job',
        include: [{
          model: User,
          as: 'recruiter',
          attributes: ['id', 'name', 'email', 'company']
        }]
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Apply for a job
router.post('/apply/:jobId', authenticate, async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      where: {
        jobId: req.params.jobId,
        candidateId: req.user.id
      }
    });

    if (existingApplication) {
      return res.status(400).json({ error: 'You have already applied for this job' });
    }

    const application = await Application.create({
      jobId: req.params.jobId,
      candidateId: req.user.id,
      ...req.body,
      status: 'new'
    });

    // Increment application count
    await job.increment('applicationCount');

    // Send confirmation email
    try {
      await sendEmail({
        to: req.user.email,
        ...templates.applicationReceived(job.title, job.company)
      });
    } catch (emailError) {
      console.error('Application confirmation email error:', emailError);
    }

    res.status(201).json(application);
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// Get applications for a job (recruiter only)
router.get('/job/:jobId', authenticate, async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.recruiterId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to view these applications' });
    }

    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const where = { jobId: req.params.jobId };
    if (status) where.status = status;

    const applications = await Application.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'candidate',
        attributes: ['id', 'name', 'email', 'phone', 'location', 'title', 'experience']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      applications: applications.rows,
      total: applications.count,
      totalPages: Math.ceil(applications.count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error fetching job applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Update application status (recruiter only)
router.put('/:id/status', authenticate, async (req, res) => {
  try {
    const application = await Application.findByPk(req.params.id, {
      include: [{
        model: Job,
        as: 'job'
      }]
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (application.job.recruiterId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this application' });
    }

    const { status, feedback } = req.body;
    await application.update({
      status,
      feedback: feedback || application.feedback
    });

    res.json(application);
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ error: 'Failed to update application' });
  }
});

// Withdraw application (candidate only)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const application = await Application.findByPk(req.params.id);
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (application.candidateId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to withdraw this application' });
    }

    await application.destroy();
    res.json({ message: 'Application withdrawn successfully' });
  } catch (error) {
    console.error('Error withdrawing application:', error);
    res.status(500).json({ error: 'Failed to withdraw application' });
  }
});

module.exports = router; 