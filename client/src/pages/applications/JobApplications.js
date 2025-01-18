import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  CircularProgress,
  Alert,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  Card,
  CardContent,
  Stack,
  TableSortLabel,
  Toolbar,
  Tooltip,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Email as EmailIcon,
  Description as DescriptionIcon,
  FilterList as FilterListIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  CalendarMonth as CalendarIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { fetchJobApplications, updateApplicationStatus } from '../../redux/slices/applicationSlice';
import { fetchJob } from '../../redux/slices/jobSlice';
import EmailTemplateDialog from '../../components/applications/EmailTemplateDialog';

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

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'interview_scheduled', label: 'Interview Scheduled' },
  { value: 'interviewed', label: 'Interviewed' },
  { value: 'offered', label: 'Offered' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
];

const formatDate = (dateString) => {
  return dateString
    ? new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '-';
};

const JobApplications = () => {
  const { jobId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { jobApplications, loading, error } = useSelector((state) => state.applications);
  const { currentJob: job } = useSelector((state) => state.jobs);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statsDialogOpen, setStatsDialogOpen] = useState(false);
  const [emailTemplateDialogOpen, setEmailTemplateDialogOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  
  // Filtering and sorting state
  const [filters, setFilters] = useState({
    status: '',
    rating: '',
    dateRange: 'all',
  });
  const [orderBy, setOrderBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  
  // Bulk actions state
  const [selected, setSelected] = useState([]);
  
  useEffect(() => {
    dispatch(fetchJob(jobId));
    dispatch(fetchJobApplications(jobId));
  }, [dispatch, jobId]);

  // Filtering logic
  const filteredApplications = jobApplications.filter((app) => {
    if (filters.status && app.status !== filters.status) return false;
    if (filters.rating && app.rating !== parseInt(filters.rating)) return false;
    if (filters.dateRange !== 'all') {
      const date = new Date(app.createdAt);
      const now = new Date();
      switch (filters.dateRange) {
        case 'today':
          return date.toDateString() === now.toDateString();
        case 'week':
          return date >= new Date(now - 7 * 24 * 60 * 60 * 1000);
        case 'month':
          return date >= new Date(now.setMonth(now.getMonth() - 1));
        default:
          return true;
      }
    }
    return true;
  });

  // Sorting logic
  const sortedApplications = [...filteredApplications].sort((a, b) => {
    const isAsc = order === 'asc';
    switch (orderBy) {
      case 'name':
        return isAsc
          ? a.candidate.name.localeCompare(b.candidate.name)
          : b.candidate.name.localeCompare(a.candidate.name);
      case 'status':
        return isAsc
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status);
      case 'rating':
        return isAsc
          ? (a.rating || 0) - (b.rating || 0)
          : (b.rating || 0) - (a.rating || 0);
      case 'createdAt':
      default:
        return isAsc
          ? new Date(a.createdAt) - new Date(b.createdAt)
          : new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  // Statistics calculations
  const stats = {
    total: jobApplications.length,
    byStatus: jobApplications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {}),
    averageRating: jobApplications.reduce((acc, app) => acc + (app.rating || 0), 0) / 
      (jobApplications.filter(app => app.rating).length || 1),
    interviewScheduled: jobApplications.filter(app => app.interviewDate).length,
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(sortedApplications.map(app => app.id));
    } else {
      setSelected([]);
    }
  };

  const handleSelect = (id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [...selected, id];
    } else {
      newSelected = selected.filter(item => item !== id);
    }

    setSelected(newSelected);
  };

  const handleBulkAction = async (action) => {
    if (window.confirm(`Are you sure you want to ${action} the selected applications?`)) {
      try {
        await Promise.all(
          selected.map(id =>
            dispatch(updateApplicationStatus({
              id,
              data: { status: action === 'shortlist' ? 'shortlisted' : 'rejected' }
            })).unwrap()
          )
        );
        setSelected([]);
      } catch (error) {
        console.error('Error performing bulk action:', error);
      }
    }
  };

  const handleOpenDialog = (application) => {
    setSelectedApplication(application);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedApplication(null);
    setDialogOpen(false);
  };

  const handleUpdateStatus = async (values) => {
    try {
      await dispatch(
        updateApplicationStatus({
          id: selectedApplication.id,
          data: values,
        })
      ).unwrap();
      handleCloseDialog();
    } catch (error) {
      console.error('Error updating application:', error);
    }
  };

  const handleEmailClick = (candidate) => {
    setSelectedCandidate(candidate);
    setEmailTemplateDialogOpen(true);
  };

  const handleSendEmail = (subject, body) => {
    const mailtoUrl = `mailto:${selectedCandidate.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  if (loading || !job) {
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
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <div>
            <Typography variant="h5" gutterBottom>
              Applications for {job.title}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {job.company} • {job.location}
            </Typography>
          </div>
          <Button
            variant="outlined"
            startIcon={<AssessmentIcon />}
            onClick={() => setStatsDialogOpen(true)}
          >
            View Statistics
          </Button>
        </Box>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <MenuItem value="">All</MenuItem>
                  {statusOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Rating</InputLabel>
                <Select
                  value={filters.rating}
                  label="Rating"
                  onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
                >
                  <MenuItem value="">All</MenuItem>
                  {[1, 2, 3, 4, 5].map(rating => (
                    <MenuItem key={rating} value={rating}>
                      {rating} Star{rating !== 1 ? 's' : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Date Range</InputLabel>
                <Select
                  value={filters.dateRange}
                  label="Date Range"
                  onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                >
                  <MenuItem value="all">All Time</MenuItem>
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="week">Last 7 Days</MenuItem>
                  <MenuItem value="month">Last 30 Days</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setFilters({ status: '', rating: '', dateRange: 'all' })}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {sortedApplications.length === 0 ? (
        <Alert severity="info">No applications match the current filters.</Alert>
      ) : (
        <>
          {/* Bulk Actions Toolbar */}
          {selected.length > 0 && (
            <Toolbar
              sx={{
                pl: 2,
                pr: 1,
                bgcolor: 'background.paper',
                mb: 2,
              }}
            >
              <Typography sx={{ flex: '1 1 100%' }} color="inherit" variant="subtitle1">
                {selected.length} selected
              </Typography>
              <Tooltip title="Shortlist Selected">
                <IconButton onClick={() => handleBulkAction('shortlist')}>
                  <CheckCircleIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reject Selected">
                <IconButton onClick={() => handleBulkAction('reject')}>
                  <CancelIcon />
                </IconButton>
              </Tooltip>
            </Toolbar>
          )}

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selected.length > 0 && selected.length < sortedApplications.length}
                      checked={selected.length === sortedApplications.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'name'}
                      direction={orderBy === 'name' ? order : 'asc'}
                      onClick={() => handleSort('name')}
                    >
                      Candidate
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'createdAt'}
                      direction={orderBy === 'createdAt' ? order : 'asc'}
                      onClick={() => handleSort('createdAt')}
                    >
                      Applied On
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'status'}
                      direction={orderBy === 'status' ? order : 'asc'}
                      onClick={() => handleSort('status')}
                    >
                      Status
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'rating'}
                      direction={orderBy === 'rating' ? order : 'asc'}
                      onClick={() => handleSort('rating')}
                    >
                      Rating
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Interview Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedApplications.map((application) => (
                  <TableRow
                    key={application.id}
                    selected={selected.includes(application.id)}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selected.includes(application.id)}
                        onChange={() => handleSelect(application.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {application.candidate.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {application.candidate.email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{formatDate(application.createdAt)}</TableCell>
                    <TableCell>
                      <Chip
                        label={application.status.replace('_', ' ').toUpperCase()}
                        color={statusColors[application.status]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {application.rating ? `${application.rating}/5` : '-'}
                    </TableCell>
                    <TableCell>{formatDate(application.interviewDate)}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleEmailClick(application.candidate)}
                        title="Send Email"
                      >
                        <EmailIcon />
                      </IconButton>
                      {application.resumePath && (
                        <IconButton
                          size="small"
                          href={application.resumePath}
                          target="_blank"
                          title="View Resume"
                        >
                          <DescriptionIcon />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(application)}
                        title="Review Application"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Application Review Dialog */}
      {selectedApplication && (
        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Review Application</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Cover Letter
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {selectedApplication.coverLetter}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Status"
                  value={selectedApplication.status}
                  onChange={(e) =>
                    handleUpdateStatus({ status: e.target.value })
                  }
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  type="date"
                  fullWidth
                  label="Interview Date"
                  value={selectedApplication.interviewDate?.split('T')[0] || ''}
                  onChange={(e) =>
                    handleUpdateStatus({ interviewDate: e.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Rating"
                  value={selectedApplication.rating || ''}
                  onChange={(e) =>
                    handleUpdateStatus({ rating: e.target.value })
                  }
                >
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <MenuItem key={rating} value={rating}>
                      {rating} Star{rating !== 1 ? 's' : ''}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Notes"
                  value={selectedApplication.notes || ''}
                  onChange={(e) =>
                    handleUpdateStatus({ notes: e.target.value })
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Feedback"
                  value={selectedApplication.feedback || ''}
                  onChange={(e) =>
                    handleUpdateStatus({ feedback: e.target.value })
                  }
                  helperText="This feedback will be visible to the candidate"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Close</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Statistics Dialog */}
      <Dialog
        open={statsDialogOpen}
        onClose={() => setStatsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Application Statistics</DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Overview
                  </Typography>
                  <Typography variant="body1">
                    Total Applications: {stats.total}
                  </Typography>
                  <Typography variant="body1">
                    Average Rating: {stats.averageRating.toFixed(1)}/5
                  </Typography>
                  <Typography variant="body1">
                    Interviews Scheduled: {stats.interviewScheduled}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Status Breakdown
                  </Typography>
                  <Stack spacing={1}>
                    {Object.entries(stats.byStatus).map(([status, count]) => (
                      <Box
                        key={status}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Chip
                          label={status.replace('_', ' ').toUpperCase()}
                          color={statusColors[status]}
                          size="small"
                        />
                        <Typography>
                          {count} ({((count / stats.total) * 100).toFixed(1)}%)
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <EmailTemplateDialog
        open={emailTemplateDialogOpen}
        onClose={() => setEmailTemplateDialogOpen(false)}
        candidate={selectedCandidate}
        position={job.title}
        company={job.company}
        onSend={handleSendEmail}
      />
    </Box>
  );
};

export default JobApplications; 