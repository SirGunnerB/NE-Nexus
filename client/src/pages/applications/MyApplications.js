import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { fetchMyApplications, withdrawApplication } from '../../redux/slices/applicationSlice';

const statusColors = {
  pending: 'default',
  reviewed: 'info',
  shortlisted: 'primary',
  interview_scheduled: 'warning',
  interviewed: 'warning',
  offered: 'success',
  accepted: 'success',
  rejected: 'error',
  withdrawn: 'error',
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const MyApplications = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { myApplications, loading, error } = useSelector((state) => state.applications);

  useEffect(() => {
    dispatch(fetchMyApplications());
  }, [dispatch]);

  const handleWithdraw = async (id) => {
    if (window.confirm('Are you sure you want to withdraw this application?')) {
      try {
        await dispatch(withdrawApplication(id)).unwrap();
      } catch (error) {
        console.error('Error withdrawing application:', error);
      }
    }
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
      <Typography variant="h5" gutterBottom>
        My Applications
      </Typography>

      {myApplications.length === 0 ? (
        <Alert severity="info">
          You haven't applied to any jobs yet.
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Job Title</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Applied On</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Interview Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {myApplications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {application.Job.title}
                    </Typography>
                  </TableCell>
                  <TableCell>{application.Job.company}</TableCell>
                  <TableCell>{formatDate(application.createdAt)}</TableCell>
                  <TableCell>
                    <Chip
                      label={application.status.replace('_', ' ').toUpperCase()}
                      color={statusColors[application.status]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {application.interviewDate
                      ? formatDate(application.interviewDate)
                      : '-'}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/dashboard/jobs/${application.Job.id}`)}
                      title="View Job"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    {application.status === 'pending' && (
                      <IconButton
                        size="small"
                        onClick={() => handleWithdraw(application.id)}
                        title="Withdraw Application"
                        color="error"
                      >
                        <CloseIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default MyApplications; 