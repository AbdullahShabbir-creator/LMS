const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  general: {
    siteName: {
      type: String,
      default: 'Modern LMS'
    },
    siteDescription: {
      type: String,
      default: 'Advanced Learning Management System'
    },
    maintenanceMode: {
      type: Boolean,
      default: false
    },
    allowRegistration: {
      type: Boolean,
      default: true
    },
    defaultUserRole: {
      type: String,
      enum: ['student', 'instructor'],
      default: 'student'
    },
    maxUploadSize: {
      type: Number,
      default: 50 // MB
    },
    enableDarkMode: {
      type: Boolean,
      default: false
    }
  },
  email: {
    smtpHost: {
      type: String,
      default: 'smtp.example.com'
    },
    smtpPort: {
      type: Number,
      default: 587
    },
    smtpUsername: {
      type: String,
      default: 'admin@example.com'
    },
    smtpPassword: {
      type: String
    },
    enableEmailNotifications: {
      type: Boolean,
      default: true
    },
    emailSignature: {
      type: String,
      default: 'The LMS Team'
    }
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
settingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Setting', settingSchema); 