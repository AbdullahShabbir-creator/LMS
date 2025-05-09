/**
 * Authentication Utilities
 * 
 * This file contains utility functions for handling authentication,
 * token management, and user session information.
 */

// Get the auth token from localStorage or create a test token if in development
export const getToken = (role = 'instructor') => {
  // Try to get from localStorage
  let token = localStorage.getItem('lms_token');
  
  // If no token found, check sessionStorage as a fallback
  if (!token) {
    token = sessionStorage.getItem('lms_token');
    
    // Legacy support - check old token key
    if (!token) {
      token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      // For development only - if still no token and in development, generate a test token
      if (!token && process.env.NODE_ENV === 'development') {
        token = generateTestToken(role);
        if (token) {
          localStorage.setItem('lms_token', token);
        }
      }
    }
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
        localStorage.removeItem('lms_token');
        sessionStorage.removeItem('lms_token');
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        return false;
      }
    }
    
    return true;
  } catch (error) {
    return false;
  }
};

// Get user info from token
export const getUserInfo = () => {
  try {
    const token = getToken();
    if (!token) {
      return null;
    }
    
    // Basic JWT parsing (without validation)
    const parts = token.split('.');
    if (!parts || parts.length !== 3) {
      return null;
    }
    
    const base64Url = parts[1];
    if (!base64Url) {
      return null;
    }
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    try {
      // Handle potential decoding errors
      const jsonPayload = atob(base64);
      if (!jsonPayload) {
        return null;
      }
      
      const decodedData = JSON.parse(jsonPayload);
      
      if (!decodedData || typeof decodedData !== 'object') {
        return null;
      }
      
      return decodedData;
    } catch (decodeError) {
      return null;
    }
  } catch (error) {
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
  if (!token) {
    return {};
  }
  
  // If token doesn't start with Bearer, add it
  const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  return { 'Authorization': formattedToken };
};

// Save token to storage
export const setToken = (token, remember = true) => {
  if (!token) return false;
  
  try {
    // Remove any existing tokens
    localStorage.removeItem('lms_token');
    sessionStorage.removeItem('lms_token');
    localStorage.removeItem('token'); // legacy support
    sessionStorage.removeItem('token'); // legacy support
    
    // Store new token based on remember preference
    if (remember) {
      localStorage.setItem('lms_token', token);
    } else {
      sessionStorage.setItem('lms_token', token);
    }
    return true;
  } catch (error) {
    return false;
  }
};

// Store user data in localStorage
export const setUser = (userData) => {
  if (!userData) return false;
  
  try {
    // Store user data as JSON string
    const userStr = JSON.stringify(userData);
    localStorage.setItem('user', userStr);
    return true;
  } catch (error) {
    return false;
  }
};

// Handle logout
export const logout = () => {
  localStorage.removeItem('lms_token');
  sessionStorage.removeItem('lms_token');
  localStorage.removeItem('token'); // legacy support
  sessionStorage.removeItem('token'); // legacy support
  localStorage.removeItem('user');
  sessionStorage.removeItem('user');
  // Redirect to login page
  window.location.href = '/login';
};

// Handle authentication errors
export const handleAuthError = (error) => {
  // Token-related error, log user out
  if (error?.response?.status === 401 || 
      error?.response?.status === 403 ||
      (error?.message && error?.message.toLowerCase().includes('token'))) {
    logout();
    return true;
  }
  return false;
};

// Generate a test token for development only
export const generateTestToken = (userRole = 'student') => {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  try {
    // Create a mock payload
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      id: `test-${userRole}-${Math.random().toString(36).substring(2, 10)}`,
      _id: `test-${userRole}-${Math.random().toString(36).substring(2, 10)}`,
      email: `${userRole}@example.com`,
      name: `Test ${userRole.charAt(0).toUpperCase() + userRole.slice(1)}`,
      role: userRole,
      iat: now,
      exp: now + 86400 // Expires in 24 hours
    };
    
    // Mock token creation without crypto (for development only)
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const content = btoa(JSON.stringify(payload));
    const signature = btoa('testsignature'); // Not a real signature
    const token = `${header}.${content}.${signature}`;
    
    // Store the user data too
    const user = {
      _id: payload.id,
      id: payload.id,
      name: payload.name,
      email: payload.email,
      role: userRole
    };
    localStorage.setItem('user', JSON.stringify(user));
    
    return token;
  } catch (error) {
    return null;
  }
};

// Get the current user
export const getUser = () => {
  try {
    // Try to get user directly from localStorage
    const userDataStr = localStorage.getItem('user');
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        if (userData && userData.role) {
          return userData;
        }
      } catch (e) {
        // Invalid user data
      }
    }
    
    // If no user data, try to use token
    if (process.env.NODE_ENV === 'development') {
      // In development, generate a test user
      const token = getToken('student');
      if (token) {
        return getUser(); // Recursive call to get the user we just created
      }
    }
    
    // Try to extract user from token
    const tokenData = getUserInfo();
    if (tokenData && tokenData.role) {
      // Create user object from token data
      const user = {
        _id: tokenData.id || tokenData._id,
        id: tokenData.id || tokenData._id,
        name: tokenData.name,
        email: tokenData.email,
        role: tokenData.role
      };
      
      // Save for future use
      setUser(user);
      return user;
    }
    
    return null;
  } catch (error) {
    return null;
  }
};
