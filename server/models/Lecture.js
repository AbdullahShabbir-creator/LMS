const mongoose = require('mongoose');

const lectureSchema = new mongoose.Schema({
  title: { type: String, required: true },
  isPreview: { type: Boolean, default: false },
  videoUrl: { type: String },
  videoPublicId: { type: String }, // for Cloudinary management
  createdAt: { type: Date, default: Date.now }
});

module.exports = lectureSchema;
