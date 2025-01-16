import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux';
import store from './redux/store';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Dashboard
import Dashboard from './pages/dashboard/Dashboard';
import DashboardLayout from './components/layout/DashboardLayout';

// Theme configuration
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" />;
  }
  return <DashboardLayout>{children}</DashboardLayout>;
};

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Add more protected routes here */}
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <Routes>
                    <Route path="jobs" element={<div>Jobs Page (Coming Soon)</div>} />
                    <Route path="candidates" element={<div>Candidates Page (Coming Soon)</div>} />
                    <Route path="companies" element={<div>Companies Page (Coming Soon)</div>} />
                    <Route path="reports" element={<div>Reports Page (Coming Soon)</div>} />
                    <Route path="settings" element={<div>Settings Page (Coming Soon)</div>} />
                    <Route path="profile" element={<div>Profile Page (Coming Soon)</div>} />
                  </Routes>
                </ProtectedRoute>
              }
            />
            
            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/login" />} />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App; 