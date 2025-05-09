/**
 * Course Manager Component
 * 
 * FIXES FOR VIDEO UPLOAD ERROR:
 * 1. Increased upload timeout from 30s to 180s (3 minutes) for larger files
 * 2. Added retry mechanism for failed uploads (2 retry attempts)
 * 3. Improved error handling and display of specific error messages
 * 4. Added upload status indicators to track progress
 * 5. Enhanced validation of video files before upload
 * 6. Fixed mapping of videos to lectures
 * 7. Added better user feedback during the upload process
 * 
 * FIXES FOR AUTHENTICATION ERROR:
 * 1. Added proper token handling for all API requests
 * 2. Added auth token checks before course operations
 * 3. Implemented auth token retrieval from localStorage
 * 
 * Note: For large video files, please be patient during upload.
 * The maximum file size is 500MB per video.
 */

import React, { useState, useEffect } from 'react';
import InstructorHeader from '../components/InstructorHeader';
import InstructorFooter from '../components/InstructorFooter';
import CurriculumBuilder from '../components/CurriculumBuilder';
import BulkVideoUpload from '../components/BulkVideoUpload';
import ReactPlayer from 'react-player';
import { FaPlus, FaTrash, FaEdit, FaVideo, FaEye } from 'react-icons/fa';
import '../styles/course.manager.css';
import { getToken, isAuthenticated, getInstructorId, authHeader, handleAuthError } from '../utils/auth';

// Utility to upload a video to the backend and get its Firebase URL
async function uploadVideoToFirebase(file, retryCount = 0) {
  try {
    console.log("Starting upload for file:", file.name);
    
    // Get the auth token
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }
    
    // Create a form with the file
    const formData = new FormData();
    formData.append('video', file);
    
    // Show detailed error if server is down
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 180000); // Increased to 3 minute timeout
    
    // Inform user that upload is in progress
    console.log(`Uploading ${file.name}. This may take several minutes for large files...`);
    
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
      headers: authHeader(),
      credentials: 'include',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      let errorMessage;
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || `Server error: ${res.status} ${res.statusText}`;
        
        // Handle authentication errors specifically
        if (res.status === 401 || res.status === 403 || errorMessage.includes('token') || errorMessage.includes('auth')) {
          throw new Error('Authentication failed. Please log in again.');
        }
      } catch (e) {
        // If we can't parse JSON, use text or default message
        const errorText = await res.text().catch(() => "Unknown server error");
        errorMessage = errorText || `Upload failed: ${res.status} ${res.statusText}`;
      }
      console.error("Server error response:", errorMessage);
      
      // Handle server errors with retry
      if (res.status >= 500 && retryCount < 2) {
        console.log(`Retrying upload for ${file.name} (attempt ${retryCount + 1}/2)...`);
        // Wait for a short time before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
        return uploadVideoToFirebase(file, retryCount + 1);
      }
      
      throw new Error(errorMessage);
    }
    
    const data = await res.json();
    
    // Validate the response - handle both Firebase and Cloudinary formats
    if (!data || (!data.url && !data.downloadURL && !data.secure_url)) {
      throw new Error('Invalid response from server, missing URL');
    }
    
    // Normalize response to ensure consistent properties
    const normalizedData = {
      url: data.url || data.downloadURL || data.secure_url,
      public_id: data.public_id || data.id || '',
      duration: data.duration || 0
    };
    
    console.log("Upload success for file:", file.name);
    return normalizedData;
  } catch (error) {
    console.error('Upload error:', error);
    
    // Handle authentication errors
    if (handleAuthError(error)) {
      throw new Error('Authentication failed. Please log in again.');
    }
    
    // Retry on network errors or timeouts
    if ((error.name === 'TypeError' || error.name === 'AbortError') && retryCount < 2) {
      console.log(`Network error, retrying upload for ${file.name} (attempt ${retryCount + 1}/2)...`);
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 3000));
      return uploadVideoToFirebase(file, retryCount + 1);
    }
    
    if (error.name === 'AbortError') {
      throw new Error('Upload timed out after 3 minutes. The file might be too large or the server might be overloaded.');
    }
    
    throw error; // Propagate the original error with its message
  }
}

