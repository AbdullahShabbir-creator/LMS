import React, { useState } from 'react';
import { authHeader } from '../utils/auth';

const ServerTest = () => {
  const [tests, setTests] = useState({
    basic: { status: 'pending', message: 'Not started' },
    auth: { status: 'pending', message: 'Not started' },
    courses: { status: 'pending', message: 'Not started' },
    upload: { status: 'pending', message: 'Not started' }
  });

  const runTests = async () => {
    // Reset tests
    setTests({
      basic: { status: 'running', message: 'Testing basic connection...' },
      auth: { status: 'pending', message: 'Not started' },
      courses: { status: 'pending', message: 'Not started' },
      upload: { status: 'pending', message: 'Not started' }
    });

    // Test 1: Basic Connection
    try {
      const res = await fetch('/api');
      if (res.ok) {
        setTests(prev => ({
          ...prev,
          basic: { status: 'success', message: 'Server connection successful' }
        }));
      } else {
        setTests(prev => ({
          ...prev,
          basic: { status: 'error', message: `Error ${res.status}: ${res.statusText}` }
        }));
        return; // Stop if basic connection fails
      }
    } catch (error) {
      setTests(prev => ({
        ...prev,
        basic: { status: 'error', message: `Connection error: ${error.message}` }
      }));
      return; // Stop if basic connection fails
    }

    // Test 2: Authentication
    setTests(prev => ({
      ...prev,
      auth: { status: 'running', message: 'Testing authentication...' }
    }));
    
    try {
      const res = await fetch('/api/auth/me', {
        headers: authHeader(),
        credentials: 'include'
      });

      if (res.ok) {
        const data = await res.json();
        setTests(prev => ({
          ...prev,
          auth: { status: 'success', message: `Authentication successful: ${data.name || 'User'} (${data.role || 'unknown role'})` }
        }));
      } else {
        setTests(prev => ({
          ...prev,
          auth: { status: 'error', message: `Auth error ${res.status}: ${res.statusText}` }
        }));
      }
    } catch (error) {
      setTests(prev => ({
        ...prev,
        auth: { status: 'error', message: `Auth error: ${error.message}` }
      }));
    }

    // Test 3: Courses API
    setTests(prev => ({
      ...prev,
      courses: { status: 'running', message: 'Testing courses API...' }
    }));
    
    try {
      const res = await fetch('/api/courses/public');
      if (res.ok) {
        const data = await res.json();
        setTests(prev => ({
          ...prev,
          courses: { 
            status: 'success', 
            message: `Courses API successful: Found ${data.courses?.length || 0} courses` 
          }
        }));
      } else {
        setTests(prev => ({
          ...prev,
          courses: { status: 'error', message: `Courses API error ${res.status}: ${res.statusText}` }
        }));
      }
    } catch (error) {
      setTests(prev => ({
        ...prev,
        courses: { status: 'error', message: `Courses API error: ${error.message}` }
      }));
    }

    // Test 4: Upload API Headers
    setTests(prev => ({
      ...prev,
      upload: { status: 'running', message: 'Testing upload API headers...' }
    }));
    
    try {
      // Just test OPTIONS request to check headers - don't actually upload
      const res = await fetch('/api/upload', {
        method: 'OPTIONS',
        headers: {
          ...authHeader(),
          'Content-Type': 'application/json'
        }
      });
      
      setTests(prev => ({
        ...prev,
        upload: { 
          status: res.ok ? 'success' : 'warning', 
          message: res.ok ? 'Upload API headers look good' : `Upload API headers check: ${res.status}` 
        }
      }));
    } catch (error) {
      setTests(prev => ({
        ...prev,
        upload: { status: 'error', message: `Upload API error: ${error.message}` }
      }));
    }
  };

  const renderStatus = (test) => {
    switch (test.status) {
      case 'success': return '✅ ' + test.message;
      case 'error': return '❌ ' + test.message;
      case 'warning': return '⚠️ ' + test.message;
      case 'running': return '🔄 ' + test.message;
      default: return '⏸️ ' + test.message;
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Server Connection Tests</h1>
      
      <button 
        onClick={runTests}
        style={{
          padding: '10px 20px',
          backgroundColor: '#4f46e5',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        Run Tests
      </button>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr', 
        gap: '10px',
        marginBottom: '20px'
      }}>
        {Object.entries(tests).map(([key, test]) => (
          <div 
            key={key}
            style={{
              padding: '15px',
              borderRadius: '5px',
              backgroundColor: 
                test.status === 'success' ? '#f0fdf4' :
                test.status === 'error' ? '#fef2f2' :
                test.status === 'warning' ? '#fffbeb' : '#f9fafb',
              border: 
                test.status === 'success' ? '1px solid #dcfce7' :
                test.status === 'error' ? '1px solid #fee2e2' :
                test.status === 'warning' ? '1px solid #fef3c7' : '1px solid #f3f4f6'
            }}
          >
            <h3 style={{ 
              margin: '0 0 10px 0',
              textTransform: 'capitalize'
            }}>
              {key} Test
            </h3>
            <div>{renderStatus(test)}</div>
          </div>
        ))}
      </div>
      
      <div style={{ 
        marginTop: '20px', 
        padding: '15px',
        backgroundColor: '#f3f4f6',
        borderRadius: '5px'
      }}>
        <h3>Troubleshooting Tips</h3>
        <ul>
          <li>Make sure the server is running on port 5000</li>
          <li>Check that the proxy is set to "http://localhost:5000" in package.json</li>
          <li>Verify that your authentication token is valid using the LoginTest page</li>
          <li>Check browser console for CORS or other errors</li>
          <li>Try clearing browser cache and cookies</li>
        </ul>
      </div>
    </div>
  );
};

export default ServerTest; 