// API Service for handling course interactions
import { toast } from 'react-toastify';
import { getToken as getAuthToken } from '../utils/auth';
import {baseUrl} from '../config/api';

// Fetch all available courses
const token = getAuthToken();
export const getAllCourses = async () => {
  try {
 
    const response = await fetch(`${baseUrl}/api/courses/public`, {
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

export const getEnrolledCourses = async () => {
  try {
   
    const res = await fetch(`${baseUrl}/api/student/enrolled-courses`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials:'include'
    });
    console.log(res)
    const data=res.json()
    return data;
  } catch (err) {
    console.error('Failed to fetch enrolled courses', err);
    return { error: 'Failed to fetch enrolled courses' };
  }
};

// Get course details by ID
export const getCourseDetails = async (courseId) => {
  try {
    
  
    const response = await fetch(`${baseUrl}/api/courses/${courseId}`, {
      headers: token ? { Authorization: `Bearer ${token}` }
       : {},
      
    });
    
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return { error: 'Authentication failed' };
      }
      
      throw new Error('Failed to fetch course details');
    }
    
    const data = await response.json();
    console.log(response)
    return { course: data };
  } catch (error) {
    console.log(error)
    return { error: error.message || 'Failed to fetch course details' };
  }
};

// Enroll in a course (free courses)
export const enrollInCourse = async (courseId) => {
  try {
   
    if (!token) return { error: 'Not authenticated' };
    
    const response = await fetch(`${baseUrl}/api/students/enroll/${courseId}`, {
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
   
    if (!token) return { error: 'Not authenticated' };
    
    const response = await fetch(`${baseUrl}/api/courses/purchase/${courseId}`, {
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
    //const token = getAuthToken();
   
    if (!token) return { error: 'Not authenticated' };
    
    const response = await fetch(`${baseUrl}/api/courses/${courseId}/content`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(response)
    
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
   
    if (!token) return { error: 'Not authenticated' };
    
    const response = await fetch(`${baseUrl}/api/students/purchased-courses`, {
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
  
    
    const response = await fetch(`${baseUrl}/api/courses/free`, {
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
    const response = await fetch(`${baseUrl}/api/courses/public`);
    const data = await response.json();

    if (!response.ok) {
      return { courses: [], error: data.message || 'Failed to fetch courses' };
    }

    return { courses: data, error: null };
  } catch (error) {
    console.error('API error fetching public courses:', error);
    return { courses: [], error: 'Network error. Please try again.' };
  }
};

// Mark a lecture as complete
export const markLectureComplete = async (courseId, lessonId) => {
  try {
    if (!token) return { error: 'Not authenticated' };

    const response = await fetch(`${baseUrl}/api/lecturesRoute/progress/complete`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ courseId, lessonId }),
    });

    if (!response.ok) {
      const data = await response.json();
      return { error: data.error || 'Failed to mark lecture as complete' };
    }

    const data = await response.json();
    return { success: true, progress: data.progress };
  } catch (error) {
    return { error: error.message || 'Failed to mark lecture as complete' };
  }
};


export const getAllProgress = async () => {
  try {
    const res = await fetch(`${baseUrl}/api/lecturesRoute/progress`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch progress');

    return data.courses;
  } catch (err) {
    return { error: err.message };
  }
};


// Fetch instructor payment requests
export const getInstructorPaymentRequests = async () => {
  const token = getAuthToken();
  if (!token) {
    return { error: 'No token found. Please log in.' };
  }

  try {
    const res = await fetch(`${baseUrl}/api/instructor/payment-requests`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('Server error response:', errorData);
      return { error: `Status ${res.status}` };
    }

    const data = await res.json();
    return { requests: data };
  } catch (err) {
    console.error('Error fetching payment requests:', err);
    return { error: 'Failed to load payment requests' };
  }
};

// Approve a payment
export const approveInstructorPayment = async (courseId, studentId) => {
  const token = getAuthToken();
  if (!token) {
    return { error: 'No token found. Please log in.' };
  }

  try {
    const res = await fetch(`${baseUrl}/api/instructor/approve-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ courseId, studentId })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('Server error response:', errorData);
      return { error: `Failed to approve payment: ${res.status}` };
    }

    return { success: true };
  } catch (err) {
    console.error('Error approving payment:', err);
    return { error: 'Network error while approving payment' };
  }
};
