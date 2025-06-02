const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../utils/cloudinary');
const firebaseBridge = require('../utils/firebase-bridge');
const { auth, requireRole } = require('../middleware/auth');
const Lecture=require('../models/Lecture')
const Course=require('../models/Course')
// Set up multer for handling multipart/form-data
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  }
});

// POST /api/upload - Upload a video to Cloudinary (with Firebase compatibility)
// POST /api/upload - Upload a video to Cloudinary (with Firebase compatibility)
router.post('/', upload.single('video'), async (req, res) => {
  try {
    const { courseId, lectureTitle } = req.body;

    if (!courseId || !lectureTitle) {
      return res.status(400).json({ message: 'courseId and lectureTitle are required' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No video file uploaded' });
    }

    // Convert buffer to base64 for Cloudinary
    const fileBuffer = req.file.buffer;
    const mimeType = req.file.mimetype;
    const base64 = fileBuffer.toString('base64');
    const dataURI = `data:${mimeType};base64,${base64}`;

    // Upload video to Cloudinary
    const result = await cloudinary.uploader.upload_large(dataURI, {
      resource_type: 'video',
      folder: 'course_videos',
    });




    

    res.json({
      message: 'Video uploaded and lecture added successfully',
     
      url:result.secure_url,
      public_id:result.public_id,
     
    });
  } catch (error) {
    console.error('Upload and save failed:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});




module.exports = router;