import React from 'react';
import { motion } from 'framer-motion';

export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div 
      style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        flexDirection: 'column',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f6f7fb 0%, #e3e6f3 100%)',
        padding: '20px'
      }}
    >
      <motion.div
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          padding: '32px 48px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
          backdropFilter: 'blur(10px)',
          maxWidth: '90%'
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div style={{ position: 'relative', width: 80, height: 80, marginBottom: 24 }}>
          <motion.div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              border: '4px solid rgba(24, 90, 157, 0.1)',
              borderTop: '4px solid #185a9d',
              position: 'absolute',
              top: 0,
              left: 0
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              border: '4px solid rgba(67, 206, 162, 0.1)',
              borderBottom: '4px solid #43cea2',
              position: 'absolute',
              top: 10,
              left: 10
            }}
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3 style={{ 
            color: '#185a9d', 
            fontSize: '1.5rem', 
            fontWeight: 600,
            textAlign: 'center',
            margin: 0,
            marginBottom: 8
          }}>
            {message}
          </h3>
          <p style={{ 
            color: '#666', 
            fontSize: '0.95rem',
            textAlign: 'center',
            margin: 0
          }}>
            Please wait while we prepare your content
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
} 