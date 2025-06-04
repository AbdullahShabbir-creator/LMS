import React, { useState, useEffect, useCallback } from 'react';
import InstructorHeader from '../components/InstructorHeader';
import InstructorFooter from '../components/InstructorFooter';
import CurriculumBuilder from '../components/CurriculumBuilder';
import BulkVideoUpload from '../components/BulkVideoUpload'

import ReactPlayer from 'react-player';
import { FaPlus, FaTrash, FaEdit, FaVideo, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';
import '../styles/course.manager.css';

import {baseUrl} from '../config/api';
const API_BASE_URL = 'http://localhost:3001';
const token = localStorage.getItem('lms_token');

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
async function uploadVideoToBackend(file, courseId, lectureTitle) {
  const formData = new FormData();
  formData.append('video', file);
  formData.append('courseId', courseId);
  formData.append('lectureTitle', lectureTitle);

  const response = await fetch(`${baseUrl}/api/upload/`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Video upload failed');
  }

  return response.json();
}



export default function CourseManager() {
  const [courses, setCourses] = useState([]);
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

  // Function to fetch courses from backend
  const fetchCourses = useCallback(async () => {
    try {
      
      const response = await fetch(`${baseUrl}/api/courses/instructorcourses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }

      const data = await response.json();
      setCourses(data.courses || []);
     
    } catch (error) {
  
      console.error('Failed to load courses. Please check your network connection and try again.');
    }
  }, []);

  // Fetch courses on mount and set up refresh interval
  useEffect(() => {
    // Fetch courses when component mounts
    fetchCourses();

    // Set up interval to refresh courses every 30 seconds
    const interval = setInterval(fetchCourses, 30000);

    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, [fetchCourses]);

  async function handleDeleteCourse(id) {
    
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
    // Step 1: Validate form fields
    if (!form.title.trim()) throw new Error('Course title is required');
    if (!form.description.trim()) throw new Error('Course description is required');
    if (!form.isFree && !form.price) throw new Error('Please set a price for your paid course');
    if (!form.isFree && !form.paymentMethod) throw new Error('Please select a payment method');
    if (form.paymentMethod === 'JazzCash' && !form.jazzCashNumber) throw new Error('Enter JazzCash number');
    if (form.paymentMethod === 'MeezanBank' && !form.meezanBankAccount) throw new Error('Enter Meezan Bank account');
    if (curriculum.length > 0 && videos.length === 0) throw new Error('Please upload at least one video');

    // Step 2: Save course first (without videos)
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user._id) throw new Error('User not authenticated');

    const baseCourseData = {
      title: form.title.trim(),
      description: form.description.trim(),
      instructor: user._id,
      category: form.category,
     /* curriculum: curriculum.map(lec => ({
        title: lec.title,
        isPreview: lec.isPreview || false,
        videoUrl: '', // Empty for now
        videoPublicId: '',
        createdAt: new Date()
      })),*/
      price: form.isFree ? 0 : parseFloat(form.price),
      isFree: form.isFree,
      paymentMethod: form.isFree ? 'None' : form.paymentMethod,
      jazzCashNumber: form.paymentMethod === 'JazzCash' ? form.jazzCashNumber : '',
      meezanBankAccount: form.paymentMethod === 'MeezanBank' ? form.meezanBankAccount : ''
    };

    let courseResponse;
    let courseId;

    if (editingCourseId) {
      courseResponse = await fetch(`${baseUrl}/api/courses/${editingCourseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        credentials: 'include',
        body: JSON.stringify(baseCourseData)
      });
    } else {
      courseResponse = await fetch(`${baseUrl}/api/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        credentials: 'include',
        body: JSON.stringify(baseCourseData)
      });
    }

    if (!courseResponse.ok) throw new Error('Failed to save course');
    const savedCourse = await courseResponse.json();
    courseId = savedCourse._id;

    // Step 3: Upload videos now using course ID
    const uploadedVideos = [];

    for (let i = 0; i < videos.length; i++) {
      const video = videos[i];
      if (!video.url.startsWith('http')) {
        const uploaded = await uploadVideoToBackend(
          video.file,
          courseId, // Pass courseId instead of title
          curriculum[i]?.title || video.title || 'Untitled Lecture'
        );
        uploadedVideos.push({
          ...video,
          url: uploaded.url,
          public_id: uploaded.public_id,
          duration: uploaded.duration || 0
        });
      } else {
        uploadedVideos.push(video);
      }
    }

    // Step 4: Update course with video info
    const updatedCurriculum = curriculum.map((lec, idx) => ({
      ...lec,
      videoUrl: uploadedVideos[idx]?.url || '',
      videoPublicId: uploadedVideos[idx]?.public_id || '',
      videoName: uploadedVideos[idx]?.title || ''
    }));

    const updateResponse = await fetch(`${baseUrl}/api/courses/${courseId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      credentials: 'include',
      body: JSON.stringify({ curriculum: updatedCurriculum })
    });

    if (!updateResponse.ok) throw new Error('Failed to update course with videos');

    const updatedCourse = await updateResponse.json();
    setCourses(prev => editingCourseId
      ? prev.map(c => (c._id === courseId || c.id === courseId) ? updatedCourse : c)
      : [...prev, updatedCourse]);

toast.success('Course and lectures uploaded successfully!');
// ✅ Optional: brief delay for smoother UX before reset
await new Promise(res => setTimeout(res, 500));

      // Reset form
    await fetchCourses();
    setCourses(prev => [...prev]);

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
            <div className="course-card" key={course._id || course.id} style={{
              display:'flex'
            }}>
              <div className="course-card-header">
                <h3>{course.title} is course</h3>
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
           
            </div>
          ))}
        </div>
      </main>
      <InstructorFooter />
    </div>
  );
}
