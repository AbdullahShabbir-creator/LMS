/**
 * Firebase Bridge for Cloudinary
 * 
 * This utility provides compatibility between Cloudinary and Firebase storage
 * for applications that expect a Firebase URL structure.
 */
const cloudinary = require('./cloudinary');

// Map Cloudinary results to Firebase-compatible format
function mapCloudinaryToFirebase(cloudinaryResult) {
  if (!cloudinaryResult) return null;
  
  return {
    // Main URL
    url: cloudinaryResult.secure_url,
    // Firebase uses downloadURL, so we provide both for compatibility
    downloadURL: cloudinaryResult.secure_url,
    // Maintain Cloudinary IDs for future operations
    public_id: cloudinaryResult.public_id,
    // Add metadata similar to Firebase
    metadata: {
      contentType: cloudinaryResult.format ? `video/${cloudinaryResult.format}` : 'video/mp4',
      size: cloudinaryResult.bytes || 0,
      timeCreated: cloudinaryResult.created_at || new Date().toISOString(),
      updated: cloudinaryResult.updated_at || new Date().toISOString(),
    },
    // Video-specific properties
    duration: cloudinaryResult.duration || 0,
    width: cloudinaryResult.width || 0, 
    height: cloudinaryResult.height || 0
  };
}

// Upload to Cloudinary with Firebase-compatible response
async function uploadVideo(fileBuffer, mimeType, options = {}) {
  try {
    // Convert buffer to data URI
    const b64 = Buffer.from(fileBuffer).toString('base64');
    const dataURI = `data:${mimeType};base64,${b64}`;
    
    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(dataURI, {
        resource_type: 'video',
        folder: options.folder || 'course_videos',
        chunk_size: options.chunkSize || 6000000, // 6MB chunks
        timeout: options.timeout || 180000, // 3 minute timeout
        ...options
      }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });
    
    // Map to Firebase format
    return mapCloudinaryToFirebase(uploadResult);
  } catch (error) {
    console.error('Firebase bridge upload error:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }
}

// Delete video from Cloudinary
async function deleteVideo(publicId) {
  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, { resource_type: 'video' }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });
    return result;
  } catch (error) {
    console.error('Firebase bridge delete error:', error);
    throw new Error(`Delete failed: ${error.message}`);
  }
}

module.exports = {
  uploadVideo,
  deleteVideo,
  mapCloudinaryToFirebase
}; 