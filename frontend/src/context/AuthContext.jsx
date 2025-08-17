import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // ✅ Check if user is authenticated on app load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Verify token is still valid
          await authAPI.getProfile();
        } catch (error) {
          console.error('Token validation failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // ✅ Login function with enhanced error handling
  const login = async (credentials) => {
    try {
      if (!credentials.email || !credentials.password) {
        return {
          success: false,
          message: 'Please provide both email and password'
        };
      }

      const data = await authAPI.login(credentials);

      // Accept if token and user are present, regardless of success property
      if (data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      }

      // Handle explicit error messages from server
      if (data.message) {
        return {
          success: false,
          message: data.message
        };
      }

      // If response format is not as expected
      return {
        success: false,
        message: 'Login failed. Unexpected server response.'
      };
    } catch (error) {
      console.error('Login error:', error);
      if (error.message === 'Network Error') {
        return {
          success: false,
          message: 'Unable to connect to the server. Please try again.'
        };
      }
      if (error.response?.data?.message) {
        return {
          success: false,
          message: error.response.data.message
        };
      }
      return {
        success: false,
        message: 'Login failed. Please try again.'
      };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  //  Check if user has specific role
  const hasRole = (roles) => {
    if (!user) return false;
    return Array.isArray(roles) 
      ? roles.includes(user.role) 
      : user.role === roles;
  };

  // Check if user is admin
  const isAdmin = () => hasRole('admin');

  // Check if user is student
  const isStudent = () => hasRole('student');

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    hasRole,
    isAdmin,
    isStudent,
    isAuthenticated: !!token && !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
