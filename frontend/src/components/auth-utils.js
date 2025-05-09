/**
 * Authentication Utilities for the LMS Frontend
 * These functions help standardize login and token handling across the application
 */

import axios from 'axios';
import { toast } from 'react-toastify';

/**
 * Process login response and store authentication data
 * @param {Object} responseData - The response data from login API
 * @returns {Object} User data with success status
 */
export const processLoginResponse = (responseData) => {
  try {
    const { token, user } = responseData;
    
    if (!token || !user) {
      console.error('Invalid login response format:', responseData);
      return { success: false, error: 'Invalid login response' };
    }
    
    // Ensure user object has _id for compatibility with all components
    const normalizedUser = {
      ...user,
      _id: user._id || user.id || null,
    };
    
    // Store token and user data
    localStorage.setItem('lms_token', token);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    
    console.log('Login successful:', normalizedUser.role);
    return { 
      success: true, 
      user: normalizedUser,
      token
    };
  } catch (error) {
    console.error('Error processing login response:', error);
    return { success: false, error: 'Failed to process login' };
  }
};

/**
 * Performs a login request with consistent error handling
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} role - User role (student, instructor, admin)
 * @returns {Promise<Object>} Login result with user data if successful
 */
export const performLogin = async (email, password, role) => {
  try {
    // Validate input
    if (!email || !password || !role) {
      return { success: false, error: 'Email, password and role are required' };
    }
    
    // Make the API request
    const response = await axios.post('/api/auth/login', {
      email,
      password,
      role
    });
    
    // Handle MFA if required
    if (response.data.mfaRequired) {
      console.log('MFA required for user:', email);
      return { 
        success: false, 
        mfaRequired: true,
        user: response.data.user,
        message: 'MFA verification required'
      };
    }
    
    // Process the response
    return processLoginResponse(response.data);
  } catch (error) {
    console.error('Login error:', error);
    
    // Return structured error response
    return { 
      success: false, 
      error: error.response?.data?.message || error.message || 'Login failed',
      status: error.response?.status,
      data: error.response?.data
    };
  }
};

/**
 * Handle redirection after successful login
 * @param {Object} user - The user object from login response
 */
export const redirectAfterLogin = (user) => {
  if (!user || !user.role) {
    console.error('Invalid user for redirect:', user);
    return;
  }
  
  const redirectMap = {
    'admin': '/admin',
    'instructor': '/instructor/home',
    'student': '/student'
  };
  
  const redirectPath = redirectMap[user.role] || '/';
  
  // Use window.location for full page reload to ensure clean state
  window.location.href = redirectPath;
}; 