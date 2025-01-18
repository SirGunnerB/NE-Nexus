import React from 'react';
import { Box, CircularProgress, Skeleton, Typography } from '@mui/material';

const variants = {
  page: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: 2
  },
  section: {
    height: '400px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: 2
  },
  inline: {
    display: 'flex',
    alignItems: 'center',
    gap: 1
  }
};

const Loading = ({ variant = 'inline', text, skeletonCount = 3 }) => {
  if (variant === 'skeleton') {
    return (
      <Box sx={{ width: '100%' }}>
        {[...Array(skeletonCount)].map((_, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Skeleton variant="text" width="40%" height={24} />
            <Skeleton variant="text" width="100%" height={20} />
            <Skeleton variant="text" width="100%" height={20} />
            <Skeleton variant="rectangular" width="100%" height={120} sx={{ mt: 1, borderRadius: 1 }} />
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Box sx={variants[variant]}>
      <CircularProgress
        size={variant === 'inline' ? 24 : 40}
        thickness={4}
        sx={{
          color: 'primary.main',
          ...(variant === 'inline' && { mr: 1 })
        }}
      />
      {text && (
        <Typography
          variant={variant === 'inline' ? 'body2' : 'h6'}
          color="text.secondary"
          sx={{ mt: variant === 'inline' ? 0 : 2 }}
        >
          {text}
        </Typography>
      )}
    </Box>
  );
};

export const LoadingButton = ({ loading, children, ...props }) => {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      {children}
      {loading && (
        <CircularProgress
          size={24}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginTop: '-12px',
            marginLeft: '-12px'
          }}
        />
      )}
    </Box>
  );
};

export default Loading; 