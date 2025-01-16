import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Grid,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  LocationOn,
  Business,
  WorkOutline,
  AttachMoney,
  Edit as EditIcon,
} from '@mui/icons-material';
import { fetchJob } from '../../redux/slices/jobSlice';

const JobDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentJob: job, loading, error } = useSelector((state) => state.jobs);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    dispatch(fetchJob(id));
  }, [dispatch, id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!job) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Job not found
      </Alert>
    );
  }

  const canEdit = user?.role !== 'candidate' && job.recruiterId === user?.id;

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h4" component="h1">
            {job.title}
          </Typography>
          {canEdit && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/dashboard/jobs/edit/${id}`)}
            >
              Edit Job
            </Button>
          )}
        </Box>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Business sx={{ mr: 1 }} color="action" />
              <Typography variant="body1">{job.company}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationOn sx={{ mr: 1 }} color="action" />
              <Typography variant="body1">{job.location}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <WorkOutline sx={{ mr: 1 }} color="action" />
              <Typography variant="body1">
                {job.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Typography>
            </Box>
          </Grid>
          {job.salary && (
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AttachMoney sx={{ mr: 1 }} color="action" />
                <Typography variant="body1">
                  {`${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()} ${job.salary.currency}`}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Chip
              label={job.experience.toUpperCase()}
              color="primary"
              variant="outlined"
            />
            {job.skills.map((skill) => (
              <Chip key={skill} label={skill} />
            ))}
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Job Description
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
            {job.description}
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Requirements
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
            {job.requirements}
          </Typography>
        </Box>

        {job.benefits && job.benefits.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Benefits
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {job.benefits.map((benefit) => (
                <Chip key={benefit} label={benefit} variant="outlined" />
              ))}
            </Box>
          </Box>
        )}

        {user?.role === 'candidate' && job.status === 'published' && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => {
                // TODO: Implement apply functionality
                alert('Application functionality coming soon!');
              }}
            >
              Apply Now
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default JobDetail; 