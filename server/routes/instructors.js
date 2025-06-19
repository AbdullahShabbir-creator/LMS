const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');
const Course = require('../models/Course');
const multer = require('multer');
const cloudinary = require('../utils/cloudinary');
const Earning = require('../models/Earning');
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  }
});
// Get all instructors (admin only)
router.get('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const instructors = await User.find({ role: 'instructor' }, '-password');
    res.json(instructors);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/payment-requests', auth, requireRole('instructor'), async (req, res) => {
  try {
    // Find all courses taught by this instructor

    const courses = await Course.find({ instructor: req.user._id })
      .populate('paymentRequests.student', 'name email')
      .select('title paymentRequests');

    res.json(courses);
  } catch (err) {
    console.error('Error fetching payment requests:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});
router.post('/approve-payment', auth,requireRole('instructor'), async (req, res) => {
  try {
    const { courseId, studentId } = req.body;

    const course = await Course.findOne({ _id: courseId, instructor: req.user._id });

    if (!course) {
      return res.status(404).json({ message: 'Course not found or unauthorized' });
    }

    // Update isPaid to true for this student
    const studentEntry = course.students.find(s => s.student.toString() === studentId);
    if (!studentEntry) {
      return res.status(404).json({ message: 'Student not enrolled in course' });
    }

    studentEntry.isPaid = true;

    // Optional: update paymentRequest status too
    const reqEntry = course.paymentRequests.find(r => r.student.toString() === studentId);
    if (reqEntry) {
      reqEntry.status = 'approved';
      reqEntry.processedAt = new Date();
    }

    await course.save();

    res.json({ message: 'Payment approved successfully' });

  } catch (err) {
    console.error('Approve payment error:', err);
    res.status(500).json({ message: 'Server error approving payment' });
  }
});



router.get('/me', auth, async (req, res) => {
  try {
    const instructor = await User.findById(req.user._id).select('-password');
    if (!instructor) return res.status(404).json({ message: 'Instructor not found' });
    res.json(instructor);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
// (Optional) Get a single instructor by ID
router.get('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const instructor = await User.findById(req.params.id, '-password');
    if (!instructor || instructor.role !== 'instructor') return res.status(404).json({ message: 'Instructor not found' });
    res.json(instructor);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Suspend an instructor
router.patch('/:id/suspend', auth, requireRole('admin'), async (req, res) => {
  try {
    const instructor = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'suspended' },
      { new: true }
    );
    if (!instructor || instructor.role !== 'instructor') return res.status(404).json({ message: 'Instructor not found' });
    res.json(instructor);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get logged-in instructor info



// Activate an instructor
router.patch('/:id/activate', auth, requireRole('admin'), async (req, res) => {
  try {
    const instructor = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'active' },
      { new: true }
    );
    if (!instructor || instructor.role !== 'instructor') return res.status(404).json({ message: 'Instructor not found' });
    res.json(instructor);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete an instructor
router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const instructor = await User.findByIdAndDelete(req.params.id);
    if (!instructor || instructor.role !== 'instructor') return res.status(404).json({ message: 'Instructor not found' });
    res.json({ message: 'Instructor deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// --- Instructor Analytics Endpoints ---
// Get earnings per month for the logged-in instructor
router.get('/earnings', auth, requireRole('instructor'), async (req, res) => {
  try {
    // Aggregate earnings by month for this instructor
    const earnings = await Earning.aggregate([
      { $match: { instructor: req.user._id } },
      { $group: { _id: '$month', amount: { $sum: '$amount' } } },
      { $sort: { _id: 1 } }
    ]);
    // Format for frontend
    const result = earnings.map(e => ({ month: e._id, amount: e.amount }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get enrollments per month for the logged-in instructor
router.get('/enrollments', auth, requireRole('instructor'), async (req, res) => {
  try {
    // Find all courses by instructor
    const courses = await Course.find({ instructor: req.user._id });
    // Flatten all students from all courses
    let enrollmentsByMonth = {};
    for (const course of courses) {
      // For demo, use course.createdAt as enrollment month
      const month = course.createdAt ? course.createdAt.toLocaleString('default', { month: 'short', year: 'numeric' }) : 'Unknown';
      enrollmentsByMonth[month] = (enrollmentsByMonth[month] || 0) + (course.students ? course.students.length : 0);
    }
    // Convert to array for frontend
    const result = Object.entries(enrollmentsByMonth).map(([month, count]) => ({ month, count }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get course engagement data for the logged-in instructor
router.get('/engagement', auth, requireRole('instructor'), async (req, res) => {
  try {
    // For demo: aggregate engagement from all courses
    const courses = await Course.find({ instructor: req.user._id });
    let completed = 0, inProgress = 0, notStarted = 0;
    for (const course of courses) {
      // Assume each course has a students array and each student has a status
      // In real app, this would come from a progress/engagement model
      if (course.students && Array.isArray(course.students)) {
        for (const student of course.students) {
          // Randomly assign status for demo
          const status = ['completed', 'inProgress', 'notStarted'][Math.floor(Math.random()*3)];
          if (status === 'completed') completed++;
          else if (status === 'inProgress') inProgress++;
          else notStarted++;
        }
      }
    }
    res.json([
      { id: 'Completed', label: 'Completed', value: completed },
      { id: 'In Progress', label: 'In Progress', value: inProgress },
      { id: 'Not Started', label: 'Not Started', value: notStarted }
    ]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update instructor's name, email, and bio    
// Update instructor profile (name, email, bio)
// routes/instructor.js or similar file

router.put(
  '/update-profile',
  upload.single('avatar'),
  auth,
  
  async (req, res) => {
    try {
      const { name, email, bio } = req.body;
      const updateData = { name, email, bio };

      // Handle avatar image upload to Cloudinary
      console.log(req.file)
      if (req.file) {
        const fileBuffer = req.file.buffer;
        const mimeType = req.file.mimetype;
        const base64 = fileBuffer.toString('base64');
        const dataURI = `data:${mimeType};base64,${base64}`;

        const result = await cloudinary.uploader.upload(dataURI, {
          folder: 'profile', // your Cloudinary folder
        });

        updateData.avatar = result.secure_url; // set Cloudinary image URL
      }

      const updated = await User.findByIdAndUpdate(
        req.user._id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!updated) {
        return res.status(404).json({ message: 'Instructor not found' });
      }

      res.json({ message: 'Profile updated successfully!', user: updated });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);


router.put(
  '/uploadlecture',
  upload.single('video'),
  auth,
  async (req, res) => {
    try {
      const { courseId, lectureTitle } = req.body;

      if (!req.file) {
        return res.status(400).json({ message: 'Video file is required' });
      }

      const fileBuffer = req.file.buffer;
      const mimeType = req.file.mimetype;
      const base64 = fileBuffer.toString('base64');
      const dataURI = `data:${mimeType};base64,${base64}`;

      // Upload video to Cloudinary
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'lectures',
        resource_type: 'video'
      });

      // Update course with new lecture
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      course.curriculum.push({
        title: lectureTitle,
        
        videoUrl: result.secure_url,
        videoPublicId: result.public_id,
      });

      await course.save();

      res.status(201).json({ message: 'Lecture added successfully', course });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;  
