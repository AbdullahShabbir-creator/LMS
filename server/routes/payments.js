const express = require('express');
const { auth, requireRole } = require('./auth');
const Course = require('../models/Course');
const User = require('../models/User');
const Payment = require('../models/Payment');

const router = express.Router();

// Get all payments (admin only)
router.get('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('course', 'title')
      .populate('student', 'name email')
      .sort({ createdAt: -1 });
    
    const formattedPayments = payments.map(payment => ({
      _id: payment._id,
      courseTitle: payment.course.title,
      studentName: payment.student.name,
      studentEmail: payment.student.email,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      reference: payment.reference,
      status: payment.status,
      date: payment.createdAt.toISOString().split('T')[0]
    }));
    
    res.json(formattedPayments);
  } catch (err) {
    console.error('Error fetching payments:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get instructor payments
router.get('/instructor', auth, requireRole('instructor'), async (req, res) => {
  try {
    // Get all courses by this instructor
    const instructorCourses = await Course.find({ instructor: req.user._id }).select('_id');
    const courseIds = instructorCourses.map(course => course._id);
    
    // Find payments for these courses
    const payments = await Payment.find({
      course: { $in: courseIds },
      status: 'approved'
    })
      .populate('course', 'title')
      .populate('student', 'name')
      .sort({ createdAt: -1 });
    
    res.json(payments);
  } catch (err) {
    console.error('Error fetching instructor payments:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student payments
router.get('/student', auth, requireRole('student'), async (req, res) => {
  try {
    const payments = await Payment.find({ student: req.user._id })
      .populate('course', 'title')
      .sort({ createdAt: -1 });
    
    res.json(payments);
  } catch (err) {
    console.error('Error fetching student payments:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Process payment
router.post('/', auth, requireRole('student'), async (req, res) => {
  try {
    const { courseId, paymentMethod, reference, amount } = req.body;
    
    // Validate course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if student is already enrolled
    if (course.students.includes(req.user._id)) {
      return res.status(400).json({ message: 'You are already enrolled in this course' });
    }
    
    // Create payment (pending by default)
    const payment = new Payment({
      course: courseId,
      student: req.user._id,
      amount,
      paymentMethod,
      reference,
      status: 'pending'
    });
    
    await payment.save();
    res.json({ message: 'Payment submitted for approval' });
  } catch (err) {
    console.error('Error processing payment:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve payment (admin only)
router.patch('/:paymentId/approve', auth, requireRole('admin'), async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Update payment status
    payment.status = 'approved';
    await payment.save();
    
    // Enroll student in course
    const course = await Course.findById(payment.course);
    if (!course.students.includes(payment.student)) {
      course.students.push(payment.student);
      await course.save();
    }
    
    res.json({ message: 'Payment approved and student enrolled' });
  } catch (err) {
    console.error('Error approving payment:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject payment (admin only)
router.patch('/:paymentId/reject', auth, requireRole('admin'), async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Update payment status
    payment.status = 'rejected';
    await payment.save();
    
    res.json({ message: 'Payment rejected' });
  } catch (err) {
    console.error('Error rejecting payment:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 