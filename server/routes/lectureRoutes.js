const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth, requireRole } = require('../middleware/auth');
const Lecture=require('../models/Lecture');
const ensureAuth = require('../middleware/ensureAuth');
// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/lectures';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'), false);
    }
  }
});

// Create a new lecture
router.post('/', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a video file' });
    }

    const lecture = {
      courseName: req.body.courseName,
      title: req.body.title,
      videoUrl: `/uploads/lectures/${req.file.filename}`,
      instructor: req.user.id,
      createdAt: new Date()
    };

    // Save to database (example using mongoose)
    // const newLecture = new Lecture(lecture);
    // await newLecture.save();

    res.status(201).json(lecture);
  } catch (error) {
    console.error('Error creating lecture:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all lectures
router.get('/',ensureAuth, async (req, res) => {
  try {
    // Example using mongoose
    // const lectures = await Lecture.find({ instructor: req.user.id }).sort('-createdAt');
    // res.json(lectures);
    
    // For now, return empty array
    res.json([]);
  } catch (error) {
    console.error('Error fetching lectures:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a lecture
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
   
    const lecture = await Lecture.findById(req.params.id);
    if (!lecture) return res.status(404).json({ message: 'Lecture not found' });
    
    if (lecture.instructor.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    //Delete video file
    const videoPath = path.join(__dirname, '..', lecture.videoUrl);
    if (fs.existsSync(videoPath)) {
      fs.unlinkSync(videoPath);
    }
    
    await lecture.remove();
    
    res.json({ message: 'Lecture deleted successfully' });
  } catch (error) {
    console.error('Error deleting lecture:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;