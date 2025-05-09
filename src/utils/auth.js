/**
 * Authentication Utilities
 * 
 * This file contains utility functions for handling authentication,
 * token management, and user session information.
 */

// Get the auth token from localStorage
export const getToken = () => {
  // Try to get from localStorage
  let token = localStorage.getItem('token');
  
  // If no token found, check sessionStorage as a fallback
  if (!token) {
    token = sessionStorage.getItem('token');
  }
  
  return token;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = getToken();
  if (!token) return false;
  
  // Basic validation - check if token has correct format
  if (token.split('.').length !== 3) return false;
  
  // Additional validation - check expiration
  try {
    const payload = getUserInfo();
    if (!payload) return false;
    
    // Check token expiration if it has an exp field
    if (payload.exp) {
      const expirationDate = new Date(payload.exp * 1000);
      if (expirationDate < new Date()) {
        // Token has expired, clear it
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};

// Get user info from token
export const getUserInfo = () => {
  try {
    const token = getToken();
    if (!token) return null;
    
    // Basic JWT parsing (without validation)
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
};

// Get user ID from token
export const getUserId = () => {
  const userInfo = getUserInfo();
  return userInfo?.id || userInfo?._id || userInfo?.userId || userInfo?.user_id || null;
};

// Get instructor ID from token
export const getInstructorId = () => {
  const userInfo = getUserInfo();
  return userInfo?.instructorId || userInfo?.id || userInfo?._id || userInfo?.userId || userInfo?.user_id || null;
};

// Add auth headers to API requests
export const authHeader = () => {
  const token = getToken();
  if (!token) return {};
  
  // If token doesn't start with Bearer, add it
  const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  return { 'Authorization': formattedToken };
};

// Save token to storage
export const setToken = (token, remember = true) => {
  if (!token) return false;
  
  try {
    // Remove any existing tokens
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    
    // Store new token based on remember preference
    if (remember) {
      localStorage.setItem('token', token);
    } else {
      sessionStorage.setItem('token', token);
    }
    return true;
  } catch (error) {
    console.error('Error saving token:', error);
    return false;
  }
};

// Handle logout
export const logout = () => {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.removeItem('user');
  // Redirect to login page
  window.location.href = '/login';
};

// Handle authentication errors
export const handleAuthError = (error) => {
  console.error('Authentication error:', error);
  
  // Check if error is related to authentication
  if (error?.response?.status === 401 || 
      error?.response?.status === 403 || 
      error?.message?.includes('token') || 
      error?.message?.includes('auth')) {
    // Don't automatically logout here for better user experience
    // Alert the user
    alert('Authentication error: ' + (error.message || 'Please login again'));
    return true;
  }
  
  return false;
};

// Generate a test token (for development only, not secure!)
export const generateTestToken = () => {
  try {
    // Create a simple payload with instructor role
    const payload = {
      _id: 'test-instructor-' + Math.floor(Math.random() * 1000),
      name: 'Test Instructor',
      email: 'test@example.com',
      role: 'instructor',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours
    };
    
    // Base64 encode the header
    const header = { alg: 'HS256', typ: 'JWT' };
    const headerString = btoa(JSON.stringify(header));
    
    // Base64 encode the payload
    const payloadString = btoa(JSON.stringify(payload));
    
    // Create a simple signature (not cryptographically secure, just for testing)
    const signature = btoa('test-signature-' + Date.now());
    
    // Create the token
    const token = `${headerString}.${payloadString}.${signature}`;
    
    console.info('Generated test token for user:', payload);
    return token;
  } catch (error) {
    console.error('Error generating test token:', error);
    return null;
  }
};

// Get user from token
export const getUser = () => {
  if (!isAuthenticated()) return null;
  return getUserInfo();
}; 