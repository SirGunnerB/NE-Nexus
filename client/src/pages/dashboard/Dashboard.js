import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  useTheme,
  alpha,
  Chip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  WorkOutline as JobIcon,
  Description as ApplicationIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  MoreVert as MoreIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import axios from '../../utils/axios';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    totalCandidates: 0,
    jobStats: [],
    applicationStats: [],
    recentApplications: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const StatCard = ({ title, value, icon, trend, color }) => (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {value.toLocaleString()}
            </Typography>
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {trend > 0 ? (
                  <ArrowUpIcon sx={{ color: theme.palette.success.main, fontSize: 20 }} />
                ) : (
                  <ArrowDownIcon sx={{ color: theme.palette.error.main, fontSize: 20 }} />
                )}
                <Typography
                  variant="body2"
                  sx={{
                    color: trend > 0 ? theme.palette.success.main : theme.palette.error.main,
                    fontWeight: 500
                  }}
                >
                  {Math.abs(trend)}% from last month
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar
            sx={{
              backgroundColor: alpha(color, 0.1),
              color: color,
              width: 48,
              height: 48
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: theme.palette.divider
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  const barChartOptions = {
    ...lineChartOptions,
    barThickness: 12,
    maxBarThickness: 20
  };

  const applicationData = {
    labels: stats.applicationStats.map(stat => stat.date),
    datasets: [
      {
        label: 'Applications',
        data: stats.applicationStats.map(stat => stat.count),
        fill: true,
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        borderColor: theme.palette.primary.main,
        tension: 0.4
      }
    ]
  };

  const jobData = {
    labels: stats.jobStats.map(stat => stat.date),
    datasets: [
      {
        label: 'Jobs Posted',
        data: stats.jobStats.map(stat => stat.count),
        backgroundColor: theme.palette.secondary.main
      }
    ]
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Dashboard
          </Typography>
          {user?.role === 'recruiter' && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/dashboard/jobs/create')}
              sx={{
                px: 3,
                py: 1,
                borderRadius: 2,
                background: theme.palette.primary.gradient
              }}
            >
              Post a Job
            </Button>
          )}
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Jobs"
              value={stats.totalJobs}
              icon={<JobIcon />}
              trend={12}
              color={theme.palette.primary.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Jobs"
              value={stats.activeJobs}
              icon={<TrendingUpIcon />}
              trend={-5}
              color={theme.palette.success.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Applications"
              value={stats.totalApplications}
              icon={<ApplicationIcon />}
              trend={8}
              color={theme.palette.warning.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Candidates"
              value={stats.totalCandidates}
              icon={<PeopleIcon />}
              trend={15}
              color={theme.palette.info.main}
            />
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">Application Trends</Typography>
                  <IconButton size="small">
                    <MoreIcon />
                  </IconButton>
                </Box>
                <Box sx={{ height: 350 }}>
                  <Line options={lineChartOptions} data={applicationData} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">Jobs Posted</Typography>
                  <IconButton size="small">
                    <MoreIcon />
                  </IconButton>
                </Box>
                <Box sx={{ height: 350 }}>
                  <Bar options={barChartOptions} data={jobData} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Recent Applications */}
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Recent Applications</Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate('/dashboard/applications')}
              >
                View All
              </Button>
            </Box>
            <List>
              {stats.recentApplications.map((application, index) => (
                <React.Fragment key={application.id}>
                  <ListItem
                    sx={{ px: 0, py: 2 }}
                    secondaryAction={
                      <Chip
                        label={application.status}
                        size="small"
                        sx={{
                          backgroundColor: (() => {
                            switch (application.status) {
                              case 'pending': return alpha(theme.palette.warning.main, 0.1);
                              case 'reviewed': return alpha(theme.palette.info.main, 0.1);
                              case 'shortlisted': return alpha(theme.palette.success.main, 0.1);
                              case 'rejected': return alpha(theme.palette.error.main, 0.1);
                              default: return alpha(theme.palette.grey[500], 0.1);
                            }
                          })(),
                          color: (() => {
                            switch (application.status) {
                              case 'pending': return theme.palette.warning.main;
                              case 'reviewed': return theme.palette.info.main;
                              case 'shortlisted': return theme.palette.success.main;
                              case 'rejected': return theme.palette.error.main;
                              default: return theme.palette.grey[500];
                            }
                          })()
                        }}
                      />
                    }
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                        {application.candidate.name.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={application.candidate.name}
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          Applied for {application.job.title} • {new Date(application.createdAt).toLocaleDateString()}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < stats.recentApplications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Dashboard; 