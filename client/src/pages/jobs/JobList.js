import React, { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  InputAdornment,
  useTheme,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Pagination,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { usePaginatedApi } from '../../hooks/useApi';
import { useNotification } from '../../hooks/useNotification';
import Loading from '../../components/common/Loading';
import Error from '../../components/common/Error';
import JobCard from '../../components/jobs/JobCard';

const JobList = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { error: notifyError } = useNotification();
  
  // State for filters
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    experience: 'all',
    location: 'all'
  });
  
  // State for saved jobs
  const [savedJobs, setSavedJobs] = useState([]);
  
  // API hooks
  const {
    data,
    loading,
    error,
    page,
    totalPages,
    fetchPage
  } = usePaginatedApi('/jobs');
  
  // Fetch jobs on mount and when filters change
  useEffect(() => {
    fetchPage(page, filters).catch(err => {
      notifyError('Failed to fetch jobs');
    });
  }, [page, filters]);
  
  // Handle filter changes
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      search: '',
      type: 'all',
      experience: 'all',
      location: 'all'
    });
  };
  
  // Handle job save/unsave
  const handleSaveJob = async (jobId) => {
    try {
      if (savedJobs.includes(jobId)) {
        await axios.delete(`/jobs/${jobId}/save`);
        setSavedJobs(prev => prev.filter(id => id !== jobId));
      } else {
        await axios.post(`/jobs/${jobId}/save`);
        setSavedJobs(prev => [...prev, jobId]);
      }
    } catch (error) {
      notifyError('Failed to save job');
    }
  };

  if (loading && !data) {
    return <Loading variant="page" text="Loading jobs..." />;
  }

  if (error) {
    return (
      <Error
        variant="section"
        title="Failed to load jobs"
        message="There was an error loading the job listings. Please try again."
        onRetry={() => fetchPage(page, filters)}
      />
    );
  }

  const { jobs = [] } = data || {};

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h4" gutterBottom>
              Job Listings
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {totalPages > 0 ? `${jobs.length} jobs found` : 'No jobs found'}
            </Typography>
          </Grid>
          {user?.role === 'recruiter' && (
            <Grid item>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/dashboard/jobs/create')}
              >
                Post New Job
              </Button>
            </Grid>
          )}
        </Grid>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search jobs..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  label="Type"
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="full-time">Full Time</MenuItem>
                  <MenuItem value="part-time">Part Time</MenuItem>
                  <MenuItem value="contract">Contract</MenuItem>
                  <MenuItem value="internship">Internship</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Experience</InputLabel>
                <Select
                  name="experience"
                  value={filters.experience}
                  onChange={handleFilterChange}
                  label="Experience"
                >
                  <MenuItem value="all">All Levels</MenuItem>
                  <MenuItem value="entry">Entry Level</MenuItem>
                  <MenuItem value="mid">Mid Level</MenuItem>
                  <MenuItem value="senior">Senior Level</MenuItem>
                  <MenuItem value="executive">Executive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Location</InputLabel>
                <Select
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  label="Location"
                >
                  <MenuItem value="all">All Locations</MenuItem>
                  <MenuItem value="remote">Remote</MenuItem>
                  <MenuItem value="hybrid">Hybrid</MenuItem>
                  <MenuItem value="onsite">On-site</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center' }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={handleClearFilters}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>

          {Object.entries(filters).some(([key, value]) => value !== 'all' && value !== '') && (
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {Object.entries(filters).map(([key, value]) => {
                if (value === 'all' || value === '') return null;
                return (
                  <Chip
                    key={key}
                    label={`${key}: ${value}`}
                    onDelete={() => handleFilterChange({
                      target: { name: key, value: key === 'search' ? '' : 'all' }
                    })}
                  />
                );
              })}
            </Box>
          )}
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {jobs.map(job => (
          <Grid item xs={12} md={6} lg={4} key={job.id}>
            <JobCard
              job={job}
              onSave={() => handleSaveJob(job.id)}
              isSaved={savedJobs.includes(job.id)}
            />
          </Grid>
        ))}
      </Grid>

      {totalPages > 1 && (
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(event, value) => fetchPage(value, filters)}
            color="primary"
            size="large"
          />
        </Box>
      )}
    </Container>
  );
};

export default JobList; 