import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AuthLayout from '../components/AuthLayout';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '@fontsource/poppins';
import '@fontsource/roboto';
import AuthRoleSelector from '../components/AuthRoleSelector';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { performLogin, redirectAfterLogin } from '../components/auth-utils';

const roles = [
  { label: 'Admin', value: 'admin' },
  { label: 'Instructor', value: 'instructor' },
  { label: 'Student', value: 'student' },
];

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: login, 2: otp
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [mfaRequired, setMfaRequired] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  const [resendTimer, setResendTimer] = useState(60);
  const [resendLoading, setResendLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Input validation
    if (!form.email.trim()) {
      setError('Email is required');
      return;
    }
    
    if (!form.password.trim()) {
      setError('Password is required');
      return;
    }
    
    setLoading(true);
    setError('');
    setOtpError('');
    
    try {
      // Special case for admin
      if (form.role === 'admin' && form.email === 'admin@lms.com' && form.password === 'admin123') {
        const user = { role: 'admin', email: form.email, name: 'Admin', _id: 'admin-1' };
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('lms_token', 'admin-token');
        navigate('/admin');
        setLoading(false);
        toast.success('Welcome, Admin!', { autoClose: 2000 });
        return;
      }
      
      // Use the performLogin utility for standardized login
      console.log(`Attempting login as ${form.role} with email: ${form.email}`);
      const result = await performLogin(form.email, form.password, form.role);
      
      // Handle login result
      if (result.success) {
        // Login successful
        toast.success(`Welcome, ${result.user.name || result.user.role}!`, { autoClose: 2000 });
        
        // Redirect based on role
        redirectAfterLogin(result.user);
      } 
      else if (result.mfaRequired) {
        // MFA verification required
        setMfaRequired(true);
        setPendingUser(result.user);
        await axios.post('/api/mfa/send-otp', { email: form.email });
        setStep(2);
        toast.info('OTP sent to your email.', { autoClose: 3000 });
      } 
      else {
        // Login failed
        const errorMessage = result.error || 'Login failed';
        
        // Special handling for role mismatch
        if (result.status === 403) {
          toast.error(`Email not found or not allowed for ${form.role.charAt(0).toUpperCase() + form.role.slice(1)}.`);
        } else {
          toast.error(errorMessage);
        }
        
        setError(errorMessage);
      }
    } catch (err) {
      console.error('Unexpected login error:', err);
      toast.error('An unexpected error occurred during login.');
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setOtpError('');
    try {
      // Verify OTP
      const otpResponse = await axios.post('/api/mfa/verify-otp', { email: form.email, otp });
      
      if (!otpResponse.data.success) {
        throw new Error('OTP verification failed');
      }
      
      // After successful OTP verification, login directly using JWT
      const loginResponse = await axios.post('/api/auth/login', {
        email: form.email,
        password: form.password,
        role: form.role,
        mfaVerified: true
      });
      
      if (loginResponse.data && loginResponse.data.token) {
        // Store token and user data
        localStorage.setItem('lms_token', loginResponse.data.token);
        localStorage.setItem('user', JSON.stringify(loginResponse.data.user));
        
        toast.success('Login successful! Redirecting...', { autoClose: 2000 });
        
        // Redirect based on role
        setTimeout(() => {
          if (form.role === 'instructor') {
            navigate('/instructor/home');
          } else if (form.role === 'student') {
            navigate('/student');
          } else if (form.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/');
          }
        }, 1000);
      } else {
        throw new Error('Failed to authenticate after OTP verification');
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      const errorMessage = err.response?.data?.error || 'Invalid or expired OTP';
      toast.error(errorMessage);
      setOtpError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    setOtpError('');
    try {
      await axios.post('/api/mfa/send-otp', { email: form.email });
      setResendTimer(60);
      toast.info('OTP resent to your email.', { autoClose: 3000 });
    } catch (err) {
      toast.error('Failed to resend OTP. Try again.');
      setOtpError('Failed to resend OTP. Try again.');
    } finally {
      setResendLoading(false);
    }
  };

  useEffect(() => {
    let timer;
    if (step === 2 && resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, resendTimer]);

  return (
    <AuthLayout>
      <ToastContainer position="top-center" autoClose={2500} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover theme="colored" />
      <motion.div
        className="login-container"
        style={{ background: 'rgba(255,255,255,0.92)', borderRadius: 18, boxShadow: '0 6px 32px #43cea244', padding: 28, maxWidth: 350, width: '98vw', margin: '36px auto', position: 'relative', perspective: 900 }}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.04, boxShadow: '0 16px 48px 12px #43cea244' }}
        transition={{ duration: 0.8, type: 'spring', stiffness: 120 }}
      >
        <h2 style={{ fontFamily: 'Poppins', color: '#185a9d', fontWeight: 700, textAlign: 'center', marginBottom: 14, textShadow: '0 2px 18px #43cea244' }}>Sign In</h2>
        <AuthRoleSelector value={form.role} onChange={role => setForm({ ...form, role })} />
        {step === 1 && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email" required style={{ padding: 8, borderRadius: 7, border: '1.5px solid #e3e6f3', fontSize: 15 }} />
            <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Password" required style={{ padding: 8, borderRadius: 7, border: '1.5px solid #e3e6f3', fontSize: 15 }} />
            {error && <div style={{ color: '#ff5b5b', fontWeight: 600 }}>{error}</div>}
            <button type="submit" className="login-btn" style={{ background: 'linear-gradient(90deg,#43cea2,#185a9d)', color: '#fff', border: 'none', borderRadius: 7, padding: '10px 0', fontWeight: 700, fontSize: 17, marginTop: 8 }} disabled={loading}>{loading ? 'Checking...' : 'Continue'}</button>
            {form.role !== 'admin' && (
              <button type="button" onClick={() => navigate('/register?role=' + form.role)} style={{ background: 'none', color: '#185a9d', border: 'none', fontSize: 15, textDecoration: 'underline', cursor: 'pointer', marginTop: 4 }}>Create Account</button>
            )}
            {form.role !== 'admin' && (
              <button type="button" onClick={() => navigate('/forgot-password')} style={{ background: 'none', color: '#185a9d', border: 'none', fontSize: 15, textDecoration: 'underline', cursor: 'pointer', marginTop: 2 }}>Forgot Password?</button>
            )}
          </form>
        )}
        
        {step === 2 && (
          <form onSubmit={handleOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            <p style={{ textAlign: 'center', color: '#185a9d' }}>Enter the verification code sent to your email</p>
            <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" required style={{ padding: 12, borderRadius: 7, border: '1.5px solid #e3e6f3', fontSize: 16, textAlign: 'center', letterSpacing: 2 }} />
            {otpError && <div style={{ color: '#ff5b5b', fontWeight: 600 }}>{otpError}</div>}
            <button type="submit" style={{ background: 'linear-gradient(90deg,#43cea2,#185a9d)', color: '#fff', border: 'none', borderRadius: 7, padding: '10px 0', fontWeight: 700, fontSize: 17, marginTop: 8 }} disabled={loading}>{loading ? 'Verifying...' : 'Verify OTP'}</button>
            {resendTimer > 0 ? (
              <p style={{ textAlign: 'center', fontSize: 14, color: '#666' }}>Resend in {resendTimer}s</p>
            ) : (
              <button type="button" onClick={handleResendOtp} disabled={resendLoading} style={{ background: 'none', color: '#185a9d', border: 'none', fontSize: 15, textDecoration: 'underline', cursor: 'pointer', marginTop: 2 }}>{resendLoading ? 'Sending...' : 'Resend OTP'}</button>
            )}
            <button type="button" onClick={() => setStep(1)} style={{ background: 'none', color: '#666', border: 'none', fontSize: 14, textDecoration: 'underline', cursor: 'pointer', marginTop: 2 }}>Back to Login</button>
          </form>
        )}
      </motion.div>
    </AuthLayout>
  );
}