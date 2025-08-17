import axios from 'axios';

// Base API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with enhanced configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Increase timeout for slower connections
  timeout: 10000,
  // Enable credentials for CORS
  withCredentials: true,
  // Retry on failure
  retry: 3,
  retryDelay: (retryCount) => {
    return retryCount * 1000; // time interval between retries
  }
});

// Request Interceptor - Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Enhanced Response Interceptor with better error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors
    if (!error.response) {
      return Promise.reject({
        message: 'Network Error. Please check your internet connection.',
        isNetworkError: true
      });
    }

    // Handle 401 - Unauthorized
    if (error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login?session=expired';
      return Promise.reject({
        message: 'Session expired. Please login again.',
        isAuthError: true
      });
    }

    // Handle 403 - Forbidden
    if (error.response.status === 403) {
      return Promise.reject({
        message: 'You do not have permission to perform this action.',
        isForbidden: true
      });
    }

    // Handle 404 - Not Found
    if (error.response.status === 404) {
      return Promise.reject({
        message: 'The requested resource was not found.',
        isNotFound: true
      });
    }

    // Handle 422 - Validation Error
    if (error.response.status === 422) {
      return Promise.reject({
        message: 'Invalid data provided.',
        validationErrors: error.response.data.errors,
        isValidationError: true
      });
    }

    // Handle 429 - Too Many Requests
    if (error.response.status === 429) {
      return Promise.reject({
        message: 'Too many requests. Please try again later.',
        isRateLimited: true
      });
    }

    // Handle 500 - Server Error
    if (error.response.status >= 500) {
      return Promise.reject({
        message: 'Server error. Please try again later.',
        isServerError: true
      });
    }

    // Retry the request if it failed
    if (originalRequest.retry) {
      if (!originalRequest._retry) {
        originalRequest._retry = 1;
      } else if (originalRequest._retry < originalRequest.retry) {
        originalRequest._retry++;
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(api(originalRequest));
          }, originalRequest.retryDelay(originalRequest._retry));
        });
      }
    }

    return Promise.reject(error);
  }
);

// ✅ Authentication API
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  }
};

// Students API
export const studentsAPI = {
  getAll: async () => {
    const response = await api.get('/students');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },
  
  create: async (studentData) => {
    const response = await api.post('/students', studentData);
    return response.data;
  },
  
  update: async (id, studentData) => {
    const response = await api.put(`/students/${id}`, studentData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/students/${id}`);
    return response.data;
  },
  
  getByCourse: async (courseId) => {
    const response = await api.get(`/students/course/${courseId}`);
    return response.data;
  }
};

// Courses API
export const coursesAPI = {
  getAll: async () => {
    const response = await api.get('/courses');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },
  
  create: async (courseData) => {
    const response = await api.post('/courses', courseData);
    return response.data;
  },
  
  update: async (id, courseData) => {
    const response = await api.put(`/courses/${id}`, courseData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  },
  
  getStudents: async (id) => {
    const response = await api.get(`/courses/${id}/students`);
    return response.data;
  },
  
  getStats: async () => {
    const response = await api.get('/courses/admin/stats');
    return response.data;
  }
};

export default api;
