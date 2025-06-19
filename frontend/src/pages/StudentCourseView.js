import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import StudentHeader from '../components/StudentHeader';
import StudentFooter from '../components/StudentFooter';
import { getCourseDetails, markLectureComplete } from '../services/api';
import { ToastContainer, toast } from 'react-toastify';
import './StudentCourseView.css';

export default function StudentCourseView() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [activeContentIndex, setActiveContentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completedLectures, setCompletedLectures] = useState({});

  useEffect(() => {
    async function fetchCourseData() {
      try {
        setLoading(true);
        const courseRes = await getCourseDetails(courseId);
        if (courseRes.error) {
          setError(courseRes.error);
          return;
        }
        setCourse(courseRes.course);
      } catch (err) {
        setError('Unexpected error occurred');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  const handleMarkLectureComplete = async (lecture) => {
  try {
    const result = await markLectureComplete(courseId, lecture._id);

    if (result.success) {
      toast.success('Lecture marked as complete');
      setCompletedLectures((prev) => ({ ...prev, [lecture._id]: true }));
    } else {
      toast.error(result.error || 'Failed to complete lecture');
    }
  } catch (err) {
    toast.error('Unexpected error occurred');
    console.error(err);
  }
};

  const renderContentItem = (item) => {
    const isCompleted = completedLectures[item._id];

    return (
      <div className="course-video-container">
        <h3>{item.title}</h3>
        <div className="video-player">
          <video controls src={item.videoUrl} className="course-video">
            Your browser does not support the video tag.
          </video>
        </div>

        <div className="lecture-controls">
          <button
            className={`mark-complete-btn ${isCompleted ? 'completed' : ''}`}
            onClick={() => handleMarkLectureComplete(item)}
            disabled={isCompleted}
          >
            {isCompleted ? '✅ Completed' : 'Mark as Completed'}
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="course-view-container">
        <StudentHeader />
        <div className="course-view-loading">Loading course content...</div>
        <StudentFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-view-container">
        <StudentHeader />
        <div className="course-view-error">{error}</div>
        <StudentFooter />
      </div>
    );
  }

  const curriculum = course?.curriculum || [];

  return (
    <div className="course-view-container">
      <StudentHeader />
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar />

      <div className="course-view-content">
        <div className="course-header">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="course-title"
          >
            {course?.title}
          </motion.h1>
          {course?.instructor && (
            <div className="course-instructor">By {course.instructor.name}</div>
          )}
          <p className="course-description">{course.description}</p>
          <div className="course-meta">
            <span>Category: {course.category}</span>
            <span>Price: {course.isFree ? 'Free' : `Rs ${course.price}`}</span>
            <span>Students: {course.students?.length || 0}</span>
          </div>
        </div>

        <div className="course-view-layout">
          <div className="course-sidebar">
            <h2>Curriculum</h2>
            <ul className="content-list">
              {curriculum.map((item, index) => (
                <li
                  key={item._id}
                  className={`content-list-item ${
                    index === activeContentIndex ? 'active' : ''
                  }`}
                  onClick={() => setActiveContentIndex(index)}
                >
                  <div className="content-item-details">
                    <div className="content-item-title">{item.title}</div>
                    {item.isPreview && (
                      <span className="preview-label">Preview</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="course-main-content">
            {curriculum.length > 0 ? (
              renderContentItem(curriculum[activeContentIndex])
            ) : (
              <div className="no-content">
                <h3>No content available</h3>
                <p>This course does not have any curriculum yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <StudentFooter />
    </div>
  );
}
