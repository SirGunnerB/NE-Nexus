import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Paper,
  Step,
  StepLabel,
  Stepper,
  Typography,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert
} from '@mui/material';

const steps = ['Welcome', 'Admin Account', 'Network Settings', 'Review'];

export default function SetupWizard() {
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    admin: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'recruiter'
    },
    settings: {
      networkMode: 'offline',
      serverPort: 5001,
      allowRegistration: false
    }
  });

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleInputChange = (section, field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: event.target.value
      }
    }));
  };

  const validateForm = () => {
    const { admin, settings } = formData;
    
    if (activeStep === 1) {
      if (!admin.name || !admin.email || !admin.password || !admin.confirmPassword) {
        setError('Please fill in all fields');
        return false;
      }
      if (admin.password !== admin.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (admin.password.length < 8) {
        setError('Password must be at least 8 characters long');
        return false;
      }
      if (!admin.email.includes('@')) {
        setError('Please enter a valid email address');
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async () => {
    try {
      if (!validateForm()) {
        return;
      }

      const response = await window.api.invoke('setup:complete', formData);
      if (!response) {
        throw new Error('Setup failed');
      }
      
      // Setup complete, the main process will close this window
    } catch (error) {
      setError(error.message || 'Setup failed. Please try again.');
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Welcome to the Recruitment Portal
            </Typography>
            <Typography paragraph>
              This wizard will help you set up your recruitment portal for the first time.
              You'll need to:
            </Typography>
            <Typography component="ul" sx={{ pl: 2 }}>
              <li>Create an admin account</li>
              <li>Configure network settings</li>
              <li>Review and complete the setup</li>
            </Typography>
            <Typography paragraph sx={{ mt: 2 }}>
              Click 'Next' to begin.
            </Typography>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Create Admin Account
            </Typography>
            <TextField
              fullWidth
              label="Name"
              value={formData.admin.name}
              onChange={handleInputChange('admin', 'name')}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.admin.email}
              onChange={handleInputChange('admin', 'email')}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={formData.admin.password}
              onChange={handleInputChange('admin', 'password')}
              margin="normal"
              required
              helperText="Password must be at least 8 characters long"
            />
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              value={formData.admin.confirmPassword}
              onChange={handleInputChange('admin', 'confirmPassword')}
              margin="normal"
              required
            />
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Network Settings
            </Typography>
            <FormControl component="fieldset" sx={{ mt: 2 }}>
              <FormLabel component="legend">Network Mode</FormLabel>
              <RadioGroup
                value={formData.settings.networkMode}
                onChange={handleInputChange('settings', 'networkMode')}
              >
                <FormControlLabel
                  value="offline"
                  control={<Radio />}
                  label="Offline Mode (Recommended)"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
                  Run the application without network connectivity. All data is stored locally.
                </Typography>
                
                <FormControlLabel
                  value="online"
                  control={<Radio />}
                  label="Online Mode"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
                  Enable network connectivity for remote access. Requires port configuration.
                </Typography>
              </RadioGroup>
            </FormControl>
            
            {formData.settings.networkMode === 'online' && (
              <TextField
                fullWidth
                label="Server Port"
                type="number"
                value={formData.settings.serverPort}
                onChange={handleInputChange('settings', 'serverPort')}
                margin="normal"
                helperText="Port number for the server (default: 5001)"
              />
            )}
          </Box>
        );

      case 3:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Review Settings
            </Typography>
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              Admin Account
            </Typography>
            <Typography>Name: {formData.admin.name}</Typography>
            <Typography>Email: {formData.admin.email}</Typography>
            <Typography>Role: {formData.admin.role}</Typography>
            
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              Network Settings
            </Typography>
            <Typography>
              Mode: {formData.settings.networkMode === 'offline' ? 'Offline' : 'Online'}
            </Typography>
            {formData.settings.networkMode === 'online' && (
              <Typography>Port: {formData.settings.serverPort}</Typography>
            )}
            
            <Alert severity="info" sx={{ mt: 2 }}>
              Click 'Complete Setup' to finish the installation and start using the application.
            </Alert>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 3, mt: 4 }}>
        <Stepper activeStep={activeStep}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {renderStepContent(activeStep)}

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