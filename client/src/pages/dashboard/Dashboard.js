import React from 'react';
import { useSelector } from 'react-redux';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardHeader,
} from '@mui/material';
import {
  Work as JobIcon,
  People as CandidatesIcon,
  Business as CompanyIcon,
  Assessment as ReportsIcon,
} from '@mui/icons-material';

const StatCard = ({ title, value, icon, color }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {React.cloneElement(icon, { sx: { color, fontSize: 40, mr: 2 } })}
        <Typography variant="h6" component="div">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div" sx={{ color }}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const RecruiterDashboard = () => (
  <Grid container spacing={3}>
    <Grid item xs={12} sm={6} md={3}>
      <StatCard
        title="Active Jobs"
        value="12"
        icon={<JobIcon />}
        color="#1976d2"
      />
    </Grid>
    <Grid item xs={12} sm={6} md={3}>
      <StatCard
        title="Total Candidates"
        value="48"
        icon={<CandidatesIcon />}
        color="#2e7d32"
      />
    </Grid>
    <Grid item xs={12} sm={6} md={3}>
      <StatCard
        title="Companies"
        value="8"
        icon={<CompanyIcon />}
        color="#ed6c02"
      />
    </Grid>
    <Grid item xs={12} sm={6} md={3}>
      <StatCard
        title="Interviews"
        value="15"
        icon={<ReportsIcon />}
        color="#9c27b0"
      />
    </Grid>
    <Grid item xs={12}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Recent Activity
        </Typography>
        {/* Add activity feed here */}
      </Paper>
    </Grid>
  </Grid>
);

const CandidateDashboard = () => (
  <Grid container spacing={3}>
    <Grid item xs={12} sm={6} md={3}>
      <StatCard
        title="Applied Jobs"
        value="5"
        icon={<JobIcon />}
        color="#1976d2"
      />
    </Grid>
    <Grid item xs={12} sm={6} md={3}>
      <StatCard
        title="Interviews"
        value="2"
        icon={<ReportsIcon />}
        color="#9c27b0"
      />
    </Grid>
    <Grid item xs={12}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Recommended Jobs
        </Typography>
        {/* Add job recommendations here */}
      </Paper>
    </Grid>
  </Grid>
);

const Dashboard = () => {
  const user = useSelector((state) => state.auth.user);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.firstName}!
      </Typography>
      {user?.role === 'candidate' ? <CandidateDashboard /> : <RecruiterDashboard />}
    </Box>
  );
};

export default Dashboard; 