import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, isAuthenticated, generateTestToken, setToken } from '../utils/auth';

/**
 * Custom hook for handling authentication
 * @param {string} requiredRole - Optional role requirement (e.g. 'student', 'instructor', 'admin')
 * @param {string} redirectPath - Path to redirect to if auth fails, defaults to '/login'
 * @returns {object} Authentication state and functions
 */
export function useAuth(requiredRole, redirectPath = '/login') {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    checkAuth();
  }, [requiredRole]);
  
  const checkAuth = () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to get user directly from localStorage first
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          if (userData) {
            // Check if role matches if required
            if (requiredRole && userData.role !== requiredRole) {
              // In development mode, generate a token with the correct role
              if (process.env.NODE_ENV === 'development') {
                const token = generateTestToken(requiredRole);
                if (token) {
                  // Token generation also sets the user data in localStorage
                  const newUserStr = localStorage.getItem('user');
                  if (newUserStr) {
                    const newUser = JSON.parse(newUserStr);
                    setUser(newUser);
                    setLoading(false);
                    return;
                  }
                }
              }
              
              setError(`You don't have ${requiredRole} access.`);
              setUser(null);
              navigate(redirectPath, { replace: true });
              return;
            }
            
            setUser(userData);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        // Silent error handling
      }
      
      // Fallback to helper function or generate test token in development
      if (!isAuthenticated()) {
        // In development mode, generate a test token if not authenticated
        if (process.env.NODE_ENV === 'development') {
          const token = generateTestToken(requiredRole || 'student');
          if (token) {
            // Token generation also sets the user data in localStorage
            const userStr = localStorage.getItem('user');
            if (userStr) {
              try {
                const userData = JSON.parse(userStr);
                setUser(userData);
                setLoading(false);
                return;
              } catch (e) {
                // Silent error handling
              }
            }
          }
        }
        
        setError('Not authenticated');
        setUser(null);
        navigate(redirectPath, { replace: true });
        return;
      }
      
      const userData = getUser();
      
      if (!userData) {
        setError('No user found');
        setUser(null);
        navigate(redirectPath, { replace: true });
        return;
      }
      
      // Check if role matches if required
      if (requiredRole && userData.role !== requiredRole) {
        // In development mode, generate a token with the correct role
        if (process.env.NODE_ENV === 'development') {
          const token = generateTestToken(requiredRole);
          if (token) {
            // Token generation also sets the user data in localStorage
            const newUserStr = localStorage.getItem('user');
            if (newUserStr) {
              try {
                const newUser = JSON.parse(newUserStr);
                setUser(newUser);
                setLoading(false);
                return;
              } catch (e) {
                // Silent error handling
              }
            }
          }
        }
        
        setError(`You don't have ${requiredRole} access.`);
        setUser(null);
        navigate(redirectPath, { replace: true });
        return;
      }
      
      setUser(userData);
      setLoading(false);
    } catch (error) {
      setError('Authentication error');
      setUser(null);
      setLoading(false);
    }
  };

  const logout = () => {
    // Clear auth data
    localStorage.removeItem('lms_token');
    sessionStorage.removeItem('lms_token');
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    
    // Reset state
    setUser(null);
    setError(null);
    
    // Redirect
    navigate('/login', { replace: true });
  };

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    logout,
    checkAuth
  };
}

export default useAuth; 