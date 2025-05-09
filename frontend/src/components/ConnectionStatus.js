import React, { useState, useEffect } from 'react';
import { isAuthenticated } from '../utils/auth';

const ConnectionStatus = () => {
  const [status, setStatus] = useState({
    server: 'checking',
    auth: 'checking'
  });

  useEffect(() => {
    // Check server connection
    fetch('/api')
      .then(res => {
        setStatus(prev => ({ ...prev, server: res.ok ? 'connected' : 'error' }));
      })
      .catch(() => {
        setStatus(prev => ({ ...prev, server: 'error' }));
      });
    
    // Check authentication
    setStatus(prev => ({ ...prev, auth: isAuthenticated() ? 'authenticated' : 'unauthenticated' }));
  }, []);

  if (status.server === 'connected' && status.auth === 'authenticated') {
    return null; // Don't show anything when everything is working correctly
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      backgroundColor: status.server === 'error' ? '#fecaca' : '#fee2e2',
      color: '#991b1b',
      padding: '10px 15px',
      borderRadius: '5px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      zIndex: 1000,
      fontSize: '14px',
      maxWidth: '300px'
    }}>
      {status.server === 'error' && (
        <div style={{ marginBottom: '8px' }}>
          <strong>⚠️ Server connection error</strong>
          <p style={{ margin: '4px 0 0 0' }}>
            The server is not responding. Please check if it's running.
          </p>
        </div>
      )}
      
      {status.auth === 'unauthenticated' && (
        <div>
          <strong>🔒 Authentication required</strong>
          <p style={{ margin: '4px 0 0 0' }}>
            You are not authenticated. <a href="/login-test" style={{ color: '#991b1b', fontWeight: 'bold' }}>Set test token</a>
          </p>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus; 