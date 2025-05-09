import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './CourseDetailsModal.css';

export default function CourseDetailsModal({ course, isOpen, onClose, onPurchase, isUnlocked }) {
  const [isLoading, setIsLoading] = useState(false);
  
  if (!course || !isOpen) return null;
  
  const handlePurchase = async () => {
    setIsLoading(true);
    await onPurchase(course);
    setIsLoading(false);
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="course-modal-overlay">
          <motion.div 
            className="course-modal-container"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25 }}
          >
            <button className="course-modal-close" onClick={onClose}>
              &times;
            </button>
            
            <div className="course-modal-header">
              <h2>{course.title}</h2>
              <div className="course-modal-instructor">
                By {course.instructor?.name || 'Unknown Instructor'}
              </div>
              {course.category && (
                <div className="course-modal-category">{course.category}</div>
              )}
            </div>
            
            {course.image && (
              <img 
                src={course.image} 
                alt={course.title} 
                className="course-modal-image" 
              />
            )}
            
            <div className="course-modal-content">
              <h3>Description</h3>
              <p>{isUnlocked ? course.description : course.preview || 'Preview not available'}</p>
              
              {course.content && course.content.length > 0 && (
                <div className="course-modal-curriculum">
                  <h3>Contents</h3>
                  <ul>
                    {course.content.map((item, index) => (
                      <li key={index} className={`curriculum-item ${!isUnlocked && index > 0 ? 'locked' : ''}`}>
                        <div className="curriculum-item-header">
                          <span className="curriculum-item-title">{item.title}</span>
                          <span className="curriculum-item-type">{item.type}</span>
                        </div>
                        {!isUnlocked && index > 0 && (
                          <div className="lock-icon">🔒</div>
                        )}
                      </li>
                    ))}
                  </ul>
                  
                  {!isUnlocked && course.content.length > 1 && (
                    <div className="curriculum-locked-message">
                      Unlock to access all {course.content.length} items
                    </div>
                  )}
                </div>
              )}
              
              <div className="course-modal-actions">
                {isUnlocked ? (
                  <button className="course-modal-view-btn">
                    View Course
                  </button>
                ) : (
                  <button 
                    className="course-modal-purchase-btn"
                    disabled={isLoading}
                    onClick={handlePurchase}
                  >
                    {isLoading 
                      ? 'Processing...' 
                      : course.price > 0 
                        ? `Rs.${course.price}`
                        : 'Free Access'
                    }
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
} 