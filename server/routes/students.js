const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress');
const Notification = require('../models/Notification');
const Course = require('../models/Course');
const ensureAuth = require('../middleware/ensureAuth');

// Attach authentication middleware to all student routes
router.use(ensureAuth);

// Get courses the student is enrolled in (purchased or free)
router.get('/enrolled-courses', async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Find courses where the student is in the students array
    const courses = await Course.find({ students: userId }).populate('instructor', 'name email');
    
    res.json({ courses });
  } catch (err) {
    console.error('Error fetching enrolled courses:', err);
    res.status(500).json({ error: 'Failed to fetch enrolled courses' });
  }
});

// Get only purchased courses (not free ones)
router.get('/purchased-courses', async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Find paid courses where the student is in the students array
    const courses = await Course.find({ 
      students: userId,
      isFree: false
    }).populate('instructor', 'name email');
    
    res.json({ courses });
  } catch (err) {
    console.error('Error fetching purchased courses:', err);
    res.status(500).json({ error: 'Failed to fetch purchased courses' });
  }
});

// Enroll in a course (for free courses)
router.post('/enroll/:courseId', async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const courseId = req.params.courseId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    // Check if already enrolled
    if (course.students.includes(userId)) {
      return res.status(400).json({ error: 'Already enrolled in this course' });
    }
    
    // Add student to the course
    course.students.push(userId);
    await course.save();
    
    // Create initial progress record
    await Progress.findOneAndUpdate(
      { user: userId, courseId },
      { 
        user: userId,
        courseId,
        progress: 0,
        lastAccessed: new Date(),
        details: []
      },
      { upsert: true, new: true }
    );
    
    res.json({ 
      success: true, 
      message: 'Successfully enrolled in course',
      course
    });
  } catch (err) {
    console.error('Error enrolling in course:', err);
    res.status(500).json({ error: 'Failed to enroll in course' });
  }
});

// --- Progress Details API endpoint for lesson-by-lesson ---
// GET /api/student/progress/:courseId
router.get('/progress/:courseId', async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const courseId = req.params.courseId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const progress = await Progress.findOne({ user: userId, courseId });
    if (!progress) {
      return res.status(404).json({ error: 'No progress found for this course' });
    }
    res.json({ details: progress.details || [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch progress details' });
  }
});

// --- Progress API endpoint for frontend integration ---
// GET /api/student/progress
router.get('/progress', async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const progress = await Progress.find({ user: userId });
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// --- Notifications API endpoint ---
// GET /api/student/notifications
router.get('/notifications', async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const notifications = await Notification.find({ user: userId }).sort({ date: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// PATCH /api/student/notifications/:id/read
router.patch('/notifications/:id/read', async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// --- Delete/Deactivate Account ---
// DELETE /api/student/account
router.delete('/account', async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    // Remove user and their progress/notifications
    await require('../models/User').findByIdAndDelete(userId);
    await Progress.deleteMany({ user: userId });
    await Notification.deleteMany({ user: userId });
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

// PATCH /api/student/password
router.patch('/password', async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { oldPassword, newPassword } = req.body;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!oldPassword || !newPassword) return res.status(400).json({ error: 'Missing fields' });
    const User = require('../models/User');
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) return res.status(403).json({ error: 'Incorrect current password' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// PATCH /api/student/privacy
router.patch('/privacy', async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { publicProfile, leaderboard, dataConsent } = req.body;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const User = require('../models/User');
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (typeof publicProfile === 'boolean') user.publicProfile = publicProfile;
    if (typeof leaderboard === 'boolean') user.leaderboard = leaderboard;
    if (typeof dataConsent === 'boolean') user.dataConsent = dataConsent;
    await user.save();
    res.json({ message: 'Privacy settings updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update privacy settings' });
  }
});

// PATCH /api/student/2fa
router.patch('/2fa', async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { enabled } = req.body;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const User = require('../models/User');
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.twoFA = !!enabled;
    await user.save();
    res.json({ message: '2FA setting updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update 2FA setting' });
  }
});

// PATCH /api/student/mfa
router.patch('/mfa', async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { enabled } = req.body;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const User = require('../models/User');
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role !== 'student') return res.status(403).json({ error: 'Only students can change MFA setting' });
    user.mfaEnabled = !!enabled;
    await user.save();
    res.json({ message: `MFA ${enabled ? 'enabled' : 'disabled'} successfully`, mfaEnabled: user.mfaEnabled });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update MFA setting' });
  }
});

// PATCH /api/student/notifications
router.patch('/notifications', async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { assignment, grades, announcements, newsletter } = req.body;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const User = require('../models/User');
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (typeof assignment === 'boolean') user.notificationPrefs.assignment = assignment;
    if (typeof grades === 'boolean') user.notificationPrefs.grades = grades;
    if (typeof announcements === 'boolean') user.notificationPrefs.announcements = announcements;
    if (typeof newsletter === 'boolean') user.notificationPrefs.newsletter = newsletter;
    await user.save();
    res.json({ message: 'Notification preferences updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notification preferences' });
  }
});

// GET /api/student/notifications/prefs
router.get('/notifications/prefs', async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const User = require('../models/User');
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user.notificationPrefs || {});
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notification preferences' });
  }
});

module.exports = router;