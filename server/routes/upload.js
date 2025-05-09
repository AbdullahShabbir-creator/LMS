const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../utils/cloudinary');
const firebaseBridge = require('../utils/firebase-bridge');
const { auth, requireRole } = require('./auth');

// Set up multer for handling multipart/form-data
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  }
});

// POST /api/upload - Upload a video to Cloudinary (with Firebase compatibility)
router.post('/', auth, requireRole('instructor'), upload.single('video'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    // Check file type
    if (!req.file.mimetype.startsWith('video/')) {
      return res.status(400).json({ message: 'Please upload a valid video file' });
    }

    // Log for debugging
    console.log(`Upload request received for ${req.file.originalname} (${req.file.size} bytes)`);
    
    try {
      // Use our Firebase bridge for better compatibility
      const uploadResult = await firebaseBridge.uploadVideo(
        req.file.buffer,
        req.file.mimetype, 
        {
          folder: 'course_videos',
          resource_type: 'video',
          // Include filename for better organization
          public_id: `course_videos/${Date.now()}_${req.file.originalname.replace(/\.[^/.]+$/, "")}`
        }
      );
      
      // Return Firebase-compatible response
      return res.json({ 
        url: uploadResult.url, 
        public_id: uploadResult.public_id,
        duration: uploadResult.duration || 0,
        // Include Firebase-compatible fields
        downloadURL: uploadResult.downloadURL,
        metadata: uploadResult.metadata
      });
    } catch (uploadError) {
      console.error('Upload error:', uploadError);
      return res.status(500).json({ 
        message: 'Failed to upload video to cloud storage', 
        error: uploadError.message 
      });
    }
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;