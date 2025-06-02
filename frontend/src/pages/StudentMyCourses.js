import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import StudentFooter from '../components/StudentFooter';
import PaymentModal from '../components/PaymentModal';
import CourseDetailsModal from '../components/CourseDetailsModal';
import './StudentMyCourses.css';
import StudentHeader from '../components/StudentHeader';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getEnrolledCourses, purchaseCourse } from '../services/api';
import useAuth from '../hooks/useAuth';
import { getToken as getAuthToken } from '../utils/auth';
import CourseCard from '../components/CourseCard';

const getPlaceholderImage = (category) => {
  const categories = {
    'Web Development': 'https://source.unsplash.com/random/300x200/?coding',
    'Programming': 'https://source.unsplash.com/random/300x200/?programming',
    'Design': 'https://source.unsplash.com/random/300x200/?design',
    'Business': 'https://source.unsplash.com/random/300x200/?business',
    'Marketing': 'https://source.unsplash.com/random/300x200/?marketing',
    'Photography': 'https://source.unsplash.com/random/300x200/?photography',
    'Music': 'https://source.unsplash.com/random/300x200/?music',
    'Health': 'https://source.unsplash.com/random/300x200/?health',
    'Science': 'https://source.unsplash.com/random/300x200/?science',
    'Language': 'https://source.unsplash.com/random/300x200/?language',
  };

  return categories[category] || `https://source.unsplash.com/random/300x200/?${category || 'education'}`;
};

export default function StudentMyCourses() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth('student');
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [userId, setUserId] = useState(null);
  const [showCourseDetails, setShowCourseDetails] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const enrolledCoursesResult = await getEnrolledCourses();
      const enrolledCourses = enrolledCoursesResult?.courses || [];

      const processedCourses = enrolledCourses.map(course => ({
        ...course,
        category: course.category || 'General',
        instructor: course.instructor || { name: 'Instructor' },
        rating: course.rating || 4.0,
        students: course.students?.length || 0,
        image: course.image || getPlaceholderImage(course.category),
        preview: course.preview || 'No preview available for this course',
        isFree: course.isFree || course.price === 0,
        price: course.price || 0,
        enrolled: true,
        progress: course.progress || 0,
        content: course.content || []
      }));

      setCourses(processedCourses);
      const uniqueCategories = ['All', ...new Set(processedCourses.map(c => c.category).filter(Boolean))];
      setCategories(uniqueCategories);

      if (user && user._id) {
        setUserId(user._id);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses. Please try again.');
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      fetchData();
    }
  }, [authLoading, fetchData]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setError('');
    fetchData();
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !category || category === 'All' || course.category === category;
    return matchesSearch && matchesCategory;
  });

  const isUnlocked = () => true;

  const handleBuy = (course) => {
    setSelectedCourse(course);
    setShowPayment(true);
  };

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setShowCourseDetails(true);
  };

  const handlePaymentSuccess = async (paymentDetails) => {
    if (!selectedCourse || isUnlocked(selectedCourse)) return;

    setLoading(true);

    const { success, message, error: purchaseError } = await purchaseCourse(
      selectedCourse._id,
      paymentDetails
    );

    if (success) {
      toast.success(message || 'Payment successful! Course unlocked.');

      setCourses(prev => prev.map(c =>
        c._id === selectedCourse._id
          ? { ...c, students: [...(c.students || []), userId], enrolled: true }
          : c
      ));

      setShowPayment(false);
    } else {
      toast.error(purchaseError || 'Payment failed. Please try again.');
    }

    setLoading(false);
  };

  const viewCourse = (course) => {
    navigate(`/student/course/${course._id}`, {
      state: {
        courseId: course._id,
        courseTitle: course.title,
        courseImage: course.image
      }
    });
  };

  const renderContent = () => {
    if (loading) {
      return <motion.div className="my-courses-loading">Loading your courses...</motion.div>;
    }

    if (error) {
      return (
        <motion.div className="my-courses-error">
          {error}
          <motion.button onClick={handleRetry} className="retry-button">Retry</motion.button>
        </motion.div>
      );
    }

    if (filteredCourses.length === 0) {
      return <motion.div className="my-courses-empty">No courses found.</motion.div>;
    }

    return (
      <motion.div className="my-courses-list">
        <AnimatePresence>
          {filteredCourses.map((course, index) => (
            <CourseCard
              key={course._id}
              course={course}
              isUnlocked={isUnlocked(course)}
              onCardClick={handleCourseClick}
              onViewClick={viewCourse}
              onBuyClick={handleBuy}
              index={index}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="my-courses-root">
      <StudentHeader showPrevious={true} />
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar />
      <div className="my-courses-container">
        <div className="my-courses-header">
          <h2>My Courses</h2>
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="category-select">
            {categories.map((cat, i) => (
              <option key={i} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        {renderContent()}
      </div>

      {showPayment && selectedCourse && (
        <PaymentModal
          course={selectedCourse}
          onClose={() => setShowPayment(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {showCourseDetails && selectedCourse && (
        <CourseDetailsModal
          course={selectedCourse}
          onClose={() => setShowCourseDetails(false)}
        />
      )}

      <StudentFooter />
    </div>
  );
}
