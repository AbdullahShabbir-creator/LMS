import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AuthLayout from '../components/AuthLayout';
import axios from 'axios';
import '@fontsource/poppins';
import '@fontsource/roboto';

const roles = [
  { label: 'Instructor', value: 'instructor' },
  { label: 'Student', value: 'student' },
];

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');    
    try {
      await axios.post('http://localhost:3001/api/auth/register', form);
      setSuccess('Registration successful! You can now log in.');
      setForm({ name: '', email: '', password: '', role: 'student' });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // On mount, check for ?role= query param and set form.role accordingly
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const role = params.get('role');
    if (role && (role === 'student' || role === 'instructor')) {
      setForm(f => ({ ...f, role }));
    }
  }, []);

  return (
    <AuthLayout>
      <motion.div
        className="register-container"
        style={{ background: 'rgba(255,255,255,0.93)', borderRadius: 18, boxShadow: '0 6px 32px #7f53ac44', padding: 28, maxWidth: 370, width: '98vw', margin: '36px auto', position: 'relative', perspective: 900 }}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.04, boxShadow: '0 16px 48px 12px #7f53ac44' }}
        transition={{ duration: 0.8, type: 'spring', stiffness: 120 }}
      >
        <motion.h2 style={{ fontFamily: 'Poppins', color: '#7f53ac', fontWeight: 700, textAlign: 'center', marginBottom: 14, textShadow: '0 2px 18px #7f53ac44' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>Create Account</motion.h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          <select name="role" value={form.role} onChange={handleChange} style={{ padding: 8, borderRadius: 7, border: '1.5px solid #e3e6f3', fontSize: 15 }}>
            {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Full Name" required style={{ padding: 8, borderRadius: 7, border: '1.5px solid #e3e6f3', fontSize: 15 }} />
          <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email" required style={{ padding: 8, borderRadius: 7, border: '1.5px solid #e3e6f3', fontSize: 15 }} />
          <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Password" required style={{ padding: 8, borderRadius: 7, border: '1.5px solid #e3e6f3', fontSize: 15 }} />
          {error && <div style={{ color: '#ff5b5b', fontWeight: 600 }}>{error}</div>}
          {success && <div style={{ color: '#43cea2', fontWeight: 600 }}>{success}</div>}
          <button type="submit" className="register-btn" style={{ background: 'linear-gradient(90deg,#7f53ac,#43cea2)', color: '#fff', border: 'none', borderRadius: 7, padding: '10px 0', fontWeight: 700, fontSize: 17, marginTop: 8 }} disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</button>
        </form>
      </motion.div>
      <motion.a
        href="/login"
        whileHover={{ scale: 1.05, color: '#fff' }}
        style={{ textAlign: 'center', color: '#fff', marginTop: 10, fontFamily: 'Roboto', fontWeight: 500, cursor: 'pointer', textDecoration: 'underline' }}
      >
        Already have an account? Login
      </motion.a>
    </AuthLayout>
  );
}
