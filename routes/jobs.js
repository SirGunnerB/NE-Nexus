const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { authenticateToken, checkRole } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Get all jobs (accessible by all authenticated users)
router.get('/', jobController.getJobs);

// Get job statistics
router.get('/stats', jobController.getJobStats);

// Get a single job (accessible by all authenticated users)
router.get('/:id', jobController.getJob);

// Create a job (recruiter only)
router.post(
  '/',
  checkRole(['recruiter', 'hiring_manager']),
  jobController.createJob
);

// Update a job (recruiter only)
router.put(
  '/:id',
  checkRole(['recruiter', 'hiring_manager']),
  jobController.updateJob
);

// Delete a job (recruiter only)
router.delete(
  '/:id',
  checkRole(['recruiter', 'hiring_manager']),
  jobController.deleteJob
);

module.exports = router; 