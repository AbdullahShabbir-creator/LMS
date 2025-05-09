const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'instructor', 'admin'], default: 'student' },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' },
  resetToken: String,
  resetTokenExpiry: Date,
  // Settings fields
  publicProfile: { type: Boolean, default: true },
  leaderboard: { type: Boolean, default: true },
  dataConsent: { type: Boolean, default: false },
  twoFA: { type: Boolean, default: false },
  mfaEnabled: { type: Boolean, default: false },
  mfaEmailOtp: { type: String },
  mfaOtpExpires: { type: Date },
  recentLogins: [{
    device: String,
    location: String,
    date: String,
    active: Boolean
  }],
  notificationPrefs: {
    assignment: { type: Boolean, default: true },
    grades: { type: Boolean, default: true },
    announcements: { type: Boolean, default: true },
    newsletter: { type: Boolean, default: false }
  }
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
