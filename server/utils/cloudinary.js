require('dotenv').config(); // Add this at the very top of your file
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,

  secure: true
});

// Set higher timeout for large uploads
cloudinary.uploader.upload_large = function(file, options = {}) {
  return new Promise((resolve, reject) => {
    const defaultOptions = {
      resource_type: 'video',
      chunk_size: 6000000, // 6MB chunks
      timeout: 120000, // 2-minute timeout
    };
    
    const uploadOptions = { ...defaultOptions, ...options };
    
    cloudinary.uploader.upload(file, uploadOptions, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

module.exports = cloudinary;