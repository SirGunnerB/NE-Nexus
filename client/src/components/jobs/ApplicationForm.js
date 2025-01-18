import React, { useState } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  TextField,
  FormControl,
  FormHelperText,
  Grid,
  Card,
  CardContent,
  Stack,
  Divider,
  useTheme
} from '@mui/material';
import { useForm } from '../../hooks/useForm';
import { useApi } from '../../hooks/useApi';
import Loading from '../common/Loading';
import * as yup from 'yup';

const steps = [
  'Basic Information',
  'Resume & Cover Letter',
  'Additional Questions',
  'Review & Submit'
];

const validationSchema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().required('Phone number is required'),
  currentCompany: yup.string(),
  currentRole: yup.string(),
  experience: yup.number().min(0, 'Experience must be positive'),
  linkedinUrl: yup.string().url('Invalid LinkedIn URL'),
  portfolioUrl: yup.string().url('Invalid portfolio URL'),
  resumeUrl: yup.string().required('Resume is required'),
  coverLetter: yup.string().min(100, 'Cover letter should be at least 100 characters'),
  noticePeriod: yup.number().min(0, 'Notice period must be positive'),
  expectedSalary: yup.number().min(0, 'Expected salary must be positive'),
  reasonForApplying: yup.string().required('Please explain why you are applying')
});

const initialValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  currentCompany: '',
  currentRole: '',
  experience: '',
  linkedinUrl: '',
  portfolioUrl: '',
  resumeUrl: '',
  coverLetter: '',
  noticePeriod: '',
  expectedSalary: '',
  reasonForApplying: '',
  answers: []
};

const ApplicationForm = ({ jobId, onSuccess, onError }) => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [resumeFile, setResumeFile] = useState(null);
  
  const {
    loading: submitting,
    error: submitError,
    execute: submitApplication
  } = useApi('/applications', { method: 'POST' });

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setFieldValue,
    validateForm,
    validateField,
    isValid
  } = useForm(initialValues, validationSchema);

  const handleNext = async () => {
    const stepFields = getStepFields(activeStep);
    const stepErrors = {};
    
    for (const field of stepFields) {
      const error = await validateField(field);
      if (error) {
        stepErrors[field] = error;
      }
    }

    if (Object.keys(stepErrors).length === 0) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    try {
      const isValid = await validateForm();
      if (!isValid) {
        return;
      }

      // Handle resume upload first if there's a file
      if (resumeFile) {
        const formData = new FormData();
        formData.append('resume', resumeFile);
        // Implement resume upload API call
        // const uploadResponse = await uploadResume(formData);
        // values.resumeUrl = uploadResponse.url;
      }

      const response = await submitApplication({
        jobId,
        ...values
      });

      onSuccess(response);
    } catch (error) {
      onError(error.message);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setResumeFile(file);
      setFieldValue('resumeUrl', URL.createObjectURL(file));
    }
  };

  const getStepFields = (step) => {
    switch (step) {
      case 0:
        return ['firstName', 'lastName', 'email', 'phone'];
      case 1:
        return ['currentCompany', 'currentRole', 'experience', 'linkedinUrl', 'portfolioUrl'];
      case 2:
        return ['resumeUrl', 'coverLetter'];
      case 3:
        return ['noticePeriod', 'expectedSalary', 'reasonForApplying'];
      default:
        return [];
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={values.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.firstName && Boolean(errors.firstName)}
                helperText={touched.firstName && errors.firstName}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={values.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.lastName && Boolean(errors.lastName)}
                helperText={touched.lastName && errors.lastName}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={values.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.phone && Boolean(errors.phone)}
                helperText={touched.phone && errors.phone}
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Current Company"
                name="currentCompany"
                value={values.currentCompany}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.currentCompany && Boolean(errors.currentCompany)}
                helperText={touched.currentCompany && errors.currentCompany}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Current Role"
                name="currentRole"
                value={values.currentRole}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.currentRole && Boolean(errors.currentRole)}
                helperText={touched.currentRole && errors.currentRole}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Years of Experience"
                name="experience"
                type="number"
                value={values.experience}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.experience && Boolean(errors.experience)}
                helperText={touched.experience && errors.experience}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="LinkedIn URL"
                name="linkedinUrl"
                value={values.linkedinUrl}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.linkedinUrl && Boolean(errors.linkedinUrl)}
                helperText={touched.linkedinUrl && errors.linkedinUrl}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Portfolio URL"
                name="portfolioUrl"
                value={values.portfolioUrl}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.portfolioUrl && Boolean(errors.portfolioUrl)}
                helperText={touched.portfolioUrl && errors.portfolioUrl}
              />
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth error={touched.resumeUrl && Boolean(errors.resumeUrl)}>
                <input
                  accept=".pdf,.doc,.docx"
                  style={{ display: 'none' }}
                  id="resume-file"
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="resume-file">
                  <Button
                    variant="outlined"
                    component="span"
                    fullWidth
                    sx={{ height: 56 }}
                  >
                    {resumeFile ? resumeFile.name : 'Upload Resume'}
                  </Button>
                </label>
                {touched.resumeUrl && errors.resumeUrl && (
                  <FormHelperText>{errors.resumeUrl}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Cover Letter"
                name="coverLetter"
                value={values.coverLetter}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.coverLetter && Boolean(errors.coverLetter)}
                helperText={touched.coverLetter && errors.coverLetter}
              />
            </Grid>
          </Grid>
        );
      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Notice Period (days)"
                name="noticePeriod"
                type="number"
                value={values.noticePeriod}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.noticePeriod && Boolean(errors.noticePeriod)}
                helperText={touched.noticePeriod && errors.noticePeriod}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Expected Salary"
                name="expectedSalary"
                type="number"
                value={values.expectedSalary}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.expectedSalary && Boolean(errors.expectedSalary)}
                helperText={touched.expectedSalary && errors.expectedSalary}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Why are you interested in this position?"
                name="reasonForApplying"
                value={values.reasonForApplying}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.reasonForApplying && Boolean(errors.reasonForApplying)}
                helperText={touched.reasonForApplying && errors.reasonForApplying}
              />
            </Grid>
          </Grid>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Card>
        <CardContent>
          <form>
            {renderStepContent(activeStep)}
          </form>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
        >
          Back
        </Button>
        {activeStep === steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting || !isValid}
          >
            {submitting ? 'Submitting...' : 'Submit Application'}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleNext}
          >
            Next
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default ApplicationForm; 