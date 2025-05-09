const mongoose = require('mongoose');
const lectureSchema = require('./Lecture');

const paymentRequestSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  name: String,
  phone: String,
  reference: String,
  requestedAt: { type: Date, default: Date.now },
  processedAt: Date
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  category: { type: String, required: true },
  description: { type: String },
  price: { type: Number, default: 0 }, // 0 means free
  isFree: { type: Boolean, default: true },
  paymentMethod: { type: String, enum: ['JazzCash', 'MeezanBank', 'None'], default: 'None' },
  jazzCashNumber: { type: String },
  meezanBankAccount: { type: String },
  paymentRequests: [paymentRequestSchema],
  curriculum: [lectureSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Course', courseSchema);
