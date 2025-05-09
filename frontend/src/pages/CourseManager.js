import React, { useState, useEffect } from 'react';
import InstructorHeader from '../components/InstructorHeader';
import InstructorFooter from '../components/InstructorFooter';
import CurriculumBuilder from '../components/CurriculumBuilder';
import BulkVideoUpload from '../components/BulkVideoUpload';
import ReactPlayer from 'react-player';
import { FaPlus, FaTrash, FaEdit, FaVideo, FaEye } from 'react-icons/fa';
import '../styles/course.manager.css';

const initialCourses = [
  {
    id: 1,
    title: 'React for Beginners',
    description: 'Learn React from scratch.',
    curriculum: [
      { id: 101, title: 'Intro to React', isPreview: true },
      { id: 102, title: 'JSX & Components', isPreview: false }
    ]
  },
  {
    id: 2,
    title: 'Advanced JavaScript',
    description: 'Deep dive into JS.',
    curriculum: [
      { id: 201, title: 'Closures', isPreview: false },
      { id: 202, title: 'Async Patterns', isPreview: true }
    ]
  }
];

// Utility to upload a video to the backend and get its Firebase URL
async function uploadVideoToFirebase(file) {
  try {
    console.log("Starting upload for file:", file.name);
    
    // Create a form with the file
    const formData = new FormData();
    formData.append('video', file);
    
    // Show detailed error if server is down
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
      credentials: 'include',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      const errorText = await res.text().catch(() => "Unknown server error");
      console.error("Server error response:", errorText);
      throw new Error(`Upload failed: ${res.status} ${res.statusText}`);
    }
    
    const data = await res.json();
    if (!data || !data.url) {
      throw new Error('Invalid response from server, missing URL');
    }
    
    console.log("Upload success for file:", file.name);
    return data;
  } catch (error) {
    console.error('Upload error:', error);
    if (error.name === 'AbortError') {
      throw new Error('Upload timed out. The server might be down or overloaded. Please try again later.');
    }
    throw new Error(`Failed to upload ${file.name}: ${error.message}`);
  }
}

