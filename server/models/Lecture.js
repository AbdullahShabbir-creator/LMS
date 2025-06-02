// lectureSchema.js
const mongoose = require('mongoose');

const lectureSchema = new mongoose.Schema({
  title: { type: String, required: true },
  isPreview: { type: Boolean, default: false },
  videoUrl: { type: String,required:true},
  videoPublicId: { type: String,required:true  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = lectureSchema; // ✅ Not mongoose.model
