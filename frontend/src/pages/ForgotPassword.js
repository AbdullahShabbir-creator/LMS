import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AuthLayout from '../components/AuthLayout';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '@fontsource/poppins';
import '@fontsource/roboto';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await axios.post('/api/auth/forgot-password', { email });
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <motion.form
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.03, boxShadow: '0 16px 48px 12px #43cea244' }}
        transition={{ duration: 0.8, type: 'spring', stiffness: 120 }}
        onSubmit={handleSubmit}
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.92) 60%, rgba(67,206,162,0.13) 100%)',
          borderRadius: 38,
          boxShadow: '0 16px 48px 12px #43cea233, 0 1.5px 20px 0 #fff5 inset',
          padding: '48px 18px',
          minWidth: 270,
          maxWidth: 420,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          backdropFilter: 'blur(18px)',
          border: '2.5px solid rgba(67,206,162,0.24)',
          transition: 'box-shadow 0.3s, transform 0.3s',
        }}
      >
        <motion.h2 
          whileHover={{ scale: 1.08, color: '#ffe53b', textShadow: '0 2px 16px #43cea2, 0 4px 36px #fff' }}
          transition={{ type: 'spring', stiffness: 200 }}
          style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 32, marginBottom: 12, color: '#00bfff', textAlign: 'center', letterSpacing: 1, cursor: 'pointer', textShadow: '0 2px 12px #43cea222' }}
        >Forgot Password</motion.h2>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ padding: 12, borderRadius: 8, border: '1px solid #bdbdbd', fontSize: 16, fontFamily: 'Roboto', marginTop: 10 }}
        />
        {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: 'red', fontWeight: 500 }}>{error}</motion.div>}
        {message && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: 'green', fontWeight: 500 }}>{message}</motion.div>}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          style={{
            background: 'linear-gradient(90deg, #00bfff, #1a237e)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '12px 0',
            fontSize: 18,
            fontWeight: 700,
            fontFamily: 'Poppins',
            marginTop: 10,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(26,35,126,0.08)',
          }}
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </motion.button>
        <motion.a
          onClick={e => { e.preventDefault(); navigate('/login'); }}
          whileHover={{ scale: 1.05, color: '#00bfff' }}
          style={{ textAlign: 'center', color: '#1a237e', marginTop: 10, fontFamily: 'Roboto', fontWeight: 500, cursor: 'pointer', textDecoration: 'underline' }}
        >
          Back to Login
        </motion.a>
      </motion.form>
    </AuthLayout>
  );
}
