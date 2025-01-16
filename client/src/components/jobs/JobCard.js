import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Button,
} from '@mui/material';
import {
  LocationOn,
  Business,
  WorkOutline,
  MoreVert,
  Edit,
  Delete,
  Visibility,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { deleteJob } from '../../redux/slices/jobSlice';

const JobCard = ({ job }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    navigate(`/dashboard/jobs/edit/${job.id}`);
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      await dispatch(deleteJob(job.id));
    }
    handleMenuClose();
  };

  const handleView = () => {
    navigate(`/dashboard/jobs/${job.id}`);
    handleMenuClose();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'draft':
        return 'warning';
      case 'closed':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" component="div">
            {job.title}
          </Typography>
          {user?.role !== 'candidate' && (
            <>
              <IconButton size="small" onClick={handleMenuOpen}>
                <MoreVert />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleView}>
                  <Visibility sx={{ mr: 1 }} /> View
                </MenuItem>
                <MenuItem onClick={handleEdit}>
                  <Edit sx={{ mr: 1 }} /> Edit
                </MenuItem>
                <MenuItem onClick={handleDelete}>
                  <Delete sx={{ mr: 1 }} /> Delete
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Business sx={{ mr: 1 }} color="action" />
          <Typography variant="body2" color="text.secondary">
            {job.company}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LocationOn sx={{ mr: 1 }} color="action" />
          <Typography variant="body2" color="text.secondary">
            {job.location}
          </Typography>
          <WorkOutline sx={{ mr: 1, ml: 2 }} color="action" />
          <Typography variant="body2" color="text.secondary">
            {job.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Chip
            label={job.experience.toUpperCase()}
            size="small"
            color="primary"
            variant="outlined"
          />
          {user?.role !== 'candidate' && (
            <Chip
              label={job.status.toUpperCase()}
              size="small"
              color={getStatusColor(job.status)}
            />
          )}
          {job.skills.slice(0, 3).map((skill) => (
            <Chip key={skill} label={skill} size="small" />
          ))}
        </Box>

        {user?.role === 'candidate' && job.status === 'published' && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate(`/dashboard/jobs/${job.id}`)}
            >
              View Details
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default JobCard; 