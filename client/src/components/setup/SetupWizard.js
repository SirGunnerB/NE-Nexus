import React, { useState } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Paper,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Container,
} from '@mui/material';

const steps = ['Welcome', 'Admin Account', 'Network Settings', 'Review'];

export default function SetupWizard({ onComplete }) {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'ceo',
    networkMode: 'offline',
  });
  const [errors, setErrors] = useState({});

  const handleNext = () => {
    if (validateStep()) {
      if (activeStep === steps.length - 1) {
        handleSubmit();
      } else {
        setActiveStep((prevStep) => prevStep + 1);
      }
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const validateStep = () => {
    const newErrors = {};

    switch (activeStep) {
      case 1: // Admin Account
        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.password) newErrors.password = 'Password is required';
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    try {
      // Send setup data to the main process
      await window.api.invoke('setup:complete', {
        admin: {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        },
        settings: {
          networkMode: formData.networkMode,
        },
      });
      onComplete();
    } catch (error) {
      console.error('Setup failed:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Welcome to NE Nexus
            </Typography>
            <Typography>
              This wizard will help you set up your recruitment management system.
              You'll create an admin account and configure basic settings.
            </Typography>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Create Admin Account
            </Typography>
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              margin="normal"
            />
            <FormControl component="fieldset" margin="normal">
              <FormLabel component="legend">Role</FormLabel>
              <RadioGroup
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <FormControlLabel
                  value="ceo"
                  control={<Radio />}
                  label="CEO"
                />
                <FormControlLabel
                  value="manager"
                  control={<Radio />}
                  label="Manager"
                />
              </RadioGroup>
            </FormControl>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Network Settings
            </Typography>
            <FormControl component="fieldset" margin="normal">
              <FormLabel component="legend">Network Mode</FormLabel>
              <RadioGroup
                name="networkMode"
                value={formData.networkMode}
                onChange={handleChange}
              >
                <FormControlLabel
                  value="offline"
                  control={<Radio />}
                  label="Offline Mode (Recommended)"
                />
                <FormControlLabel
                  value="online"
                  control={<Radio />}
                  label="Online Mode"
                />
              </RadioGroup>
            </FormControl>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              Offline Mode: The application will run locally without internet connectivity.
              <br />
              Online Mode: Enables features that require internet connectivity.
            </Typography>
          </Box>
        );

      case 3:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Review Settings
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              Admin Account
            </Typography>
            <Typography>Name: {formData.name}</Typography>
            <Typography>Email: {formData.email}</Typography>
            <Typography>Role: {formData.role}</Typography>
            <Typography variant="subtitle1" sx={{ mt: 2 }} gutterBottom>
              Network Settings
            </Typography>
            <Typography>Mode: {formData.networkMode}</Typography>
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {getStepContent(activeStep)}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
          >
            {activeStep === steps.length - 1 ? 'Complete Setup' : 'Next'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
} 