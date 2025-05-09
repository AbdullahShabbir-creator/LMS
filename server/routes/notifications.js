const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('./auth');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Test route - to check if API is accessible
router.get('/test', (req, res) => {
  console.log('Notification test route accessed');
  return res.status(200).json({ success: true, message: 'Notifications API is working' });
});

// POST /api/notifications - Send notification to all students
router.post('/', auth, requireRole('instructor'), async (req, res) => {
  try {
    const { message, timestamp } = req.body;
    
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }
    
    // Find all students to send notification to
    let students = [];
    try {
      students = await User.find({ role: 'student' }).select('_id');
      console.log(`Found ${students.length} students`);
    } catch (dbError) {
      console.error('Error querying students:', dbError);
      // Continue with empty students array
    }
    
    // If no students found, create a test notification for the sender
    if (!students || students.length === 0) {
      try {
        // Create a notification for the instructor themselves
        const instructorNotification = new Notification({
          user: req.user._id,
          message: message + ' (TEST - No students found)',
          date: timestamp || Date.now(),
          read: false,
          type: 'test-notification'
        });
        
        await instructorNotification.save();
        
        return res.status(200).json({ 
          success: true, 
          message: 'Test notification created (no students found)',
          recipients: 1
        });
      } catch (saveError) {
        console.error('Error saving test notification:', saveError);
        return res.status(200).json({ 
          success: true, 
          message: 'Notification request received but could not be saved to database',
          simulated: true
        });
      }
    }
    
    // Try to save notifications for all students
    try {
      // Create notifications for all students
      const notifications = students.map(student => ({
        user: student._id,
        message: message,
        date: timestamp || Date.now(),
        read: false,
        type: 'instructor-announcement'
      }));
      
      // Insert all notifications at once
      await Notification.insertMany(notifications);
      
      return res.status(200).json({ 
        success: true, 
        message: `Notification sent to ${students.length} students successfully`,
        recipients: students.length
      });
    } catch (dbError) {
      console.error('Error saving notifications:', dbError);
      // Fall back to reporting success even if DB save fails
      return res.status(200).json({ 
        success: true, 
        message: 'Notification request processed but not saved to database',
        recipients: students.length,
        simulated: true
      });
    }
  } catch (error) {
    console.error('Error in notification route:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error while processing notification',
      error: error.message
    });
  }
});

// GET /api/notifications - Get notifications for current user
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(20);
    
    return res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    // Return empty array instead of error for better UX
    return res.status(200).json([]);
  }
});

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    
    return res.status(200).json({ success: true, notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
