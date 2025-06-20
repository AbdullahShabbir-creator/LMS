const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

// Configure your SMTP transporter with fallback
let transporter;
try {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    console.log('Email transporter configured with SMTP settings');
  } else {
    // Fallback to ethereal test account if no SMTP credentials
    console.log('No SMTP credentials found. Using test account.');
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: 'test@example.com', // Generated ethereal user
        pass: 'testpassword'      // Generated ethereal password
      }
    });
  }
} catch (error) {
  console.error('Failed to configure email transporter:', error);
  // Create a mock transporter that logs instead of sending
  transporter = {
    sendMail: (options) => {
      console.log('Would send email:', options);
      return Promise.resolve({ messageId: 'mock-id' });
    }
  };
}

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Get student count
router.get('/students/count', auth, requireRole('admin'), async (req, res) => {
  console.log('GET /students/count endpoint hit');
  console.log('User making request:', req.user);
  console.log('Headers:', req.headers);
  
  try {
    const count = await User.countDocuments({ role: 'student' });
    console.log('Found', count, 'students');
    res.json({ 
      success: true,
      count,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching student count:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching student count',
      error: error.message 
    });
  }
});

// Get instructor count
router.get('/instructors/count', auth, requireRole('admin'), async (req, res) => {
  console.log('GET /instructors/count endpoint hit');
  console.log('User making request:', req.user);
  
  try {
    const count = await User.countDocuments({ role: 'instructor' });
    console.log('Found', count, 'instructors');
    res.json({ 
      success: true,
      count,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching instructor count:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching instructor count',
      error: error.message 
    });
  }
});

// Middleware: Auth check
function auth(req, res, next) {
  console.log('Auth check middleware triggered');
  const authHeader = req.headers.authorization;
  console.log('Authorization header:', authHeader ? authHeader.split(' ')[1] : 'None');
  console.log(req.headers.authorization)

  // If we're in development mode, skip auth verification
  /*if (process.env.NODE_ENV === 'development') {
    console.log('Development mode: Skipping auth verification');
    // Create a proper MongoDB ObjectId for the demo user
    const demoUserId = new mongoose.Types.ObjectId();
    req.user = {
      _id: demoUserId,
      id: demoUserId,
      email: 'dev@example.com',
      role: 'admin',  // Changed to admin for development
      name: 'Development Admin'
      }
      return next();
    };*/

  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token verified, user:', decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    
    // For development - provide a fake user if JWT verification fails
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Providing test user after token failure');
      req.user = { 
        _id: 'test-fallback-user', 
        role: 'admin',  // Changed to admin for development
        email: 'test@example.com'
      };
      return next();
    }
    
    res.status(401).json({ message: 'Token is not valid' });
  }
}

