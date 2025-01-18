import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import Loading from '../components/common/Loading';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('/auth/me');
          setUser(response.data);
        } catch (error) {
          localStorage.removeItem('token');
          console.error('Auth initialization error:', error);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      const response = await axios.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setUser(user);
      
      return user;
    } catch (error) {
      setError(error.response?.data?.error || 'Login failed');
      throw error;
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      setError(null);
      const response = await axios.post('/auth/register', userData);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setUser(user);
      
      return user;
    } catch (error) {
      setError(error.response?.data?.error || 'Registration failed');
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await axios.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  }, []);

  const updateProfile = useCallback(async (data) => {
    try {
      setError(null);
      const response = await axios.put('/auth/profile', data);
      setUser(response.data);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.error || 'Profile update failed');
      throw error;
    }
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      setError(null);
      await axios.put('/auth/change-password', {
        currentPassword,
        newPassword
      });
    } catch (error) {
      setError(error.response?.data?.error || 'Password change failed');
      throw error;
    }
  }, []);

  const forgotPassword = useCallback(async (email) => {
    try {
      setError(null);
      await axios.post('/auth/forgot-password', { email });
    } catch (error) {
      setError(error.response?.data?.error || 'Password reset request failed');
      throw error;
    }
  }, []);

  const resetPassword = useCallback(async (token, password) => {
    try {
      setError(null);
      await axios.post(`/auth/reset-password/${token}`, { password });
    } catch (error) {
      setError(error.response?.data?.error || 'Password reset failed');
      throw error;
    }
  }, []);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true });
    } else if (!loading && roles.length > 0 && !roles.includes(user?.role)) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, roles, navigate]);

  if (loading) {
    return <Loading variant="page" text="Authenticating..." />;
  }

  if (!user || (roles.length > 0 && !roles.includes(user.role))) {
    return null;
  }

  return children;
};

export default useAuth; 