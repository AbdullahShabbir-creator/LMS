import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, isAuthenticated } from '../utils/auth';

// This component helps debug authentication issues in student pages
export default function StudentPageLoader({ children }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        setLoading(true);
        console.log('StudentPageLoader: Checking authentication...');
        
        const authenticated = isAuthenticated();
        console.log('StudentPageLoader: Authentication status =', authenticated);
        
        if (!authenticated) {
          console.log('StudentPageLoader: Not authenticated, redirecting to login');
          navigate('/login');
          return;
        }
        
        const user = getUser();
        console.log('StudentPageLoader: User data =', user);
        
        if (!user) {
          console.log('StudentPageLoader: No user data found, redirecting to login');
          navigate('/login');
          return;
        }
        
        if (user.role !== 'student') {
          console.log(`StudentPageLoader: Wrong role (${user.role}), redirecting to login`);
          navigate('/login');
          return;
        }
        
        console.log('StudentPageLoader: Student authentication successful');
        setLoading(false);
      } catch (err) {
        console.error('StudentPageLoader: Authentication error', err);
        setError(err.message || 'Authentication error');
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #f6f7fb 0%, #e3e6f3 100%)'
      }}>
        <div style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Loading Student Dashboard...</div>
        <div style={{ width: 50, height: 50, border: '5px solid #f3f3f3', borderTop: '5px solid #3498db', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #f6f7fb 0%, #e3e6f3 100%)'
      }}>
        <div style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#d32f2f' }}>Error</div>
        <div style={{ marginBottom: 20 }}>{error}</div>
        <button 
          onClick={() => navigate('/login')}
          style={{
            background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: 8,
            cursor: 'pointer'
          }}
        >
          Return to Login
        </button>
      </div>
    );
  }

  return children;
} 