import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Avatar,
  Stack,
  Divider,
  useTheme,
  Tooltip
} from '@mui/material';
import {
  BusinessCenter as BusinessIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Work as WorkIcon,
  AttachMoney as SalaryIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Visibility as ViewsIcon,
  Description as ApplicationsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const JobCard = ({ job, onSave, isSaved }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const {
    id,
    title,
    company,
    location,
    type,
    experience,
    salary,
    skills,
    createdAt,
    views,
    applicationCount,
    recruiter
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

  const formatSalary = (salary) => {
    return `${salary.currency} ${salary.min.toLocaleString()} - ${salary.max.toLocaleString()}`;
  };

  const handleClick = () => {
    navigate(`/dashboard/jobs/${id}`);
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[4]
        }
      }}
      onClick={handleClick}
    >
      <CardContent sx={{ flex: 1, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={recruiter?.company?.logo}
              alt={company}
              sx={{
                width: 48,
                height: 48,
                bgcolor: theme.palette.primary.main
              }}
            >
              {company.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6" gutterBottom>
                {title}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                {company}
              </Typography>
            </Box>
          </Box>
          <Tooltip title={isSaved ? 'Remove from saved' : 'Save job'}>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onSave(id);
              }}
              sx={{ color: isSaved ? 'primary.main' : 'action.disabled' }}
            >
              {isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
            </IconButton>
          </Tooltip>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
          <Chip
            icon={<WorkIcon />}
            label={type}
            size="small"
            color={getTypeColor(type)}
          />
          <Chip
            icon={<BusinessIcon />}
            label={experience}
            size="small"
            color={getExperienceColor(experience)}
          />
          <Chip
            icon={<LocationIcon />}
            label={location}
            size="small"
          />
        </Stack>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" paragraph>
            Required Skills:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {skills.slice(0, 3).map((skill) => (
              <Chip
                key={skill}
                label={skill}
                size="small"
                variant="outlined"
              />
            ))}
            {skills.length > 3 && (
              <Chip
                label={`+${skills.length - 3}`}
                size="small"
                variant="outlined"
              />
            )}
          </Stack>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <SalaryIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {formatSalary(salary)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TimeIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {new Date(createdAt).toLocaleDateString()}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={2}>
            <Tooltip title="Views">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ViewsIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {views}
                </Typography>
              </Box>
            </Tooltip>
            <Tooltip title="Applications">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ApplicationsIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {applicationCount}
                </Typography>
              </Box>
            </Tooltip>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

export default JobCard; 