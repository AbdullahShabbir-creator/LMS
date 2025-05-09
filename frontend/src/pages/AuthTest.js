import React, { useState, useEffect } from 'react';
import { getToken, getUser, isAuthenticated, setUser, setToken, generateTestToken } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

export default function AuthTest() {
  const navigate = useNavigate();
  const [authInfo, setAuthInfo] = useState({
    token: null,
    isAuthenticated: false,
    user: null,
  });
  
  useEffect(() => {
    refreshAuthInfo();
  }, []);
  
  const refreshAuthInfo = () => {
    const token = getToken();
    const auth = isAuthenticated();
    const user = getUser();
    
    setAuthInfo({
      token: token ? `${token.substring(0, 20)}...` : 'No token',
      isAuthenticated: auth,
      user: user,
    });
  };
  
  const createTestUser = (role) => {
    const token = generateTestToken(role);
    const user = {
      _id: `test-${role}-` + Math.floor(Math.random() * 1000),
      name: `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      email: `test-${role}@example.com`,
      role: role,
    };
    
    setToken(token, true);
    setUser(user);
    refreshAuthInfo();
  };
  
  const clearAuth = () => {
    localStorage.removeItem('lms_token');
    sessionStorage.removeItem('lms_token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    refreshAuthInfo();
  };
  
  return (
    <div style={{ padding: 20, maxWidth: 800, margin: '0 auto' }}>
      <h1>Authentication Test Page</h1>
      
      <div style={{ marginBottom: 20 }}>
        <h2>Current Authentication State</h2>
        <pre style={{ 
          background: '#f5f5f5', 
          padding: 15, 
          borderRadius: 8, 
          overflow: 'auto', 
          maxHeight: 300 
        }}>
          {JSON.stringify({
            token: authInfo.token,
            isAuthenticated: authInfo.isAuthenticated,
            user: authInfo.user,
          }, null, 2)}
        </pre>
      </div>
      
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <button 
          onClick={() => createTestUser('student')}
          style={{
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            padding: '10px 15px',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          Create Test Student
        </button>
        
        <button 
          onClick={() => createTestUser('instructor')}
          style={{
            background: '#2196F3',
            color: 'white',
            border: 'none',
            padding: '10px 15px',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          Create Test Instructor
        </button>
        
        <button 
          onClick={clearAuth}
          style={{
            background: '#f44336',
            color: 'white',
            border: 'none',
            padding: '10px 15px',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          Clear Auth
        </button>
        
        <button 
          onClick={refreshAuthInfo}
          style={{
            background: '#9C27B0',
            color: 'white',
            border: 'none',
            padding: '10px 15px',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          Refresh
        </button>
      </div>
      
      <div style={{ display: 'flex', gap: 10 }}>
        <button 
          onClick={() => navigate('/student')}
          style={{
            background: '#FF9800',
            color: 'white',
            border: 'none',
            padding: '10px 15px',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          Go to Student Dashboard
        </button>
        
        <button 
          onClick={() => navigate('/instructor/home')}
          style={{
            background: '#FF9800',
            color: 'white',
            border: 'none',
            padding: '10px 15px',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          Go to Instructor Home
        </button>
        
        <button 
          onClick={() => navigate('/login')}
          style={{
            background: '#607D8B',
            color: 'white',
            border: 'none',
            padding: '10px 15px',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          Go to Login
        </button>
      </div>
    </div>
  );
} 