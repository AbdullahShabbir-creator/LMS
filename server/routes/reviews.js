const express = require('express');
const { auth, requireRole } = require('../middleware/auth');
const Course = require('../models/Course');
const User = require('../models/User');
const Review = require('../models/Review');

const router = express.Router();

// Get all reviews (admin only)
router.get('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('course', 'title')
      .populate('student', 'name email');
    
    const formattedReviews = reviews.map(review => ({
      _id: review._id,
      courseTitle: review.course.title,
      studentName: review.student.name,
      studentEmail: review.student.email,
      rating: review.rating,
      comment: review.comment,
      status: review.status,
      createdAt: review.createdAt
    }));
    
    res.json(formattedReviews);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get course reviews
router.get('/course/:courseId', auth, async (req, res) => {
  try {
    const { courseId } = req.params;
    const reviews = await Review.find({
      course: courseId,
      status: 'approved'
    }).populate('student', 'name');
    
    res.json(reviews);
  } catch (err) {
    console.error('Error fetching course reviews:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new review
router.post('/', auth, requireRole('student'), async (req, res) => {
  try {
    const { courseId, rating, comment } = req.body;
    const studentId = req.user._id;
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if student is enrolled in the course
    if (!course.students.includes(studentId)) {
      return res.status(403).json({ message: 'You must be enrolled in the course to review it' });
    }
    
    // Check if student has already reviewed this course
    const existingReview = await Review.findOne({ course: courseId, student: studentId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this course' });
    }
    
    // Create new review (pending by default)
    const review = new Review({
      course: courseId,
      student: studentId,
      rating,
      comment,
      status: 'pending'
    });
    
    await review.save();
    res.json({ message: 'Review submitted for approval' });
  } catch (err) {
    console.error('Error adding review:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve review (admin only)
router.patch('/:reviewId/approve', auth, requireRole('admin'), async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    review.status = 'approved';
    await review.save();
    
    res.json({ message: 'Review approved' });
  } catch (err) {
    console.error('Error approving review:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete review (admin or owner)
router.delete('/:reviewId', auth, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if user is admin or review owner
    if (req.user.role !== 'admin' && review.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    await Review.findByIdAndDelete(reviewId);
    res.json({ message: 'Review deleted' });
  } catch (err) {
    console.error('Error deleting review:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 