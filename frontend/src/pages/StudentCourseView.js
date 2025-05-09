import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import StudentHeader from '../components/StudentHeader';
import StudentFooter from '../components/StudentFooter';
import { getCourseDetails, getCourseContent } from '../services/api';
import { ToastContainer, toast } from 'react-toastify';
import './StudentCourseView.css';

export default function StudentCourseView() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeContentIndex, setActiveContentIndex] = useState(0);

  useEffect(() => {
    async function fetchCourseData() {
      setLoading(true);
      setError(null);
      
      // Fetch course details
      const { course: courseDetails, error: courseError } = await getCourseDetails(courseId);
      
      if (courseError) {
        setError(courseError);
        setLoading(false);
        return;
      }
      
      setCourse(courseDetails);
      
      // Fetch course content (only available to enrolled students)
      const { content: courseContent, error: contentError } = await getCourseContent(courseId);
      
      if (contentError) {
        // If not enrolled, redirect to courses page
        if (contentError.includes('purchase')) {
          toast.error('You need to purchase this course to access content');
          navigate('/student/courses');
          return;
        }
        
        setError(contentError);
        setLoading(false);
        return;
      }
      
      setContent(courseContent);
      setLoading(false);
    }
    
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId, navigate]);

  const renderContentItem = (item) => {
    switch (item.type) {
      case 'video':
        return (
          <div className="course-video-container">
            <h3>{item.title}</h3>
            <div className="video-player">
              <video 
                controls 
                src={item.url} 
                poster={course?.image}
                className="course-video"
              >
                Your browser does not support the video tag.
              </video>
              {item.duration && (
                <div className="video-duration">{item.duration}</div>
              )}
            </div>
            {item.description && (
              <p className="content-description">{item.description}</p>
            )}
          </div>
        );
        
      case 'pdf':
      case 'document':
        return (
          <div className="course-document-container">
            <h3>{item.title}</h3>
            <div className="document-viewer">
              <iframe 
                src={item.url} 
                title={item.title}
                className="document-frame"
              >
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  Download Document
                </a>
              </iframe>
            </div>
            {item.pages && (
              <div className="document-pages">{item.pages} pages</div>
            )}
          </div>
        );
        
      case 'quiz':
        return (
          <div className="course-quiz-container">
            <h3>{item.title}</h3>
            <div className="quiz-info">
              <p>This quiz contains {item.questions || 'several'} questions to test your knowledge.</p>
              <button className="start-quiz-btn">Start Quiz</button>
            </div>
          </div>
        );
        
      case 'assignment':
        return (
          <div className="course-assignment-container">
            <h3>{item.title}</h3>
            <div className="assignment-details">
              <p>{item.description}</p>
              <div className="assignment-actions">
                <button className="submit-assignment-btn">Submit Assignment</button>
              </div>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="course-content-item">
            <h3>{item.title}</h3>
            <p>{item.description || 'No description available.'}</p>
          </div>
        );
    }
  };
  
  // For demonstration, use dummy content if no real content available
  const displayContent = content.length > 0 ? content : (
    course?.content || [
      { title: 'Introduction', type: 'video', url: '#', duration: '10:30', description: 'Welcome to the course!' },
      { title: 'Getting Started', type: 'document', url: '#', pages: 15 },
      { title: 'Basic Concepts', type: 'video', url: '#', duration: '15:45' }
    ]
  );

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
            {course?.title || 'Course Content'}
          </motion.h1>
          {course?.instructor && (
            <div className="course-instructor">
              By {course.instructor.name}
            </div>
          )}
        </div>
        
        <div className="course-view-layout">
          <div className="course-sidebar">
            <h2>Course Content</h2>
            <ul className="content-list">
              {displayContent.map((item, index) => (
                <li 
                  key={index} 
                  className={`content-list-item ${index === activeContentIndex ? 'active' : ''}`}
                  onClick={() => setActiveContentIndex(index)}
                >
                  <div className="content-item-icon">
                    {item.type === 'video' && '🎬'}
                    {item.type === 'document' || item.type === 'pdf' ? '📄' : ''}
                    {item.type === 'quiz' && '❓'}
                    {item.type === 'assignment' && '📝'}
                    {!['video', 'document', 'pdf', 'quiz', 'assignment'].includes(item.type) && '📌'}
                  </div>
                  <div className="content-item-details">
                    <div className="content-item-title">{item.title}</div>
                    <div className="content-item-meta">
                      {item.type === 'video' && item.duration && <span>{item.duration}</span>}
                      {(item.type === 'document' || item.type === 'pdf') && item.pages && <span>{item.pages} pages</span>}
                      {item.type === 'quiz' && <span>{item.questions || 'Quiz'}</span>}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="course-main-content">
            {displayContent.length > 0 ? (
              renderContentItem(displayContent[activeContentIndex])
            ) : (
              <div className="no-content">
                <h3>No content available</h3>
                <p>This course does not have any content yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <StudentFooter />
    </div>
  );
} 