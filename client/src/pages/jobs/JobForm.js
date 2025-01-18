import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Divider,
  Alert,
  useTheme
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from '../../hooks/useForm';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../hooks/useNotification';
import Loading from '../../components/common/Loading';
import Error from '../../components/common/Error';
import * as yup from 'yup';

const validationSchema = yup.object({
  title: yup.string().required('Title is required'),
  company: yup.string().required('Company is required'),
  location: yup.string().required('Location is required'),
  type: yup.string().required('Job type is required'),
  experience: yup.string().required('Experience level is required'),
  description: yup.string().required('Description is required').min(100, 'Description should be at least 100 characters'),
  requirements: yup.string().required('Requirements are required'),
  salary: yup.object({
    min: yup.number().min(0, 'Minimum salary must be positive'),
    max: yup.number().min(0, 'Maximum salary must be positive')
      .test('max', 'Maximum salary must be greater than minimum salary', 
        function(value) {
          return !value || !this.parent.min || value >= this.parent.min;
        }),
    currency: yup.string().required('Currency is required')
  }),
  skills: yup.array().of(yup.string()).min(1, 'At least one skill is required'),
  department: yup.string().required('Department is required'),
  workplaceType: yup.string().required('Workplace type is required')
});

const initialValues = {
  title: '',
  company: '',
  location: '',
  type: '',
  experience: '',
  description: '',
  requirements: '',
  salary: {
    min: 0,
    max: 0,
    currency: 'USD'
  },
  skills: [],
  department: '',
  workplaceType: '',
  status: 'draft'
};

const JobForm = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const { success, error: notifyError } = useNotification();
  const [newSkill, setNewSkill] = useState('');
  
  const {
    data: job,
    loading: loadingJob,
    error: loadError,
    execute: fetchJob
  } = useApi(`/jobs/${id}`);

  const {
    loading: submitting,
    error: submitError,
    execute: submitJob
  } = useApi('/jobs', { method: id ? 'PUT' : 'POST' });

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setValues,
    isValid,
    isDirty
  } = useForm(initialValues, validationSchema, async (formData) => {
    try {
      const endpoint = id ? `/jobs/${id}` : '/jobs';
      const response = await submitJob(formData);
      success('Job successfully saved');
      navigate('/dashboard/jobs');
    } catch (error) {
      notifyError('Failed to save job');
    }
  });

  useEffect(() => {
    if (id) {
      fetchJob().then(data => {
        if (data) {
          setValues(data);
        }
      });
    }
  }, [id]);

  const handleAddSkill = () => {
    if (newSkill && !values.skills.includes(newSkill)) {
      setFieldValue('skills', [...values.skills, newSkill]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFieldValue('skills', values.skills.filter(skill => skill !== skillToRemove));
  };

  if (loadingJob) {
    return <Loading variant="page" text="Loading job details..." />;
  }

  if (loadError) {
    return (
      <Error
        variant="section"
        title="Failed to load job"
        message="There was an error loading the job details. Please try again."
        onRetry={() => fetchJob()}
      />
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {id ? 'Edit Job' : 'Create New Job'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Fill in the details below to {id ? 'update the' : 'create a new'} job posting
        </Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Job Title"
                    name="title"
                    value={values.title}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.title && Boolean(errors.title)}
                    helperText={touched.title && errors.title}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Company"
                    name="company"
                    value={values.company}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.company && Boolean(errors.company)}
                    helperText={touched.company && errors.company}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Location"
                    name="location"
                    value={values.location}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.location && Boolean(errors.location)}
                    helperText={touched.location && errors.location}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={touched.type && Boolean(errors.type)}>
                    <InputLabel>Job Type</InputLabel>
                    <Select
                      name="type"
                      value={values.type}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      label="Job Type"
                    >
                      <MenuItem value="full-time">Full Time</MenuItem>
                      <MenuItem value="part-time">Part Time</MenuItem>
                      <MenuItem value="contract">Contract</MenuItem>
                      <MenuItem value="internship">Internship</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Job Details
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    label="Job Description"
                    name="description"
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.description && Boolean(errors.description)}
                    helperText={touched.description && errors.description}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Requirements"
                    name="requirements"
                    value={values.requirements}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.requirements && Boolean(errors.requirements)}
                    helperText={touched.requirements && errors.requirements}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Additional Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={touched.experience && Boolean(errors.experience)}>
                    <InputLabel>Experience Level</InputLabel>
                    <Select
                      name="experience"
                      value={values.experience}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      label="Experience Level"
                    >
                      <MenuItem value="entry">Entry Level</MenuItem>
                      <MenuItem value="mid">Mid Level</MenuItem>
                      <MenuItem value="senior">Senior Level</MenuItem>
                      <MenuItem value="executive">Executive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={touched.department && Boolean(errors.department)}>
                    <InputLabel>Department</InputLabel>
                    <Select
                      name="department"
                      value={values.department}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      label="Department"
                    >
                      <MenuItem value="engineering">Engineering</MenuItem>
                      <MenuItem value="design">Design</MenuItem>
                      <MenuItem value="product">Product</MenuItem>
                      <MenuItem value="marketing">Marketing</MenuItem>
                      <MenuItem value="sales">Sales</MenuItem>
                      <MenuItem value="support">Support</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={touched.workplaceType && Boolean(errors.workplaceType)}>
                    <InputLabel>Workplace Type</InputLabel>
                    <Select
                      name="workplaceType"
                      value={values.workplaceType}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      label="Workplace Type"
                    >
                      <MenuItem value="remote">Remote</MenuItem>
                      <MenuItem value="hybrid">Hybrid</MenuItem>
                      <MenuItem value="onsite">On-site</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      value={values.status}
                      onChange={handleChange}
                      label="Status"
                    >
                      <MenuItem value="draft">Draft</MenuItem>
                      <MenuItem value="published">Published</MenuItem>
                      <MenuItem value="closed">Closed</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Salary Range
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Minimum Salary"
                    name="salary.min"
                    value={values.salary.min}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.salary?.min && Boolean(errors.salary?.min)}
                    helperText={touched.salary?.min && errors.salary?.min}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Maximum Salary"
                    name="salary.max"
                    value={values.salary.max}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.salary?.max && Boolean(errors.salary?.max)}
                    helperText={touched.salary?.max && errors.salary?.max}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Currency</InputLabel>
                    <Select
                      name="salary.currency"
                      value={values.salary.currency}
                      onChange={handleChange}
                      label="Currency"
                    >
                      <MenuItem value="USD">USD</MenuItem>
                      <MenuItem value="EUR">EUR</MenuItem>
                      <MenuItem value="GBP">GBP</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Required Skills
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                      fullWidth
                      label="Add Skill"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleAddSkill}
                      sx={{ minWidth: 100 }}
                    >
                      Add
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {values.skills.map((skill) => (
                      <Chip
                        key={skill}
                        label={skill}
                        onDelete={() => handleRemoveSkill(skill)}
                      />
                    ))}
                  </Box>
                  {touched.skills && errors.skills && (
                    <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                      {errors.skills}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/dashboard/jobs')}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              type="submit"
              disabled={!isValid || !isDirty || submitting}
            >
              {submitting ? 'Saving...' : id ? 'Update Job' : 'Create Job'}
            </Button>
          </Box>
        </Stack>
      </form>
    </Container>
  );
};

export default JobForm; 