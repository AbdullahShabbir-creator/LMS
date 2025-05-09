const express = require('express');
const router = express.Router();
const User = require('../models/User');
const nodemailer = require('nodemailer');

// Send OTP to email
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });
    
    // Try to find the user
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.mfaEmailOtp = otp;
    user.mfaOtpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes expiry
    await user.save();

    // Send email with the OTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
    
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: user.email,
      subject: 'Your LMS OTP Code',
      text: `Your OTP code is: ${otp}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
          <h2 style="color: #185a9d; text-align: center;">LMS Authentication</h2>
          <p>Hello ${user.name || 'User'},</p>
          <p>Your one-time verification code is:</p>
          <div style="text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; padding: 10px 20px; background-color: #f5f5f5; border-radius: 5px;">${otp}</span>
          </div>
          <p>This code will expire in 5 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      `
    });
    
    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }
    
    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if OTP exists and hasn't expired
    if (!user.mfaEmailOtp || !user.mfaOtpExpires) {
      return res.status(400).json({ error: 'No OTP sent or OTP expired. Please request a new one.' });
    }
    
    // Verify the OTP
    if (user.mfaEmailOtp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP. Please check and try again.' });
    }
    
    // Check if OTP has expired
    if (Date.now() > user.mfaOtpExpires) {
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }
    
    // Clear the OTP after successful verification
    user.mfaEmailOtp = null;
    user.mfaOtpExpires = null;
    await user.save();
    
    res.json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

module.exports = router;
