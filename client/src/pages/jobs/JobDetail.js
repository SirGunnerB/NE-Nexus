import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  Stack,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip
} from '@mui/material';
import {
  BusinessCenter as BusinessIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Work as WorkIcon,
  AttachMoney as SalaryIcon,
  Group as DepartmentIcon,
  Computer as WorkplaceIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Share as ShareIcon,
  Flag as FlagIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../hooks/useNotification';
import Loading from '../../components/common/Loading';
import Error from '../../components/common/Error';
import ApplicationForm from '../../components/jobs/ApplicationForm';

const JobDetail = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { success, error: notifyError } = useNotification();
  
  const [openApply, setOpenApply] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  
  const {
    data: job,
    loading,
    error,
    execute: fetchJob
  } = useApi(`/jobs/${id}`);

  const {
    loading: savingJob,
    execute: toggleSaveJob
  } = useApi(`/jobs/${id}/save`, {
    method: 'POST'
  });

  const {
    loading: checkingApplication,
    execute: checkApplication
  } = useApi(`/applications/check/${id}`);

  useEffect(() => {
    fetchJob();
    if (user) {
      checkApplication().then(data => {
        setHasApplied(data.hasApplied);
      });
    }
  }, [id, user]);

  const handleSaveJob = async () => {
    try {
      await toggleSaveJob();
      setIsSaved(!isSaved);
      success(isSaved ? 'Job removed from saved jobs' : 'Job saved successfully');
    } catch (error) {
      notifyError('Failed to save job');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    success('Job link copied to clipboard');
  };

  const handleReport = () => {
    // Implement job reporting functionality
    success('Job reported successfully');
  };

  if (loading || checkingApplication) {
    return <Loading variant="page" text="Loading job details..." />;
  }

  if (error) {
    return (
      <Error
        variant="section"
        title="Failed to load job"
        message="There was an error loading the job details. Please try again."
        onRetry={() => fetchJob()}
      />
    );
  }

  const {
    title,
    company,
    location,
    type,
    experience,
    description,
    requirements,
    salary,
    skills,
    department,
    workplaceType,
    recruiter,
    createdAt
  } = job;

  const getTypeColor = (type) => {
    const colors = {
      'full-time': 'success',
      'part-time': 'info',
      'contract': 'warning',
      'internship': 'secondary'
    };
    return colors[type] || 'default';
  };

  const getExperienceColor = (level) => {
    const colors = {
      'entry': 'info',
      'mid': 'success',
      'senior': 'warning',
      'executive': 'error'
    };
    return colors[level] || 'default';
  };

  return (
    <Container maxWidth="lg">
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h4" gutterBottom>
                    {title}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                    <Avatar src={recruiter?.company?.logo} alt={company}>
                      {company.charAt(0)}
                    </Avatar>
                    <Typography variant="h6" color="text.secondary">
                      {company}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip
                      icon={<WorkIcon />}
                      label={type}
                      color={getTypeColor(type)}
                      size="small"
                    />
                    <Chip
                      icon={<BusinessIcon />}
                      label={experience}
                      color={getExperienceColor(experience)}
                      size="small"
                    />
                    <Chip
                      icon={<LocationIcon />}
                      label={location}
                      size="small"
                    />
                    <Chip
                      icon={<WorkplaceIcon />}
                      label={workplaceType}
                      size="small"
                    />
                  </Stack>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title={isSaved ? 'Remove from saved' : 'Save job'}>
                    <IconButton
                      onClick={handleSaveJob}
                      disabled={savingJob}
                    >
                      {isSaved ? <BookmarkIcon color="primary" /> : <BookmarkBorderIcon />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Share">
                    <IconButton onClick={handleShare}>
                      <ShareIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Report">
                    <IconButton onClick={handleReport}>
                      <FlagIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Job Description
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                  {description}
                </Typography>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Requirements
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                  {requirements}
                </Typography>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Required Skills
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {skills.map((skill) => (
                    <Chip
                      key={skill}
                      label={skill}
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Job Overview
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <SalaryIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Salary Range"
                      secondary={`${salary.currency} ${salary.min.toLocaleString()} - ${salary.max.toLocaleString()}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <DepartmentIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Department"
                      secondary={department}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <TimeIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Posted"
                      secondary={new Date(createdAt).toLocaleDateString()}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  About the Company
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    src={recruiter?.company?.logo}
                    alt={company}
                    sx={{ width: 64, height: 64, mr: 2 }}
                  >
                    {company.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1">
                      {company}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {recruiter?.company?.industry}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {recruiter?.company?.description}
                </Typography>
              </CardContent>
            </Card>

            <Box sx={{ position: 'sticky', top: theme.spacing(3) }}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={() => setOpenApply(true)}
                disabled={hasApplied}
              >
                {hasApplied ? 'Already Applied' : 'Apply Now'}
              </Button>
            </Box>
          </Stack>
        </Grid>
      </Grid>

      <Dialog
        open={openApply}
        onClose={() => setOpenApply(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Apply for {title}
        </DialogTitle>
        <DialogContent dividers>
          <ApplicationForm
            jobId={id}
            onSuccess={() => {
              setOpenApply(false);
              setHasApplied(true);
              success('Application submitted successfully');
            }}
            onError={(error) => {
              notifyError(error || 'Failed to submit application');
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenApply(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default JobDetail; 