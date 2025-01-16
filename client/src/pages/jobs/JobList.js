import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Pagination,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import JobFilters from '../../components/jobs/JobFilters';
import JobCard from '../../components/jobs/JobCard';
import { fetchJobs } from '../../redux/slices/jobSlice';

const JobList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    jobs,
    totalPages,
    currentPage,
    loading,
    error,
    filters
  } = useSelector((state) => state.jobs);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    dispatch(fetchJobs({ ...filters, page: currentPage }));
  }, [dispatch, filters, currentPage]);

  const handlePageChange = (event, value) => {
    dispatch(fetchJobs({ ...filters, page: value }));
  };

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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Job Listings
        </Typography>
        {user?.role !== 'candidate' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/dashboard/jobs/create')}
          >
            Post New Job
          </Button>
        )}
      </Box>

      <JobFilters />

      {jobs.length === 0 ? (
        <Alert severity="info">
          No jobs found. Try adjusting your filters.
        </Alert>
      ) : (
        <>
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </>
      )}
    </Box>
  );
};

export default JobList; 