// Middleware: Role check
function requireRole(role) {
  return (req, res, next) => {
   
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    if (req.user.role !== role) {
      console.log('Role mismatch:', req.user.role, '!==', role);
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    next();
  };
}

// Register (Instructor/Student)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
   
    if (role === 'admin') return res.status(400).json({ message: 'Cannot register as admin' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already in use' });
    const user = await User.create({ name, email, password, role });
    res.json({ message: 'Registered successfully' });
  } catch (err) {
    console.error('Register error:', err); 
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user (admin only)
router.delete('/users/:userId', [auth, requireRole('admin')], async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Ensure admin cannot delete themselves
    if (req.user._id.toString() === userId) {
      return res.status(400).json({ message: 'Cannot delete yourself' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Only allow deleting students or instructors, not admins
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin users' });
    }
    
    await User.findByIdAndDelete(userId);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

// Get all users (admin only)
router.get('/users', [auth, requireRole('admin')], async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Login (All roles)
router.post('/login', async (req, res) => {
  try {
    const { email, password, role, mfaVerified } = req.body;
    console.log('Login attempt:', { email, role, mfaVerified: !!mfaVerified });
    
    // First try to use the database if connected
    if (mongoose.connection.readyState === 1) {
      console.log('Using database authentication');
      // Find user by email
      const user = await User.findOne({ email });
      
      if (!user) {
        console.log('User not found in database');
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      
      // If role is specified, check it matches
      if (role && user.role !== role) {
        console.log(`Role mismatch: Expected ${role}, got ${user.role}`);
        return res.status(403).json({ 
          message: `Email not found or not allowed for ${role.charAt(0).toUpperCase() + role.slice(1)}.`
        });
      }
      
      // Check password
      const isMatch = await user.comparePassword(password);
      
      if (!isMatch) {
        console.log('Password does not match');
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      
      // Always require MFA for student and instructor roles - unless already verified
   /*   if ((user.role === 'student' || user.role === 'instructor') && !mfaVerified) {
        console.log('MFA required for', user.role);
        
        // Generate OTP code if necessary
        if (!user.mfaEnabled) {
          user.mfaEnabled = true;
          await user.save();
          console.log('MFA enabled for user:', user.email);
        }
        
        return res.json({
          mfaRequired: true,
          message: 'MFA verification required',
          user: { _id: user._id, name: user.name, email: user.email, role: user.role }
        });
      }
      */
      // Generate JWT token with backward compatible format
      const token = jwt.sign(
        { 
          _id: user._id,  // Keep _id for backward compatibility 
          id: user._id,   // Add id for newer code
          role: user.role, 
          email: user.email, 
          name: user.name 
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      console.log('Login successful, token generated');
      
      // Return user data in expected format
      return res.json({ 
        token, 
        user: { 
          _id: user._id, 
          name: user.name, 
          email: user.email, 
          role: user.role,
          mfaEnabled: user.mfaEnabled || false
        }
      });
    } 
    
    // Fallback for when database is not connected (development only)
    console.log('Database not connected, using fallback authentication');
    
    // Demo credentials with admin, student and instructor examples
    const demoUsers = [
      { email: 'student@example.com', password: 'password', role: 'student', name: 'Demo Student', id: 'student-1' },
      { email: 'instructor@example.com', password: 'password', role: 'instructor', name: 'Demo Instructor', id: 'instructor-1' },
      { email: 'admin@example.com', password: 'password', role: 'admin', name: 'Demo Admin', id: 'admin-1' },
      { email: 'admin@lms.com', password: 'admin123', role: 'admin', name: 'Admin', id: 'admin-system' },
    ];
    
    // Find matching user from demo list
    const demoUser = demoUsers.find(u => u.email === email && u.password === password);
    
    if (!demoUser) {
      console.log('No matching demo user found');
      return res.status(400).json({ 
        message: 'Invalid credentials',
        note: 'Using fallback authentication. Try student@example.com / password'
      });
    }
    
    // If role specified, check it matches
    if (role && demoUser.role !== role) {
      console.log(`Demo user role mismatch: Expected ${role}, got ${demoUser.role}`);
      return res.status(403).json({ 
        message: `Email not found or not allowed for ${role.charAt(0).toUpperCase() + role.slice(1)}.`
      });
    }
    
    // Always require MFA for student and instructor in development mode too - unless already verified
    if ((demoUser.role === 'student' || demoUser.role === 'instructor') && !mfaVerified) {
      console.log('Development mode: MFA required for', demoUser.role);
      return res.json({
        mfaRequired: true,
        message: 'MFA verification required',
        user: {
          _id: demoUser.id,
          name: demoUser.name,
          email: demoUser.email,
          role: demoUser.role
        }
      });
    }
    
    // After successful auth or if MFA is marked as verified, generate token
    const token = jwt.sign(
      { 
        _id: demoUser.id, 
        id: demoUser.id,
        name: demoUser.name,
        email: demoUser.email,
        role: demoUser.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    return res.json({
      token,
      user: {
        _id: demoUser.id,
        id: demoUser.id,
        name: demoUser.name,
        email: demoUser.email,
        role: demoUser.role
      }
    });
  } catch (err) {
    console.error('Login error:', err); 
    res.status(500).json({ message: 'Server error' });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    // Always respond with the same message for security
    if (!user) {
      return res.json({ message: 'If an account with this email exists, a reset link has been sent.' });
    }
    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();
    // Send email with reset link
    const resetUrl = `http://localhost:3000/reset-password/${token}`;
    await transporter.sendMail({
      to: user.email,
      subject: 'Password Reset for LMS',
      html: `<p>You requested a password reset. Click <a href="${resetUrl}">here</a> to reset your password. If you did not request this, please ignore this email.</p>`
    });
    return res.json({ message: 'If an account with this email exists, a reset link has been sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset Password
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });
    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();
    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json(user);
});

module.exports = { router, auth, requireRole };