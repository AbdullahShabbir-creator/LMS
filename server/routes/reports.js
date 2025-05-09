const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('./auth');
const Course = require('../models/Course');
const User = require('../models/User');

// GET /api/reports/instructor - Instructor summary report
router.get('/instructor', auth, requireRole('instructor'), async (req, res) => {
  try {
    const instructorId = req.user._id;
    const courses = await Course.find({ instructor: instructorId });
    const students = await User.countDocuments({ role: 'student' });
    // For demo, fake earnings
    const earnings = courses.length * 500; // $500 per course for demo
    res.json({
      courses: courses.length,
      students,
      earnings,
      recent: [
        '3 new students enrolled this week',
        'Course "React Basics" received 2 new reviews',
        'You earned $200 this month',
      ]
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch report', error: err.message });
  }
});

module.exports = router;