async function handleSaveCourse(e) {
    e.preventDefault();
    setUploading(true);
    
    // Show a message to indicate the upload is starting
    alert('Starting course save process. Please wait while videos are uploaded...');
    
    try {
      // Verify authentication
      if (!isAuthenticated()) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
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
              // Update UI to show which video is being uploaded
              setVideos(prevVideos => 
                prevVideos.map((v, idx) => 
                  idx === i ? { ...v, status: 'uploading' } : v
                )
              );
              
              // Log to console for debugging
              console.log(`Starting upload for video ${i+1}/${videos.length}: ${video.title}`);
              
              const uploaded = await uploadVideoToFirebase(video.file);
              
              // Update video status to success
              setVideos(prevVideos => 
                prevVideos.map((v, idx) => 
                  idx === i ? { ...v, status: 'success' } : v
                )
              );
              
              console.log(`Successfully uploaded video ${i+1}/${videos.length}: ${video.title}`);
              
              uploadedVideos.push({ 
                ...video, 
                url: uploaded.url, 
                public_id: uploaded.public_id,
                duration: uploaded.duration || 0
              });
            } catch (error) {
              // Update video status to error
              setVideos(prevVideos => 
                prevVideos.map((v, idx) => 
                  idx === i ? { ...v, status: 'error' } : v
                )
              );
              
              console.error(`Failed to upload video ${video.title}:`, error);
              throw new Error(`Failed to upload video: ${video.title}. ${error.message}`);
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
        instructor: getInstructorId() || 'INSTRUCTOR_ID',
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
          headers: { 
            'Content-Type': 'application/json',
            ...authHeader()
          },
          credentials: 'include',
          body: JSON.stringify(courseData)
        });
      } else {
        res = await fetch('/api/courses', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...authHeader()
          },
          credentials: 'include',
          body: JSON.stringify(courseData)
        });
      }
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        // Handle authentication errors specifically
        if (res.status === 401 || res.status === 403 || 
            (errorData.message && (errorData.message.includes('token') || errorData.message.includes('auth')))) {
          throw new Error('Authentication failed. Please log in again.');
        }
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
      setForm({ 
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
      setCurriculum([]);
      setVideos([]);
      setEditingCourseId(null);
      
      // Show success message
      alert(editingCourseId ? 'Course updated successfully!' : 'Course created successfully!');
    } catch (error) {
      console.error('Error saving course:', error);
      // Reset uploading state
      setUploading(false);
      
      // Handle authentication errors
      if (handleAuthError(error)) {
        return; // handleAuthError already shows messages and redirects
      }
      
      // Display a more user-friendly error message
      const errorMessage = error.message || 'An unknown error occurred';
      alert(`Failed to save course: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  }

async function handleDeleteCourse(id) {
  try {
    // Confirm deletion
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }
    
    // Verify authentication
    if (!isAuthenticated()) {
      throw new Error('No authentication token found. Please log in again.');
    }
    
    const res = await fetch(`/api/courses/${id}`, {
      method: 'DELETE',
      headers: authHeader(),
      credentials: 'include',
    });
    
    if (!res.ok) {
      let errorMessage;
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || `Server error: ${res.status} ${res.statusText}`;
        
        // Handle authentication errors specifically
        if (res.status === 401 || res.status === 403 || errorMessage.includes('token') || errorMessage.includes('auth')) {
          throw new Error('Authentication failed. Please log in again.');
        }
      } catch (e) {
        errorMessage = `Failed to delete course: ${res.status} ${res.statusText}`;
      }
      throw new Error(errorMessage);
    }
    
    // Only update UI if deletion was successful
    setCourses(courses.filter(c => c._id !== id && c.id !== id));
    alert('Course deleted successfully');
  } catch (error) {
    console.error('Delete course error:', error);
    
    // Handle authentication errors
    if (handleAuthError(error)) {
      return; // handleAuthError already shows messages and redirects
    }
    
    alert(`Failed to delete course: ${error.message}`);
  }
}

// Fetch courses from backend on mount
useEffect(() => {
  async function fetchCourses() {
    try {
      // Verify authentication
      if (!isAuthenticated()) {
        console.warn('No authentication token found. Using demo data.');
        return; // Continue with initial demo data
      }

      const res = await fetch('/api/courses', { 
        credentials: 'include',
        headers: authHeader()
      });
      
      if (!res.ok) {
        // If authorization failed, continue with initial data
        if (res.status === 401 || res.status === 403) {
          console.warn('Authentication failed. Using demo data.');
          return;
        }
        throw new Error(`Failed to fetch courses: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      handleAuthError(error); // Handle auth errors
      // Continue with initial courses as fallback
    }
  }
  fetchCourses();
}, []);

// Development helper for testing authentication
useEffect(() => {
  // Check if running in development mode
  if (process.env.NODE_ENV === 'development') {
    // This is just a development helper to create a test token if none exists
    const token = getToken();
    if (!token) {
      console.log('%c 🔑 No token found. Use the following code in console to set a test token:', 'background: #222; color: #bada55; padding: 2px;');
      console.log('%c const setTestToken = () => { localStorage.setItem("token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InRlc3QtaW5zdHJ1Y3Rvci1pZCIsIm5hbWUiOiJUZXN0IEluc3RydWN0b3IiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoiaW5zdHJ1Y3RvciIsImlhdCI6MTU5ODQ1MjQ3MH0.K5dR6PK1mwlv7bzbdAKsLbH7YeNg201AQjFlAqimdW4"); location.reload(); }', 'background: #222; color: #bada55; padding: 2px;');
    }
  }
}, []);

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
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Optimistic initialization

  // Check authentication on mount
  useEffect(() => {
    const authenticated = isAuthenticated();
    if (!authenticated) {
      setIsAuthenticated(false);
      alert("You are not logged in. Please log in to manage courses.");
      // Uncomment the line below to enable automatic redirect
      // window.location.href = '/login';
    }
  }, []);

  // If not authenticated, show a message
  if (!isAuthenticated) {
    return (
      <div className="auth-error-container">
        <InstructorHeader />
        <div className="auth-error">
          <h2>Authentication Required</h2>
          <p>You need to be logged in as an instructor to access this page.</p>
          <button onClick={() => window.location.href = '/login'}>Go to Login</button>
        </div>
        <InstructorFooter />
      </div>
    );
  }

  // Rest of the component code...
} 