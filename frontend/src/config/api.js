import axios from 'axios';

const API_CONFIG = {
  // Base URL for API requests
  // In development, this will be proxied to localhost:5000
  // In production, this should be your actual API endpoint
  baseUrl: process.env.NODE_ENV === 'development' 
    ? ''
    : process.env.REACT_APP_API_URL || 'http://localhost:5000',

  // API endpoints
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    sendOtp: '/api/mfa/send-otp',
    verifyOtp: '/api/mfa/verify-otp'
  },
  
  // Add other API endpoints as needed
  students: {
    list: '/api/student',
    profile: '/api/student/profile'
  },
  
  instructors: {
    list: '/api/instructor',
    profile: '/api/instructor/profile'
  },
  
  courses: {
    list: '/api/courses',
    create: '/api/courses'
  }
};

// Create an axios instance with default configuration
const api = axios.create({
  baseURL: API_CONFIG.baseUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to include token in headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lms_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('lms_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { api, API_CONFIG };
