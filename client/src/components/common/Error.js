import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  AlertTitle,
  useTheme
} from '@mui/material';
import {
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const variants = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    p: 3
  },
  section: {
    minHeight: 400,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    p: 3
  },
  alert: {
    width: '100%'
  }
};

const Error = ({
  variant = 'alert',
  title = 'Error',
  message = 'Something went wrong',
  error,
  onRetry,
  showHome = false
}) => {
  const theme = useTheme();
  const navigate = useNavigate();

  if (variant === 'alert') {
    return (
      <Alert
        severity="error"
        action={
          onRetry && (
            <Button
              color="inherit"
              size="small"
              onClick={onRetry}
              startIcon={<RefreshIcon />}
            >
              Retry
            </Button>
          )
        }
      >
        <AlertTitle>{title}</AlertTitle>
        {message}
        {error && process.env.NODE_ENV === 'development' && (
          <Typography variant="caption" component="pre" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
            {error.toString()}
          </Typography>
        )}
      </Alert>
    );
  }

  return (
    <Box sx={variants[variant]}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          textAlign: 'center',
          maxWidth: 500,
          borderRadius: 2,
          backgroundColor: 'background.paper'
        }}
      >
        <ErrorIcon
          sx={{
            fontSize: variant === 'page' ? 80 : 60,
            color: 'error.main',
            mb: 2
          }}
        />
        <Typography variant={variant === 'page' ? 'h4' : 'h5'} gutterBottom>
          {title}
        </Typography>
        <Typography color="text.secondary" paragraph>
          {message}
        </Typography>
        {error && process.env.NODE_ENV === 'development' && (
          <Typography
            variant="caption"
            component="pre"
            sx={{
              mt: 2,
              p: 2,
              backgroundColor: 'grey.50',
              borderRadius: 1,
              whiteSpace: 'pre-wrap',
              overflowX: 'auto'
            }}
          >
            {error.toString()}
          </Typography>
        )}
        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
          {onRetry && (
            <Button
              variant="contained"
              color="primary"
              onClick={onRetry}
              startIcon={<RefreshIcon />}
            >
              Try Again
            </Button>
          )}
          {showHome && (
            <Button
              variant="outlined"
              onClick={() => navigate('/')}
              startIcon={<ArrowBackIcon />}
            >
              Back to Home
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const handleError = (error) => {
      setHasError(true);
      setError(error);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <Error
        variant="page"
        title="Something went wrong"
        message="We're sorry, but something went wrong. Please try again later."
        error={error}
        showHome
      />
    );
  }

  return children;
};

export default Error; 