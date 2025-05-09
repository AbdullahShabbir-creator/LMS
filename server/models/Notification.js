const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
  link: { type: String }, // Optional: link to relevant page/action
  type: { type: String, default: 'general' } // e.g., 'assignment', 'progress', etc.
});

module.exports = mongoose.model('Notification', NotificationSchema);
