import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export const createLecture = async (lectureData) => {
  try {
    const formData = new FormData();
    formData.append('courseId', lectureData.courseId);
    formData.append('lectureTitle', lectureData.lectureTitle);

    formData.append('video', lectureData.video);

    const response = await axios.put(`${API_URL}/instructor/uploadlecture`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('lms_token')}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error creating lecture:', error);
    throw error.response?.data?.message || 'Failed to create lecture';
  }
};

export const getLectures = async () => {
  try {
    const response = await axios.get(API_URL, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('lms_token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching lectures:', error);
    throw error.response?.data?.message || 'Failed to fetch lectures';
  }
};

export const deleteLecture = async (id) => {
  try {
    await axios.delete(`${API_URL}/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
  } catch (error) {
    console.error('Error deleting lecture:', error);
    throw error.response?.data?.message || 'Failed to delete lecture';
  }
};
