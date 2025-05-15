const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('./auth');
const Course = require('../models/Course');

// Get all courses (student version, public)
router.get('/public', async (req, res) => {
  try {
    const courses = await Course.find().populate('instructor', 'name email');
    res.json({ courses });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get only free courses
router.get('/free', async (req, res) => {
  try {
    const courses = await Course.find({ isFree: true }).populate('instructor', 'name email');
    res.json({ courses });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get only paid courses
router.get('/paid', async (req, res) => {
  try {
    const courses = await Course.find({ isFree: false }).populate('instructor', 'name email');
    res.json({ courses });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all courses (admin only)
router.get('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const courses = await Course.find().populate('instructor', 'name email');
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// (Optional) Get a single course by ID
router.get('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('instructor', 'name email');
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a course (instructor)
router.post('/', auth, requireRole('instructor'), async (req, res) => {
  try {
    const { title, category, description, price, isFree, paymentMethod, jazzCashNumber, meezanBankAccount } = req.body;
    
    // Validate required fields
    if (!title || !category || !description) {
      return res.status(400).json({ message: 'Missing required fields: title, category, and description are required' });
    }

    // Set instructor to the current authenticated user
    const instructor = req.user._id;

    // Validate payment information if course is not free
    if (!isFree) {
      if (!paymentMethod || !['JazzCash', 'MeezanBank'].includes(paymentMethod)) {
        return res.status(400).json({ message: 'Invalid payment method' });
      }
      if (paymentMethod === 'JazzCash' && !jazzCashNumber) {
        return res.status(400).json({ message: 'JazzCash number is required for JazzCash payment method' });
      }
      if (paymentMethod === 'MeezanBank' && !meezanBankAccount) {
        return res.status(400).json({ message: 'Meezan Bank account is required for Meezan Bank payment method' });
      }
    }

    const course = await Course.create({
      title,
      instructor,
      category,
      description,
      price: isFree ? 0 : price,
      isFree,
      paymentMethod: isFree ? 'None' : paymentMethod,
      jazzCashNumber: paymentMethod === 'JazzCash' ? jazzCashNumber : undefined,
      meezanBankAccount: paymentMethod === 'MeezanBank' ? meezanBankAccount : undefined
    });

    res.status(201).json(course);
  } catch (err) {
    console.error('Course creation error:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', errors: err.errors });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Edit a course (instructor)
router.put('/:id', auth, requireRole('instructor'), async (req, res) => {
  try {
    const { title, instructor, category, description, price, isFree, paymentMethod, jazzCashNumber, meezanBankAccount } = req.body;
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      {
        title,
        instructor,
        category,
        description,
        price: isFree ? 0 : price,
        isFree,
        paymentMethod: isFree ? 'None' : paymentMethod,
        jazzCashNumber: paymentMethod === 'JazzCash' ? jazzCashNumber : undefined,
        meezanBankAccount: paymentMethod === 'MeezanBank' ? meezanBankAccount : undefined
      },
      { new: true }
    );
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a course (admin)
router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json({ message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Student purchases a course (direct enrollment for simplicity)
router.post('/purchase/:id', auth, requireRole('student'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.isFree) return res.status(400).json({ message: 'Course is already free' });
    if (course.students.includes(req.user._id)) return res.status(400).json({ message: 'Already purchased' });
    
    // Add student directly to the course (for simplicity)
    course.students.push(req.user._id);
    await course.save();
    
    // Create initial progress record
    const Progress = require('../models/Progress');
    await Progress.findOneAndUpdate(
      { user: req.user._id, courseId: course._id },
      { 
        user: req.user._id,
        courseId: course._id,
        progress: 0,
        lastAccessed: new Date(),
        details: []
      },
      { upsert: true, new: true }
    );
    
    // Return success
    res.json({ 
      success: true, 
      message: 'Course purchased successfully. You now have access to this course.' 
    });
  } catch (err) {
    console.error('Error purchasing course:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Instructor/admin approves or rejects a payment request
router.patch('/:courseId/approve-payment/:requestId', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    const request = course.paymentRequests.id(req.params.requestId);
    if (!request) return res.status(404).json({ message: 'Payment request not found' });
    // Only instructor or admin can approve
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (request.status !== 'pending') return res.status(400).json({ message: 'Request already processed' });
    if (req.body.action === 'approve') {
      request.status = 'approved';
      request.processedAt = new Date();
      if (!course.students.includes(request.student)) {
        course.students.push(request.student);
      }
    } else if (req.body.action === 'reject') {
      request.status = 'rejected';
      request.processedAt = new Date();
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }
    await course.save();
    res.json({ message: `Request ${req.body.action}d` });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
