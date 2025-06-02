const express = require('express');
const { auth, requireRole } = require('../middleware/auth');
const Setting = require('../models/Setting');

const router = express.Router();

// Get all settings (admin only)
router.get('/settings', auth, requireRole('admin'), async (req, res) => {
  try {
    const settings = await Setting.findOne() || new Setting();
    res.json(settings);
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update settings (admin only)
router.put('/settings', auth, requireRole('admin'), async (req, res) => {
  try {
    // Validate input
    const {
      siteName,
      siteDescription,
      maintenanceMode,
      allowRegistration,
      defaultUserRole,
      maxUploadSize,
      enableDarkMode,
      smtpHost,
      smtpPort,
      smtpUsername,
      enableEmailNotifications,
      emailSignature
    } = req.body;

    // Find existing settings or create new ones
    let settings = await Setting.findOne();
    
    if (!settings) {
      settings = new Setting();
    }

    // Update settings with new values
    if (siteName !== undefined) settings.general.siteName = siteName;
    if (siteDescription !== undefined) settings.general.siteDescription = siteDescription;
    if (maintenanceMode !== undefined) settings.general.maintenanceMode = maintenanceMode;
    if (allowRegistration !== undefined) settings.general.allowRegistration = allowRegistration;
    if (defaultUserRole !== undefined) settings.general.defaultUserRole = defaultUserRole;
    if (maxUploadSize !== undefined) settings.general.maxUploadSize = maxUploadSize;
    if (enableDarkMode !== undefined) settings.general.enableDarkMode = enableDarkMode;
    
    if (smtpHost !== undefined) settings.email.smtpHost = smtpHost;
    if (smtpPort !== undefined) settings.email.smtpPort = smtpPort;
    if (smtpUsername !== undefined) settings.email.smtpUsername = smtpUsername;
    if (enableEmailNotifications !== undefined) settings.email.enableEmailNotifications = enableEmailNotifications;
    if (emailSignature !== undefined) settings.email.emailSignature = emailSignature;

    // Record the user who last updated settings
    settings.lastUpdatedBy = req.user._id;
    
    await settings.save();
    res.json({ message: 'Settings updated successfully', settings });
  } catch (err) {
    console.error('Error updating settings:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get system stats (admin only)
router.get('/stats', auth, requireRole('admin'), async (req, res) => {
  try {
    const User = require('../models/User');
    const Course = require('../models/Course');
    const Payment = require('../models/Payment');
    
    const studentCount = await User.countDocuments({ role: 'student' });
    const instructorCount = await User.countDocuments({ role: 'instructor' });
    const courseCount = await Course.countDocuments();
    
    // Calculate total revenue
    const payments = await Payment.find({ status: 'approved' });
    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
    
    // Get recent registrations
    const recentUsers = await User.find()
      .sort({ _id: -1 })
      .limit(5)
      .select('name email role createdAt');
    
    res.json({
      studentCount,
      instructorCount,
      courseCount,
      totalRevenue,
      recentUsers
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 