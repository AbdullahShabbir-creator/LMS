import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUpload, FaTrash, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import InstructorHeader from '../components/InstructorHeader';
import InstructorFooter from '../components/InstructorFooter';
import { createLecture, getLectures, deleteLecture } from '../services/lectureService';
import '../styles/instructor.modern.css';

export default function FreeLectures() {
  const [formData, setFormData] = useState({
    courseName: '',
    title: '',
    video: null,
  });
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lectures, setLectures] = useState([]);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        video: file
      }));
      
      // Create preview URL
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    }
  };

  // Fetch lectures on component mount
  useEffect(() => {
    const fetchLectures = async () => {
      try {
        setIsLoading(true);
        const data = await getLectures();
        setLectures(data);
        setError('');
      } catch (err) {
        console.error('Failed to load lectures:', err);
        setError('Failed to load lectures. Please try again later.');
        toast.error('Failed to load lectures');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLectures();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.courseName || !formData.title || !formData.video) {
      toast.error('Please fill in all fields');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const newLecture = await createLecture(formData);
      
      setLectures(prev => [newLecture, ...prev]);
      
      // Reset form
      setFormData({
        courseName: '',
        title: '',
        video: null,
      });
      setPreviewUrl('');
      document.getElementById('video-upload').value = '';
      
      toast.success('Lecture created successfully!');
    } catch (error) {
      console.error('Error creating lecture:', error);
      toast.error(error.message || 'Failed to create lecture');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lecture?')) {
      return;
    }
    
    try {
      await deleteLecture(id);
      setLectures(prev => prev.filter(lecture => lecture._id !== id));
      toast.success('Lecture deleted successfully');
    } catch (error) {
      console.error('Error deleting lecture:', error);
      toast.error(error.message || 'Failed to delete lecture');
    }
  };

  return (
    <div className="instructor-page-root">
      <InstructorHeader />
      <main className="page-main">
        <motion.div
          className="page-welcome-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
        >
          <h1 className="page-title">Free Lectures</h1>
          <p className="page-subtext">Create and manage free video lectures for your students</p>
          
          <div className="lecture-form-container">
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit} className="lecture-form">
              <div className="form-group">
                <label htmlFor="courseName">Course Name</label>
                <input
                  type="text"
                  id="courseName"
                  name="courseName"
                  value={formData.courseName}
                  onChange={handleInputChange}
                  placeholder="Enter course name"
                  className="form-control"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="title">Lecture Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter lecture title"
                  className="form-control"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="video-upload" className="file-upload-label">
                  <FaUpload className="upload-icon" />
                  {formData.video ? formData.video.name : 'Choose Video File'}
                </label>
                <input
                  type="file"
                  id="video-upload"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="file-upload"
                  required
                />
                {previewUrl && (
                  <div className="video-preview">
                    <video controls className="preview-player">
                      <source src={previewUrl} type={formData.video?.type} />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}
              </div>
              
              <button 
                type="submit" 
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="spinner" /> Uploading...
                  </>
                ) : (
                  'Upload Lecture'
                )}
              </button>
            </form>
            
            <div className="lectures-list">
              <h3>Your Uploaded Lectures</h3>
              {isLoading ? (
                <div className="loading-container">
                  <FaSpinner className="spinner" /> Loading lectures...
                </div>
              ) : lectures.length > 0 ? (
                <div className="lectures-grid">
                  {lectures.map(lecture => (
                    <div key={lecture._id} className="lecture-card">
                      <div className="lecture-card-content">
                        <h4>{lecture.title}</h4>
                        <p className="course-name">{lecture.courseName}</p>
                        <p className="lecture-date">
                          {new Date(lecture.createdAt || lecture.date).toLocaleDateString()}
                        </p>
                        {lecture.videoUrl && (
                          <div className="video-preview">
                            <video controls width="100%">
                              <source src={lecture.videoUrl} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={() => handleDelete(lecture._id)}
                        className="delete-btn"
                        title="Delete lecture"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? <FaSpinner className="spinner" /> : <FaTrash />}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-lectures">No lectures found. Upload your first lecture!</p>
              )}
            </div>
          </div>
        </motion.div>
      </main>
      <InstructorFooter />
    </div>
  );
}
