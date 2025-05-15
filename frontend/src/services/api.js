// API Service for handling course interactions
import { toast } from 'react-toastify';
import { getToken as getAuthToken } from '../utils/auth';

const API_URL = 'http://localhost:5000';  // Set the correct API base URL

// Fetch all available courses
export const getAllCourses = async () => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/api/courses/public`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return { error: 'Authentication failed' };
      }
      throw new Error('Failed to fetch courses');
    }
    
    const data = await response.json();
    return { courses: data.courses || [] };
  } catch (error) {
    return { error: error.message || 'Failed to fetch courses' };
  }
};

// Get enrolled courses for current student
export const getEnrolledCourses = async () => {
  try {
    const token = getAuthToken();
    if (!token) return { error: 'Not authenticated' };
    
    const response = await fetch(`${API_URL}/api/students/enrolled-courses`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return { error: 'Authentication failed' };
      }
      throw new Error('Failed to fetch enrolled courses');
    }
    
    const data = await response.json();
    return { courses: data.courses || [] };
  } catch (error) {
    return { error: error.message || 'Failed to fetch enrolled courses' };
  }
};

// Get course details by ID
export const getCourseDetails = async (courseId) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/api/courses/${courseId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return { error: 'Authentication failed' };
      }
      throw new Error('Failed to fetch course details');
    }
    
    const data = await response.json();
    return { course: data };
  } catch (error) {
    return { error: error.message || 'Failed to fetch course details' };
  }
};

// Enroll in a course (free courses)
export const enrollInCourse = async (courseId) => {
  try {
    const token = getAuthToken();
    if (!token) return { error: 'Not authenticated' };
    
    const response = await fetch(`${API_URL}/api/students/enroll/${courseId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return { error: 'Authentication failed' };
      }
      const data = await response.json();
      throw new Error(data.message || 'Failed to enroll in course');
    }
    
    return { success: true, message: 'Successfully enrolled in course' };
  } catch (error) {
    return { error: error.message || 'Failed to enroll in course' };
  }
};

// Purchase a course
export const purchaseCourse = async (courseId, paymentDetails) => {
  try {
    const token = getAuthToken();
    if (!token) return { error: 'Not authenticated' };
    
    const response = await fetch(`${API_URL}/api/courses/purchase/${courseId}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(paymentDetails),
    });
    
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return { error: 'Authentication failed' };
      }
      const data = await response.json();
      throw new Error(data.message || 'Payment failed');
    }
    
    const data = await response.json();
    return { success: true, message: data.message || 'Payment successful' };
  } catch (error) {
    return { error: error.message || 'Payment processing failed' };
  }
};

// Get course content (for enrolled students)
export const getCourseContent = async (courseId) => {
  try {
    const token = getAuthToken();
    if (!token) return { error: 'Not authenticated' };
    
    const response = await fetch(`${API_URL}/api/courses/${courseId}/content`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return { error: 'Authentication failed' };
      }
      if (response.status === 403) {
        return { error: 'You need to purchase this course to access content' };
      }
      throw new Error('Failed to fetch course content');
    }
    
    const data = await response.json();
    return { content: data.content || [] };
  } catch (error) {
    return { error: error.message || 'Failed to fetch course content' };
  }
};

// Get purchased courses for current student
export const getPurchasedCourses = async () => {
  try {
    const token = getAuthToken();
    if (!token) return { error: 'Not authenticated' };
    
    const response = await fetch(`${API_URL}/api/students/purchased-courses`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return { error: 'Authentication failed' };
      }
      throw new Error('Failed to fetch purchased courses');
    }
    
    const data = await response.json();
    return { courses: data.courses || [] };
  } catch (error) {
    return { error: error.message || 'Failed to fetch purchased courses' };
  }
};

// Get free courses
export const getFreeCourses = async () => {
  try {
    const token = getAuthToken();
    
    const response = await fetch(`${API_URL}/api/courses/free`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return { error: 'Authentication failed' };
      }
      throw new Error('Failed to fetch free courses');
    }
    
    const data = await response.json();
    return { courses: data.courses || [] };
  } catch (error) {
    return { error: error.message || 'Failed to fetch free courses' };
  }
};

// Get paid courses (for explore page)
export const getPaidCourses = async () => {
  try {
    const token = getAuthToken();
    
    const response = await fetch(`${API_URL}/api/courses/paid`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return { error: 'Authentication failed' };
      }
      throw new Error('Failed to fetch paid courses');
    }
    
    const data = await response.json();
    return { courses: data.courses || [] };
  } catch (error) {
    return { error: error.message || 'Failed to fetch paid courses' };
  }
}; 