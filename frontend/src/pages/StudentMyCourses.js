import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import StudentFooter from '../components/StudentFooter';
import StudentHeader from '../components/StudentHeader';
import CourseCard from '../components/CourseCard';
import PaymentModal from '../components/PaymentModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getEnrolledCourses, purchaseCourse } from '../services/api';
import useAuth from '../hooks/useAuth';
import './StudentMyCourses.css';

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
  const [paymentCategory, setPaymentCategory] = useState('All');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const enrolledCoursesResult = await getEnrolledCourses();
      const enrolledCourses = enrolledCoursesResult?.courses || [];

      const processedCourses = enrolledCourses.map(course => {
        return {
          ...course,
          category: course.category || 'General',
          image: course.image || getPlaceholderImage(course.category),
          isFree: course.isFree ?? (course.price === 0),
          price: course.price ?? 0,
          students: course.students || []
        };
      });

      setCourses(processedCourses);

      const uniqueCategories = ['All', ...new Set(processedCourses.map(c => c.category).filter(Boolean))];
      setCategories(uniqueCategories);

      setLoading(false);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses. Please try again.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      fetchData();
    }
  }, [authLoading, fetchData]);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !category || category === 'All' || course.category === category;
    const matchesPayment =
      paymentCategory === 'All' ||
      (paymentCategory === 'Free' && course.isFree) ||
      (paymentCategory === 'Paid' && !course.isFree);
    return matchesSearch && matchesCategory && matchesPayment;
  });

  const handleCourseClick = (course, studentData) => {
    if (course.isFree || studentData?.isPaid) {
      navigate(`/student/course/${course._id}`, {
        state: {
          courseId: course._id,
          courseTitle: course.title,
          courseImage: course.image
        }
      });
    } else {
      setSelectedCourse(course);
      setShowPayment(true);
    }
  };

  const handlePaymentSuccess = async (paymentDetails) => {
    if (!selectedCourse) return;
    setLoading(true);

    const { success, message, error: purchaseError } = await purchaseCourse(selectedCourse._id, paymentDetails);

    if (success) {
      toast.success(message || 'Payment successful! Course unlocked.');
      fetchData();
      setShowPayment(false);
    } else {
      toast.error(purchaseError || 'Payment failed. Please try again.');
    }

    setLoading(false);
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
          <select value={paymentCategory} onChange={(e) => setPaymentCategory(e.target.value)} className="category-select">
            <option value="All">All</option>
            <option value="Free">Free</option>
            <option value="Paid">Paid</option>
          </select>
        </div>

        {loading ? (
          <motion.div className="my-courses-loading">Loading your courses...</motion.div>
        ) : error ? (
          <motion.div className="my-courses-error">
            {error}
            <motion.button onClick={fetchData} className="retry-button">Retry</motion.button>
          </motion.div>
        ) : filteredCourses.length === 0 ? (
          <motion.div className="my-courses-empty">No courses found.</motion.div>
        ) : (
          <motion.div className="my-courses-list">
            <AnimatePresence>
              {filteredCourses.map((course, index) => {
                const studentData = course.students.find(s => {
                  const studentId = s.student?._id || s.student?.toString() || s.student;
                  return studentId === user._id;
                });

                let buttonText = 'View Course';
                if (!course.isFree && !studentData?.isPaid) {
                  buttonText = 'Pay Now';
                }

                return (
                  <CourseCard
                    key={course._id}
                    course={course}
                    onCardClick={() => handleCourseClick(course, studentData)}
                    index={index}
                    buttonText={buttonText}
                  />
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {showPayment && selectedCourse && (
        <PaymentModal
          open={showPayment}
          course={selectedCourse}
          onClose={() => setShowPayment(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      <StudentFooter />
    </div>
  );
}
