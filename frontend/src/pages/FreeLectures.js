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
    courseId: '',
    lectureTitle: '',
    video: null,
  });
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lectures, setLectures] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLectures = async () => {
      try {
        setIsLoading(true);
        const data = await getLectures();
        setLectures(data);
        setError('');
      } catch (err) {
        //console.error('Failed to load lectures:', err);
        //setError('Failed to load lectures. Please try again later.');
        //toast.error('Failed to load lectures');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLectures();
  }, []);

  useEffect(() => {
    async function fetchCourses() {
      setLoadingCourses(true);
      try {
        const token = localStorage.getItem('lms_token');
        const res = await fetch('/api/courses', {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setCourses(data);
        } else {
          toast.error('Failed to fetch courses');
        }
      } catch (err) {
        toast.error('Network error');
      }
      setLoadingCourses(false);
    }
    fetchCourses();
  }, []);

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
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { courseId, lectureTitle, video } = formData;
    if (!courseId || !lectureTitle || !video) {
      toast.error('Please fill in all fields');
      return;
    }
    console.log(video)

    try {
      setIsSubmitting(true);
      const newLecture = await createLecture(formData);
      setLectures(prev => [newLecture, ...prev]);

      setFormData({ courseId: '', lectureTitle: '', video: null });
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
    if (!window.confirm('Are you sure you want to delete this lecture?')) return;
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
                <label htmlFor="courseId">Select Course</label>
                <select
                  id="courseId"
                  name="courseId"
                  value={formData.courseId}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                >
                  <option value="">-- Choose a course --</option>
                  {loadingCourses ? (
                    <option disabled>Loading...</option>
                  ) : (
                    courses.map(course => (
                      <option key={course._id} value={course._id}>
                        {course.title}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="title">Lecture Title</label>
                <input
                  type="text"
                  id="title"
                  name="lectureTitle"
                  value={formData.lectureTitle}
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
  ) : courses.length > 0 ? (
    !formData.courseId ? (
      <p>Please select a course to view its lectures.</p>
    ) : (
      (() => {
        const selectedCourse = courses.find(c => c._id === formData.courseId);
        const curriculum = selectedCourse?.curriculum || [];

        return curriculum.length > 0 ? (
          <div className="lectures-grid">
            {curriculum.map((lecture, index) => (
              <div key={index} className="lecture-card">
                <div className="lecture-card-content">
                  <h4>{lecture.title}</h4>
                  <p className="lecture-date">{new Date().toLocaleDateString()}</p>
                  {lecture.videoUrl && (
                    <div className="video-preview">
                      <video controls width="100%">
                        <source src={lecture.videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-lectures">No lectures in this course.</p>
        );
      })()
    )
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
