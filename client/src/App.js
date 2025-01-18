import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
  Route,
  Navigate
} from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import JobList from './pages/jobs/JobList';
import JobDetail from './pages/jobs/JobDetail';
import JobForm from './pages/jobs/JobForm';
import JobApplications from './pages/applications/JobApplications';
import SetupWizard from './pages/setup/SetupWizard';

// Components
import Layout from './components/layout/Layout';
import PrivateRoute from './components/auth/PrivateRoute';
import { AuthProvider } from './contexts/AuthContext';

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/setup" element={<SetupWizard />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/jobs" replace />} />
        <Route
          path="jobs"
          element={
            <PrivateRoute>
              <JobList />
            </PrivateRoute>
          }
        />
        <Route
          path="jobs/new"
          element={
            <PrivateRoute>
              <JobForm />
            </PrivateRoute>
          }
        />
        <Route
          path="jobs/:id"
          element={
            <PrivateRoute>
              <JobDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="jobs/:id/edit"
          element={
            <PrivateRoute>
              <JobForm />
            </PrivateRoute>
          }
        />
        <Route
          path="jobs/:id/applications"
          element={
            <PrivateRoute>
              <JobApplications />
            </PrivateRoute>
          }
        />
      </Route>
    </>
  ),
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  }
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 