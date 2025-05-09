import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
    
    // You could also log the error to an error reporting service here
  }

  handleRetry = () => {
    // Clear all authentication tokens and go to login
    try {
      localStorage.removeItem('lms_token');
      sessionStorage.removeItem('lms_token');
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
    } catch (e) {
      console.error("Error clearing storage:", e);
    }
    
    // Reset error state
    this.setState({ hasError: false, error: null, errorInfo: null });
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          textAlign: 'center'
        }}>
          <h1 style={{ color: '#dc3545', marginBottom: '20px' }}>Something went wrong</h1>
          <div style={{ 
            maxWidth: '800px', 
            margin: '0 auto 20px',
            padding: '15px',
            backgroundColor: '#fff',
            borderRadius: '5px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            textAlign: 'left'
          }}>
            <p><strong>Error:</strong> {this.state.error?.toString() || 'Unknown error'}</p>
            {this.state.errorInfo && (
              <details style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>
                <summary>Technical Details</summary>
                {this.state.errorInfo.componentStack}
              </details>
            )}
          </div>
          <div style={{ marginTop: '20px' }}>
            <button 
              onClick={this.handleRetry}
              style={{
                background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                padding: '10px 20px',
                fontSize: '16px',
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              Retry/Clear Tokens
            </button>
            <button 
              onClick={() => window.location.href = '/login'}
              style={{
                background: '#6c757d',
                color: '#fff', 
                border: 'none',
                borderRadius: '5px',
                padding: '10px 20px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              Go to Login
            </button>
          </div>
        </div>
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary; 