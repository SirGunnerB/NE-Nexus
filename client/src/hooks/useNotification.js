import { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert as MuiAlert } from '@mui/material';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(null);

  const addNotification = useCallback((notification) => {
    const id = Date.now();
    const newNotification = {
      id,
      autoHideDuration: 6000,
      ...notification
    };

    setNotifications(prev => [...prev, newNotification]);

    if (!open) {
      setCurrent(newNotification);
      setOpen(true);
    }
  }, [open]);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const handleClose = useCallback((event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
    if (current) {
      removeNotification(current.id);
    }
  }, [current, removeNotification]);

  const handleExited = useCallback(() => {
    const nextNotification = notifications[0];
    if (nextNotification) {
      setCurrent(nextNotification);
      setOpen(true);
    }
  }, [notifications]);

  // Helper methods for common notifications
  const success = useCallback((message) => {
    addNotification({
      message,
      severity: 'success'
    });
  }, [addNotification]);

  const error = useCallback((message) => {
    addNotification({
      message,
      severity: 'error'
    });
  }, [addNotification]);

  const warning = useCallback((message) => {
    addNotification({
      message,
      severity: 'warning'
    });
  }, [addNotification]);

  const info = useCallback((message) => {
    addNotification({
      message,
      severity: 'info'
    });
  }, [addNotification]);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    warning,
    info
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Snackbar
        key={current?.id}
        open={open}
        autoHideDuration={current?.autoHideDuration}
        onClose={handleClose}
        TransitionProps={{ onExited: handleExited }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {current && (
          <MuiAlert
            elevation={6}
            variant="filled"
            onClose={handleClose}
            severity={current.severity}
            sx={{
              minWidth: '300px',
              '& .MuiAlert-message': {
                flex: 1
              }
            }}
          >
            {current.message}
          </MuiAlert>
        )}
      </Snackbar>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export default useNotification; 