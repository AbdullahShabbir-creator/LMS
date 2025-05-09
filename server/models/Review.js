const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
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
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create a compound index to ensure a student can only review a course once
reviewSchema.index({ course: 1, student: 1 }, { unique: true });

// Static method to get average rating for a course
reviewSchema.statics.getAverageRating = async function(courseId) {
  const stats = await this.aggregate([
    {
      $match: { course: courseId, status: 'approved' }
    },
    {
      $group: {
        _id: '$course',
        averageRating: { $avg: '$rating' },
        numReviews: { $sum: 1 }
      }
    }
  ]);

  return stats.length > 0 ? stats[0] : { averageRating: 0, numReviews: 0 };
};

module.exports = mongoose.model('Review', reviewSchema); 