const mongoose = require('mongoose');

const earningSchema = new mongoose.Schema({
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  month: { type: String, required: true }, // e.g., 'Jan 2025'
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Earning', earningSchema);
