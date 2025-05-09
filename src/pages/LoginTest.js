import React, { useState, useEffect } from 'react';
import { generateTestToken, setToken, getToken, isAuthenticated } from '../utils/auth';

// Simple login test page for development
const LoginTest = () => {
  const [token, setTokenState] = useState(getToken() || '');
  const [status, setStatus] = useState(isAuthenticated() ? 'Authenticated' : 'Not authenticated');
  const [serverStatus, setServerStatus] = useState('Checking...');

  useEffect(() => {
    // Check server status
    fetch('/api')
      .then(response => {
        if (response.ok) {
          setServerStatus('Server is running');
        } else {
          setServerStatus(`Server error: ${response.status}`);
        }
      })
      .catch(error => {
        setServerStatus(`Cannot connect to server: ${error.message}`);
      });
  }, []);

  const handleGenerateToken = () => {
    const newToken = generateTestToken();
    setTokenState(newToken);
  };

  const handleSaveToken = () => {
    if (setToken(token)) {
      setStatus('Token saved. Authenticated!');
      setTimeout(() => window.location.reload(), 1000);
    } else {
      setStatus('Failed to save token');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setStatus('Logged out');
    setTokenState('');
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Authentication Test Page</h1>
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
        <h2>Server Status</h2>
        <p style={{ color: serverStatus.includes('running') ? 'green' : 'red' }}>{serverStatus}</p>
      </div>
      
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
        <h2>Authentication Status</h2>
        <p style={{ color: status.includes('Authenticated') ? 'green' : 'red' }}>{status}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>JWT Token</h2>
        <textarea 
          value={token} 
          onChange={(e) => setTokenState(e.target.value)} 
          style={{ width: '100%', height: '100px', marginBottom: '10px' }}
          placeholder="Enter or generate JWT token"
        />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={handleGenerateToken}
            style={{ padding: '10px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            Generate Test Token
          </button>
          <button 
            onClick={handleSaveToken}
            style={{ padding: '10px', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            Save Token
          </button>
          <button 
            onClick={handleLogout}
            style={{ padding: '10px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
        <h2>Next Steps</h2>
        <ol>
          <li>Click "Generate Test Token" to create a test instructor token</li>
          <li>Click "Save Token" to save it to localStorage</li>
          <li>Visit the course manager page to test authentication</li>
          <li>If still getting errors, check server logs for more details</li>
        </ol>
      </div>

      <div style={{ marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '20px' }}>
        <h3>Development Notes</h3>
        <p>This page is only for development and testing. In production, use proper login flow.</p>
        <p>The generated token is only for testing and not cryptographically secure.</p>
      </div>
    </div>
  );
};

export default LoginTest; 