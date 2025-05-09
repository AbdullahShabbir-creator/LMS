import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getToken as getAuthToken } from '../utils/auth';
import { FaClock, FaCheckCircle, FaTimesCircle, FaArrowRight, FaTrophy, FaChartBar } from 'react-icons/fa';

export default function ProgressDetailsModal({ progress, onClose }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define fetchDetails using useCallback so it can be referenced in the dependency array
  const fetchDetails = useCallback(async () => {
    if (!progress) return;
    
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }
      
      // For development, generate mock data
      if (process.env.NODE_ENV === 'development') {
        // Mock lesson-by-lesson progress
        setTimeout(() => {
          const mockDetails = [
            { lessonId: 'l1', lessonTitle: 'Introduction to the Course', completed: true, timeSpent: 15 },
            { lessonId: 'l2', lessonTitle: 'Core Concepts', completed: true, timeSpent: 32 },
            { lessonId: 'l3', lessonTitle: 'Advanced Techniques', completed: progress.percent > 50, timeSpent: progress.percent > 50 ? 28 : 0 },
            { lessonId: 'l4', lessonTitle: 'Practical Applications', completed: progress.percent > 75, timeSpent: progress.percent > 75 ? 45 : 0 },
            { lessonId: 'l5', lessonTitle: 'Final Project', completed: progress.percent === 100, timeSpent: progress.percent === 100 ? 60 : 0 },
          ];
          setDetails(mockDetails);
          setLoading(false);
        }, 800);
        return;
      }
      
      // Real API call for production
      const response = await fetch(`/api/student/progress/${progress.courseId || progress._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch progress details');
      }
      
      const data = await response.json();
      setDetails(data.details || data.progress || []);
      setLoading(false);
    } catch (e) {
      console.error('Error fetching progress details:', e);
      setError('Failed to load details.');
      setLoading(false);
    }
  }, [progress]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  if (!progress) return null;

  // Calculate completion status
  const completedLessons = details?.filter(lesson => lesson.completed)?.length || 0;
  const totalLessons = details?.length || 0;
  const completionPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const nextLesson = details?.find(l => !l.completed)?.lessonTitle || 'All lessons complete!';
  const totalTimeSpent = details?.reduce((acc, lesson) => acc + (lesson.timeSpent || 0), 0) || 0;

  return (
    <motion.div
      className="progress-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="progress-modal-content"
        initial={{ scale: 0.8, y: 60, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.8, y: 60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 180, damping: 18 }}
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="progress-modal-close" 
          aria-label="Close"
        >
          ×
        </button>
        
        <div className="progress-modal-header">
          <h2>{progress.courseTitle || progress.title}</h2>
          <div className="progress-modal-category">{progress.category}</div>
        </div>
        
        {loading ? (
          <div className="progress-modal-loading">
            <div className="progress-modal-loader"></div>
            <p>Loading detailed progress...</p>
          </div>
        ) : error ? (
          <div className="progress-modal-error">
            <p>{error}</p>
            <button 
              className="progress-modal-retry" 
              onClick={fetchDetails}
            >
              Retry
            </button>
          </div>
        ) : !details || details.length === 0 ? (
          <div className="progress-modal-empty">
            <p>No detailed progress found.</p>
          </div>
        ) : (
          <>
            <div className="progress-modal-summary">
              <div className="progress-stat-box">
                <div className="progress-stat-circle" style={{
                  background: `conic-gradient(
                    var(--primary-color) ${completionPercentage}%, 
                    #f0f0f0 ${completionPercentage}%
                  )`
                }}>
                  <div className="progress-stat-inner">
                    <span>{completionPercentage}%</span>
                  </div>
                </div>
                <div className="progress-stat-label">Completed</div>
              </div>
              
              <div className="progress-stat-box">
                <div className="progress-stat-value">
                  <FaCheckCircle className="progress-icon success" />
                  <span>{completedLessons}/{totalLessons}</span>
                </div>
                <div className="progress-stat-label">Lessons</div>
              </div>
              
              <div className="progress-stat-box">
                <div className="progress-stat-value">
                  <FaClock className="progress-icon" />
                  <span>{totalTimeSpent}</span>
                </div>
                <div className="progress-stat-label">Minutes</div>
              </div>
            </div>
            
            <div className="progress-next-lesson">
              <h3>Next Step:</h3>
              <div className="progress-next-lesson-box">
                <FaArrowRight className="progress-icon" />
                <span>{nextLesson}</span>
              </div>
            </div>
            
            <div className="progress-modal-lessons">
              <h3>Lessons Progress</h3>
              <div className="progress-lessons-list">
                {details.map((lesson, idx) => (
                  <div key={lesson.lessonId || idx} className={`progress-lesson-item ${lesson.completed ? 'completed' : ''}`}>
                    <div className="progress-lesson-status">
                      {lesson.completed ? 
                        <FaCheckCircle className="progress-icon success" /> : 
                        <FaTimesCircle className="progress-icon error" />
                      }
                    </div>
                    <div className="progress-lesson-details">
                      <div className="progress-lesson-title">{lesson.lessonTitle}</div>
                      <div className="progress-lesson-time">
                        {lesson.timeSpent ? (
                          <>
                            <FaClock size={12} />
                            <span>{lesson.timeSpent} minutes</span>
                          </>
                        ) : (
                          <span className="not-started">Not started</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        
        <div className="progress-modal-actions">
          <button className="progress-modal-button secondary" onClick={onClose}>
            Close
          </button>
          <button className="progress-modal-button primary">
            Resume Learning
          </button>
        </div>
      </motion.div>
      
      <style jsx="true">{`
        .progress-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(5px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        
        .progress-modal-content {
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          width: 100%;
          max-width: 540px;
          max-height: 85vh;
          overflow-y: auto;
          position: relative;
          padding: 0;
          display: flex;
          flex-direction: column;
        }
        
        .progress-modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          background: rgba(255, 255, 255, 0.9);
          border: none;
          width: 34px;
          height: 34px;
          font-size: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          cursor: pointer;
          color: #444;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
          z-index: 10;
        }
        
        .progress-modal-close:hover {
          background: #f0f0f0;
          transform: scale(1.1);
        }
        
        .progress-modal-header {
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%);
          color: white;
          padding: 25px 30px;
          border-radius: 20px 20px 0 0;
        }
        
        .progress-modal-header h2 {
          margin: 0 0 5px 0;
          font-size: 1.6rem;
          font-weight: 800;
        }
        
        .progress-modal-category {
          font-size: 0.9rem;
          opacity: 0.8;
          font-weight: 500;
        }
        
        .progress-modal-loading,
        .progress-modal-error,
        .progress-modal-empty {
          padding: 40px 20px;
          text-align: center;
          color: #666;
        }
        
        .progress-modal-loader {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(67, 206, 162, 0.2);
          border-top-color: var(--primary-color);
          border-radius: 50%;
          margin: 0 auto 15px auto;
          animation: spin 1s infinite linear;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .progress-modal-retry {
          margin-top: 15px;
          padding: 8px 20px;
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: 20px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }
        
        .progress-modal-retry:hover {
          background: var(--accent-color);
        }
        
        .progress-modal-summary {
          display: flex;
          justify-content: space-around;
          padding: 25px 20px;
          background: #f9f9f9;
          border-bottom: 1px solid #eee;
        }
        
        .progress-stat-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        
        .progress-stat-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        
        .progress-stat-inner {
          width: 70px;
          height: 70px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1.2rem;
          color: var(--accent-color);
        }
        
        .progress-stat-value {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1.2rem;
          font-weight: bold;
          color: var(--accent-color);
        }
        
        .progress-stat-label {
          font-size: 0.9rem;
          color: #666;
          font-weight: 500;
        }
        
        .progress-next-lesson {
          padding: 20px 30px;
          border-bottom: 1px solid #eee;
        }
        
        .progress-next-lesson h3 {
          margin: 0 0 10px 0;
          font-size: 1.1rem;
          color: #444;
        }
        
        .progress-next-lesson-box {
          background: #f0f8ff;
          padding: 15px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
          color: var(--accent-color);
        }
        
        .progress-modal-lessons {
          padding: 20px 30px;
        }
        
        .progress-modal-lessons h3 {
          margin: 0 0 15px 0;
          font-size: 1.1rem;
          color: #444;
        }
        
        .progress-lessons-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .progress-lesson-item {
          display: flex;
          padding: 12px 15px;
          border-radius: 10px;
          background: #f9f9f9;
          transition: all 0.2s ease;
          gap: 15px;
          align-items: center;
        }
        
        .progress-lesson-item:hover {
          background: #f0f0f0;
        }
        
        .progress-lesson-item.completed {
          background: #f0fff5;
        }
        
        .progress-lesson-status {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .progress-lesson-details {
          flex: 1;
        }
        
        .progress-lesson-title {
          font-weight: 600;
          color: #444;
          margin-bottom: 4px;
        }
        
        .progress-lesson-time {
          font-size: 0.85rem;
          color: #888;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        .not-started {
          color: #ff5722;
          font-style: italic;
        }
        
        .progress-icon {
          color: var(--accent-color);
        }
        
        .progress-icon.success {
          color: var(--primary-color);
        }
        
        .progress-icon.error {
          color: #ff5722;
        }
        
        .progress-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 20px 30px;
          border-top: 1px solid #eee;
        }
        
        .progress-modal-button {
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }
        
        .progress-modal-button.primary {
          background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
          color: white;
        }
        
        .progress-modal-button.secondary {
          background: #f0f0f0;
          color: #666;
        }
        
        .progress-modal-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        @media (max-width: 600px) {
          .progress-modal-header h2 {
            font-size: 1.4rem;
          }
          
          .progress-modal-summary {
            flex-direction: column;
            gap: 20px;
          }
          
          .progress-stat-box {
            flex-direction: row;
            justify-content: space-between;
            width: 100%;
            padding: 0 20px;
          }
          
          .progress-stat-circle {
            width: 60px;
            height: 60px;
          }
          
          .progress-stat-inner {
            width: 50px;
            height: 50px;
            font-size: 1rem;
          }
        }
      `}</style>
    </motion.div>
  );
}
