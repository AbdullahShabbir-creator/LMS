import React from 'react';
import ThreeBallsBackground from './ThreeBallsBackground';

export default function AuthLayout({ children }) {
  return (
    <div style={{
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Poppins, Roboto, sans-serif',
      background: 'linear-gradient(135deg, #0f2027 0%, #2c5364 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <ThreeBallsBackground />
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100%',
        padding: '24px 8px',
      }}>
        {children}
      </div>
    </div>
  );
}