export default function CourseManager() {
  const [courses, setCourses] = useState(initialCourses);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ 
    title: '', 
    description: '', 
    curriculum: [],
    price: 0,
    isFree: true,
    paymentMethod: 'None',
    jazzCashNumber: '',
    meezanBankAccount: '',
    category: 'General'
  });
  const [curriculum, setCurriculum] = useState([]);
  const [videos, setVideos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);

  // Fetch courses from backend on mount
  useEffect(() => {
    async function fetchCourses() {
      const res = await fetch('/api/courses', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
    }
    fetchCourses();
  }, []);

  async function handleDeleteCourse(id) {
    const res = await fetch(`/api/courses/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (res.ok) {
      setCourses(courses.filter(c => c._id !== id && c.id !== id));
    } else {
      alert('Failed to delete course');
    }
  }

  // Edit course (basic: load into form)
  function handleEditCourse(course) {
    setShowForm(true);
    setForm({
      title: course.title,
      description: course.description,
      curriculum: course.curriculum || [],
      price: course.price || 0,
      isFree: course.isFree !== undefined ? course.isFree : true,
      paymentMethod: course.paymentMethod || 'None',
      jazzCashNumber: course.jazzCashNumber || '',
      meezanBankAccount: course.meezanBankAccount || '',
      category: course.category || 'General'
    });
    setCurriculum(course.curriculum || []);
    setVideos([]); // Optionally, load video info if editing videos
    setEditingCourseId(course._id || course.id);
  }

  async function handleSaveCourse(e) {
    e.preventDefault();
    setUploading(true);
    try {
      // Validate required fields first
      if (!form.title.trim()) {
        throw new Error('Course title is required');
      }
      if (!form.description.trim()) {
        throw new Error('Course description is required');
      }
      if (!form.isFree && !form.price) {
        throw new Error('Please set a price for your paid course');
      }
      if (!form.isFree && !form.paymentMethod) {
        throw new Error('Please select a payment method for your paid course');
      }
      if (form.paymentMethod === 'JazzCash' && !form.jazzCashNumber) {
        throw new Error('Please enter your JazzCash number');
      }
      if (form.paymentMethod === 'MeezanBank' && !form.meezanBankAccount) {
        throw new Error('Please enter your Meezan Bank account');
      }
      
      // Check if we have enough videos for all lectures
      if (curriculum.length > 0 && videos.length === 0) {
        throw new Error('Please upload at least one video for your course');
      }

      let uploadedVideos = [];
      // Only process videos if we have any
      if (videos.length > 0) {
        // Upload each video one by one
        for (let i = 0; i < videos.length; i++) {
          const video = videos[i];
          if (!video.url.startsWith('http')) {
            try {
              const uploaded = await uploadVideoToFirebase(video.file);
              uploadedVideos.push({ 
                ...video, 
                url: uploaded.url, 
                public_id: uploaded.public_id,
                duration: uploaded.duration || 0
              });
            } catch (error) {
              console.error(`Failed to upload video ${video.title}:`, error);
              throw new Error(`Failed to upload video: ${video.title}. Please try again.`);
            }
          } else {
            uploadedVideos.push(video);
          }
        }
      }

      // Map videos to lectures if possible
      const lecturesWithVideo = curriculum.map((lec, idx) => {
        // If we have a video for this lecture, use it
        if (idx < uploadedVideos.length) {
          return {
            ...lec,
            videoUrl: uploadedVideos[idx].url,
            videoPublicId: uploadedVideos[idx].public_id || '',
            videoName: uploadedVideos[idx].title || ''
          };
        } 
        // Use existing video data if available
        return {
          ...lec,
          videoUrl: lec.videoUrl || '',
          videoPublicId: lec.videoPublicId || '',
          videoName: lec.videoName || ''
        };
      });

      const courseData = {
        title: form.title.trim(),
        description: form.description.trim(),
        instructor: 'INSTRUCTOR_ID',
        category: form.category,
        curriculum: lecturesWithVideo,
        price: form.isFree ? 0 : parseFloat(form.price),
        isFree: form.isFree,
        paymentMethod: form.isFree ? 'None' : form.paymentMethod,
        jazzCashNumber: form.paymentMethod === 'JazzCash' ? form.jazzCashNumber : '',
        meezanBankAccount: form.paymentMethod === 'MeezanBank' ? form.meezanBankAccount : ''
      };
      
      let res;
      if (editingCourseId) {
        res = await fetch(`/api/courses/${editingCourseId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(courseData)
        });
      } else {
        res = await fetch('/api/courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(courseData)
        });
      }
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to save course');
      }
      
      const saved = await res.json();
      if (editingCourseId) {
        setCourses(courses.map(c => (c._id === editingCourseId || c.id === editingCourseId) ? saved : c));
      } else {
        setCourses([...courses, saved]);
      }
      
      // Reset form
      setShowForm(false);
      setCurriculum([]);
      setVideos([]);
      setEditingCourseId(null);
    } catch (error) {
      console.error('Error saving course:', error);
      alert(`Failed to save course: ${error.message}`);
    } finally {
      setUploading(false);
    }
  }

  // Handlers for CRUD (real backend)
  async function handleAddCourse() {
    setShowForm(true);
    setForm({ title: '', description: '', curriculum: [], price: 0, isFree: true, paymentMethod: 'None', jazzCashNumber: '', meezanBankAccount: '', category: 'General' });
    setCurriculum([]);
    setVideos([]);
  }
  function handleFormChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'isFree' && checked ? { price: 0, paymentMethod: 'None', jazzCashNumber: '', meezanBankAccount: '' } : {})
    }));
  }

  return (
    <div className="course-manager-root">
      <InstructorHeader />
      <main className="course-manager-main">
        <h2 className="course-manager-title">My Courses</h2>
        <button className="add-course-btn" onClick={handleAddCourse}><FaPlus /> Create New Course</button>
        {showForm && (
          <form className="course-form" onSubmit={handleSaveCourse}>
            <input name="title" placeholder="Course Title" value={form.title} onChange={handleFormChange} required />
            <textarea name="description" placeholder="Course Description" value={form.description} onChange={handleFormChange} required />
            <div className="form-row">
              <label className="form-label">Category:</label>
              <select name="category" value={form.category} onChange={handleFormChange} required>
                <option value="General">General</option>
                <option value="Programming">Programming</option>
                <option value="Design">Design</option>
                <option value="Business">Business</option>
                <option value="Marketing">Marketing</option>
                <option value="IT">IT & Software</option>
                <option value="Personal Development">Personal Development</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div className="pricing-section">
              <h3 className="pricing-title">Pricing Options</h3>
              <div className="form-row checkbox-row">
                <input 
                  type="checkbox" 
                  id="isFree"
                  name="isFree" 
                  checked={form.isFree} 
                  onChange={handleFormChange} 
                />
                <label htmlFor="isFree">This is a free course</label>
              </div>
              
              {!form.isFree && (
                <>
                  <div className="form-row">
                    <label className="form-label">Price (PKR):</label>
                    <input 
                      type="number" 
                      name="price" 
                      placeholder="Course price" 
                      value={form.price} 
                      onChange={handleFormChange}
                      min="1"
                      required={!form.isFree}
                    />
                  </div>
                  
                  <div className="form-row">
                    <label className="form-label">Payment Method:</label>
                    <select 
                      name="paymentMethod" 
                      value={form.paymentMethod} 
                      onChange={handleFormChange}
                      required={!form.isFree}
                    >
                      <option value="">Select payment method</option>
                      <option value="JazzCash">JazzCash</option>
                      <option value="MeezanBank">Meezan Bank</option>
                    </select>
                  </div>
                  
                  {form.paymentMethod === 'JazzCash' && (
                    <div className="form-row">
                      <label className="form-label">JazzCash Number:</label>
                      <input 
                        type="text" 
                        name="jazzCashNumber" 
                        placeholder="Your JazzCash number" 
                        value={form.jazzCashNumber} 
                        onChange={handleFormChange}
                        required
                      />
                    </div>
                  )}
                  
                  {form.paymentMethod === 'MeezanBank' && (
                    <div className="form-row">
                      <label className="form-label">Meezan Bank Account:</label>
                      <input 
                        type="text" 
                        name="meezanBankAccount" 
                        placeholder="Your Meezan Bank account" 
                        value={form.meezanBankAccount} 
                        onChange={handleFormChange}
                        required
                      />
                    </div>
                  )}
                </>
              )}
            </div>
            
            <CurriculumBuilder curriculum={curriculum} setCurriculum={setCurriculum} />
            <BulkVideoUpload videos={videos} setVideos={setVideos} />
            <button className="save-course-btn" type="submit" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Save Course'}
            </button>
          </form>
        )}
        
        <div className="courses-list">
          {courses.map(course => (
            <div className="course-card" key={course._id || course.id}>
              <div className="course-card-header">
                <h3>{course.title}</h3>
                <div className="course-actions">
                  <button className="icon-btn" title="Edit" onClick={() => handleEditCourse(course)}><FaEdit /></button>
                  <button className="icon-btn" title="Delete" onClick={() => handleDeleteCourse(course._id || course.id)}><FaTrash /></button>
                </div>
              </div>
              <p className="course-desc">{course.description}</p>
              <div className="course-meta">
                <span className="course-category">{course.category}</span>
                <span className="course-price">
                  {course.isFree ? 'Free' : `PKR ${course.price}`}
                </span>
              </div>
              <div className="curriculum-list">
                {course.curriculum && course.curriculum.map(lec => (
                  <div className={`curriculum-item${lec.isPreview ? ' preview' : ''}`} key={lec._id || lec.id}>
                    <FaVideo className="curriculum-icon" />
                    <span>{lec.title}</span>
                    {lec.isPreview && <FaEye className="preview-icon" title="Free Preview" />}
                    {lec.videoUrl && (
                      <div style={{marginTop: 6, width: '100%'}}>
                        <ReactPlayer url={lec.videoUrl} controls width="100%" height="140px" style={{borderRadius: 8}}/>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
      <InstructorFooter />
    </div>
  );
}
