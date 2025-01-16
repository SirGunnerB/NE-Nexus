import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  Grid,
  TextField,
  MenuItem,
  Typography,
  Paper,
  Chip,
  Alert,
} from '@mui/material';
import { createJob, updateJob, fetchJob } from '../../redux/slices/jobSlice';

const validationSchema = Yup.object({
  title: Yup.string().required('Title is required'),
  company: Yup.string().required('Company is required'),
  location: Yup.string().required('Location is required'),
  type: Yup.string().required('Job type is required'),
  experience: Yup.string().required('Experience level is required'),
  description: Yup.string().required('Description is required'),
  requirements: Yup.string().required('Requirements are required'),
  skills: Yup.array().min(1, 'At least one skill is required'),
  status: Yup.string().required('Status is required'),
});

const initialValues = {
  title: '',
  company: '',
  location: '',
  type: 'full-time',
  experience: 'entry',
  description: '',
  requirements: '',
  salary: { min: '', max: '', currency: 'USD' },
  benefits: [],
  skills: [],
  status: 'draft',
};

const JobForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const currentJob = useSelector((state) => state.jobs.currentJob);
  const [newSkill, setNewSkill] = React.useState('');

  useEffect(() => {
    if (id) {
      dispatch(fetchJob(id));
    }
  }, [dispatch, id]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (id) {
        await dispatch(updateJob({ id, jobData: values })).unwrap();
      } else {
        await dispatch(createJob(values)).unwrap();
      }
      navigate('/dashboard/jobs');
    } catch (error) {
      console.error('Error saving job:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddSkill = (values, setFieldValue) => {
    if (newSkill && !values.skills.includes(newSkill)) {
      setFieldValue('skills', [...values.skills, newSkill]);
      setNewSkill('');
    }
  };

  const handleDeleteSkill = (skillToDelete, values, setFieldValue) => {
    setFieldValue(
      'skills',
      values.skills.filter((skill) => skill !== skillToDelete)
    );
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {id ? 'Edit Job' : 'Create New Job'}
      </Typography>

      <Paper sx={{ p: 3, mt: 2 }}>
        <Formik
          initialValues={id ? currentJob || initialValues : initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting, setFieldValue }) => (
            <Form>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    fullWidth
                    name="title"
                    label="Job Title"
                    error={touched.title && Boolean(errors.title)}
                    helperText={touched.title && errors.title}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    fullWidth
                    name="company"
                    label="Company"
                    error={touched.company && Boolean(errors.company)}
                    helperText={touched.company && errors.company}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    fullWidth
                    name="location"
                    label="Location"
                    error={touched.location && Boolean(errors.location)}
                    helperText={touched.location && errors.location}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    select
                    fullWidth
                    name="type"
                    label="Job Type"
                    error={touched.type && Boolean(errors.type)}
                    helperText={touched.type && errors.type}
                  >
                    <MenuItem value="full-time">Full Time</MenuItem>
                    <MenuItem value="part-time">Part Time</MenuItem>
                    <MenuItem value="contract">Contract</MenuItem>
                    <MenuItem value="internship">Internship</MenuItem>
                  </Field>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    select
                    fullWidth
                    name="experience"
                    label="Experience Level"
                    error={touched.experience && Boolean(errors.experience)}
                    helperText={touched.experience && errors.experience}
                  >
                    <MenuItem value="entry">Entry Level</MenuItem>
                    <MenuItem value="mid">Mid Level</MenuItem>
                    <MenuItem value="senior">Senior Level</MenuItem>
                    <MenuItem value="executive">Executive Level</MenuItem>
                  </Field>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    select
                    fullWidth
                    name="status"
                    label="Status"
                    error={touched.status && Boolean(errors.status)}
                    helperText={touched.status && errors.status}
                  >
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="published">Published</MenuItem>
                    <MenuItem value="closed">Closed</MenuItem>
                  </Field>
                </Grid>
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    fullWidth
                    multiline
                    rows={4}
                    name="description"
                    label="Job Description"
                    error={touched.description && Boolean(errors.description)}
                    helperText={touched.description && errors.description}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    fullWidth
                    multiline
                    rows={4}
                    name="requirements"
                    label="Requirements"
                    error={touched.requirements && Boolean(errors.requirements)}
                    helperText={touched.requirements && errors.requirements}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Skills
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <TextField
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add a skill"
                        size="small"
                      />
                      <Button
                        variant="outlined"
                        onClick={() => handleAddSkill(values, setFieldValue)}
                      >
                        Add
                      </Button>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {values.skills.map((skill) => (
                        <Chip
                          key={skill}
                          label={skill}
                          onDelete={() => handleDeleteSkill(skill, values, setFieldValue)}
                        />
                      ))}
                    </Box>
                    {touched.skills && errors.skills && (
                      <Alert severity="error" sx={{ mt: 1 }}>
                        {errors.skills}
                      </Alert>
                    )}
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={() => navigate('/dashboard/jobs')}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Saving...' : id ? 'Update Job' : 'Create Job'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Paper>
    </Box>
  );
};

export default JobForm; 