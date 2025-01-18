const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { User, Application, Job } = require('../models');
const { authenticate } = require('../middleware/auth');

// Get all candidates with filtering and search
router.get('/', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'recruiter' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to view candidates' });
    }

    const { search, skills, experience, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const where = {
      role: 'candidate'
    };

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { location: { [Op.like]: `%${search}%` } }
      ];
    }

    if (skills) {
      where.skills = {
        [Op.overlap]: Array.isArray(skills) ? skills : [skills]
      };
    }

    if (experience) {
      where.experience = experience;
    }

    const candidates = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      candidates: candidates.rows,
      total: candidates.count,
      totalPages: Math.ceil(candidates.count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});

// Get candidate details
router.get('/:id', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'recruiter' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to view candidate details' });
    }

    const candidate = await User.findOne({
      where: {
        id: req.params.id,
        role: 'candidate'
      },
      attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires'] },
      include: [{
        model: Application,
        as: 'applications',
        include: ['job']
      }]
    });

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    res.json(candidate);
  } catch (error) {
    console.error('Error fetching candidate:', error);
    res.status(500).json({ error: 'Failed to fetch candidate details' });
  }
});

// Update candidate stage
router.put('/:id/stage', authenticate, async (req, res) => {
  try {
    const { stage } = req.body;
    const candidateId = req.params.id;

    // Find the latest application for this candidate
    const latestApplication = await Application.findOne({
      where: { candidateId },
      order: [['createdAt', 'DESC']]
    });

    if (!latestApplication) {
      return res.status(404).json({ message: 'No application found for this candidate' });
    }

    // Update the application stage
    await latestApplication.update({ stage });

    res.json({ message: 'Candidate stage updated successfully' });
  } catch (error) {
    console.error('Error updating candidate stage:', error);
    res.status(500).json({ message: 'Error updating candidate stage' });
  }
});

// Star/unstar candidate
router.put('/:id/star', authenticate, async (req, res) => {
  try {
    const { starred } = req.body;
    const candidateId = req.params.id;

    const candidate = await User.findOne({
      where: {
        id: candidateId,
        role: 'candidate'
      }
    });

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    await candidate.update({ starred });

    res.json({ message: 'Candidate starred status updated successfully' });
  } catch (error) {
    console.error('Error updating candidate starred status:', error);
    res.status(500).json({ message: 'Error updating candidate starred status' });
  }
});

// Add notes to candidate
router.post('/:id/notes', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'recruiter' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to add notes' });
    }

    const { note } = req.body;
    const candidate = await User.findOne({
      where: {
        id: req.params.id,
        role: 'candidate'
      }
    });

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const notes = candidate.notes || [];
    notes.push({
      text: note,
      createdBy: req.user.id,
      createdAt: new Date()
    });

    await candidate.update({ notes });
    res.json({ message: 'Note added successfully', notes });
  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({ error: 'Failed to add note' });
  }
});

// Get candidate statistics
router.get('/stats/overview', authenticate, async (req, res) => {
  try {
    const stats = await Application.findAll({
      attributes: [
        'stage',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['stage']
    });

    const totalCandidates = await User.count({
      where: { role: 'candidate' }
    });

    res.json({
      stageStats: stats,
      totalCandidates
    });
  } catch (error) {
    console.error('Error fetching candidate statistics:', error);
    res.status(500).json({ message: 'Error fetching candidate statistics' });
  }
});

// Update candidate status
router.put('/:id/status', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'recruiter' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update candidate status' });
    }

    const { status } = req.body;
    const candidate = await User.findOne({
      where: {
        id: req.params.id,
        role: 'candidate'
      }
    });

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    await candidate.update({ status });
    res.json({ message: 'Status updated successfully', status });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

module.exports = router; 