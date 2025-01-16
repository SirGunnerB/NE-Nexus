import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Grid,
} from '@mui/material';
import { setFilters, clearFilters } from '../../redux/slices/jobSlice';

const jobTypes = [
  { value: 'full-time', label: 'Full Time' },
  { value: 'part-time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
];

const experienceLevels = [
  { value: 'entry', label: 'Entry Level' },
  { value: 'mid', label: 'Mid Level' },
  { value: 'senior', label: 'Senior Level' },
  { value: 'executive', label: 'Executive Level' },
];

const JobFilters = () => {
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.jobs.filters);
  const user = useSelector((state) => state.auth.user);

  const handleFilterChange = (field) => (event) => {
    dispatch(setFilters({ [field]: event.target.value }));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Search Jobs"
            value={filters.search}
            onChange={handleFilterChange('search')}
            placeholder="Search by title, company, or location"
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <FormControl fullWidth>
            <InputLabel>Job Type</InputLabel>
            <Select
              value={filters.type || ''}
              label="Job Type"
              onChange={handleFilterChange('type')}
            >
              <MenuItem value="">All Types</MenuItem>
              {jobTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={2}>
          <FormControl fullWidth>
            <InputLabel>Experience</InputLabel>
            <Select
              value={filters.experience || ''}
              label="Experience"
              onChange={handleFilterChange('experience')}
            >
              <MenuItem value="">All Levels</MenuItem>
              {experienceLevels.map((level) => (
                <MenuItem key={level.value} value={level.value}>
                  {level.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        {user?.role === 'recruiter' && (
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status || ''}
                label="Status"
                onChange={handleFilterChange('status')}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="published">Published</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        )}
        <Grid item xs={12} sm={2}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={handleClearFilters}
              sx={{ height: '56px' }}
              fullWidth
            >
              Clear Filters
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default JobFilters; 