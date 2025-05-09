const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['JazzCash', 'MeezanBank', 'Other'],
    required: true
  },
  reference: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  processedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Update processedAt timestamp when status changes
paymentSchema.pre('save', function(next) {
  if (this.isModified('status') && (this.status === 'approved' || this.status === 'rejected')) {
    this.processedAt = Date.now();
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema); 