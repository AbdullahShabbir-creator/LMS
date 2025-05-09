const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'default_cloud_name',
  api_key: process.env.CLOUDINARY_API_KEY || 'default_api_key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'default_api_secret',
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