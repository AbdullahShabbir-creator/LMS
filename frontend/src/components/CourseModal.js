import React, { useState } from 'react';
import './CourseModal.css';

export default function CourseModal({ course, onClose, onEnroll, onBuy, enrolling }) {
  const [showReviews, setShowReviews] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [reviews, setReviews] = useState(course?.reviews || []);

  if (!course) return null;

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // POST review to backend
      const res = await fetch(`/api/courses/${course._id || course.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: reviewRating, text: reviewText })
      });
      if (!res.ok) throw new Error('Failed to submit review');
      const newReview = await res.json();
      setReviews(prev => [newReview, ...prev]);
      setReviewText('');
      setReviewRating(5);
    } catch (err) {
      alert('Could not submit review.');
    }
    setSubmitting(false);
  };

  // Determine which action to use (enroll or buy)
  const handleAction = () => {
    if (onBuy) {
      onBuy(course);
    } else if (onEnroll) {
      onEnroll(course._id || course.id);
    }
  };

  const actionText = () => {
    if (course.enrolled) return 'Enrolled';
    if (enrolling) return 'Processing...';
    if (course.isFree) return 'Enroll Now';
    return `Buy Now - ₹${course.price || 0}`;
  };

  return (
    <div className="course-modal-backdrop" onClick={onClose}>
      <div className="course-modal" onClick={e => e.stopPropagation()}>
        <button className="course-modal-close" onClick={onClose}>&times;</button>
        <img className="course-modal-img" src={course.image || 'https://source.unsplash.com/featured/?course,education'} alt={course.title} />
        <h2 className="course-modal-title">{course.title}</h2>
        <div className="course-modal-meta">
          <span>Instructor: <b>{course.instructor?.name || 'Unknown'}</b></span>
          <span>Category: <b>{course.category}</b></span>
        </div>
        {!course.isFree && (
          <div className="course-modal-price">₹{course.price || 0}</div>
        )}
        <p className="course-modal-desc">{course.description}</p>
        {course.rating && (
          <div className="course-modal-rating">Rating: {course.rating} / 5</div>
        )}
        <button
          className="course-modal-enroll-btn"
          disabled={course.enrolled || enrolling}
          onClick={handleAction}
        >
          {actionText()}
        </button>
        <button className="course-modal-show-reviews" onClick={() => setShowReviews(!showReviews)}>
          {showReviews ? 'Hide Reviews' : 'Show Reviews'}
        </button>
        {showReviews && (
          <div className="course-modal-reviews">
            <h3>Reviews</h3>
            {reviews.length === 0 ? <div>No reviews yet.</div> : (
              <ul>
                {reviews.map((r, i) => (
                  <li key={i}><b>{r.rating}★</b> {r.text}</li>
                ))}
              </ul>
            )}
            <form className="course-modal-review-form" onSubmit={handleReviewSubmit}>
              <label>
                Rating:
                <select value={reviewRating} onChange={e => setReviewRating(Number(e.target.value))}>
                  {[5,4,3,2,1].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>
              <label>
                Review:
                <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} required />
              </label>
              <button type="submit" disabled={submitting || !reviewText.trim()}>
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
