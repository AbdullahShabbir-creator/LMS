import React, { useEffect, useState } from 'react';
import HideOnScrollHeader from '../components/HideOnScrollHeader';
import StudentFooter from '../components/StudentFooter';
import CourseModal from '../components/CourseModal';
import AnimatedBallsBackground from '../components/AnimatedBallsBackground';
import { motion } from 'framer-motion';
import { getPaidCourses, purchaseCourse } from '../services/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useAuth from '../hooks/useAuth';
import { getToken } from '../utils/auth';
import PaymentModal from '../components/PaymentModal';
import './StudentExploreCourses.css';
import { baseUrl } from '../config/api';

function handleAuthError(status) {
  if (status === 401 || status === 403) {
    localStorage.removeItem('lms_token');
    window.location.href = '/login';
  }
}

export default function StudentExploreCourses() {
  const { user } = useAuth('student');

  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 6;

  useEffect(() => {
  if (user) {
    fetchCourses();
  }
}, [user]);


  const fetchCourses = async () => {
    setLoading(true);
    try {
      const { courses: paidCourses, error: paidCoursesError } = await getPaidCourses();

      if (paidCoursesError) {
        console.error('Error fetching paid courses:', paidCoursesError);
        setError('Failed to load courses. Please try again later.');
        setLoading(false);
        return;
      }

      let availableCourses = paidCourses || [];

      if (availableCourses.length === 0) {
        availableCourses = DEMO_COURSES;
      } else {
       availableCourses = availableCourses?.courses.map(course => {
  const isEnrolled = user ? course.students?.some(
    s => s.student === user._id
  ) : false;

  return {
    ...course,
    image: course.image || `https://source.unsplash.com/featured/?${course.category || 'education'}`,
    enrolled: isEnrolled
  };
});

      }

      setCourses(availableCourses);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const DEMO_COURSES = [
    {
      id: 'demo1',
      _id: 'demo1',
      title: 'Advanced JavaScript Patterns',
      description: 'Learn professional JavaScript patterns and advanced concepts.',
      instructor: { name: 'Demo Teacher' },
      image: 'https://source.unsplash.com/featured/?javascript,code',
      category: 'Programming',
      enrolled: false,
      isFree: false,
      price: 1200,
      rating: 4.9,
      students: []
    },
    {
      id: 'demo2',
      _id: 'demo2',
      title: 'Machine Learning Masterclass',
      description: 'A complete guide to machine learning algorithms and applications.',
      instructor: { name: 'Demo Data Scientist' },
      image: 'https://source.unsplash.com/featured/?machinelearning,ai',
      category: 'Data Science',
      enrolled: false,
      isFree: false,
      price: 1500,
      rating: 4.7,
      students: []
    }
  ];

  const filteredCourses = courses.filter(course => {
    const matchesSearch =
      (course.title?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (course.instructor?.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (course.description?.toLowerCase() || '').includes(search.toLowerCase());
    const matchesCategory = !category || category === 'All' || course.category === category;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...Array.from(new Set(courses.map(c => c.category).filter(Boolean)))];
  const pagedCourses = filteredCourses.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filteredCourses.length / perPage);

  const handleBuy = async (course) => {
    try {
      const token = getToken();
      const response = await fetch(`${baseUrl}/api/student/enroll/${course._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ courseId: course._id || course.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        handleAuthError(response.status);
        throw new Error(data.message || 'Enrollment failed');
      }

      toast.success('Enrolled in course successfully');

      setCourses(prev =>
        prev.map(c =>
          (c._id || c.id) === (course._id || course.id)
            ? { ...c, enrolled: true }
            : c
        )
      );
    } catch (err) {
      toast.error(err.message || 'An error occurred while enrolling');
      console.error(err);
    }
  };

  const handlePaymentSuccess = async (paymentDetails) => {
    if (!selectedCourse) return;

    setEnrolling(true);
    try {
      const { success, message, error: purchaseError } = await purchaseCourse(
        selectedCourse._id || selectedCourse.id,
        paymentDetails
      );

      if (success) {
        toast.success(message || 'Payment successful! Course unlocked.');

        setCourses(prev => prev.map(c =>
          (c._id || c.id) === (selectedCourse._id || selectedCourse.id)
            ? { ...c, enrolled: true }
            : c
        ));

        setShowPayment(false);
        fetchCourses();
      } else {
        toast.error(purchaseError || 'Payment failed. Please try again.');
      }
    } catch (err) {
      toast.error('An error occurred during payment. Please try again.');
      console.error('Payment error:', err);
    }

    setEnrolling(false);
  };

  return (
    <div className="explore-courses-main-layout">
      <AnimatedBallsBackground />
      <HideOnScrollHeader showMain />
      <main className="explore-main-content">
        <CourseModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
          onBuy={handleBuy}
          enrolling={enrolling}
        />
        <motion.h1
          className="explore-title explore-title-3d"
          initial={{ scale: 0.9, rotateY: 40, opacity: 0 }}
          animate={{ scale: 1, rotateY: 0, opacity: 1 }}
          whileHover={{ scale: 1.07, rotateY: -18, textShadow: '0 8px 32px #00bfff88' }}
          transition={{ type: 'spring', stiffness: 180 }}
        >
          Explore Courses
        </motion.h1>
        <div className="explore-controls">
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="explore-search"
          />
          <select
            value={category}
            onChange={e => setCategory(e.target.value === 'All' ? '' : e.target.value)}
            className="explore-category"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        {loading ? (
          <div className="explore-loading">Loading courses...</div>
        ) : error ? (
          <div className="explore-error">{error}</div>
        ) : (
          <>
            {pagedCourses.length === 0 ? (
  <div className="explore-empty">No courses found.</div>
) : (
  <div className="explore-courses-grid">
    {pagedCourses.map(course => (
      <div
        key={course._id || course.id}
        className="explore-course-card"
        onClick={() => setSelectedCourse(course)}
      >
        <div className="explore-course-info no-image">
          <h2 className="explore-course-title">{course.title}</h2>
          <p className="explore-course-desc">{course.description}</p>
          <div className="explore-course-meta">
            <span className="explore-course-instructor">{course.instructor?.name || 'Unknown'}</span>
            <span className="explore-course-category">{course.category}</span>
          </div>
          {course.rating && (
            <div className="explore-course-rating">{course.rating} / 5</div>
          )}
          <div className="explore-course-price">
            {course.price ? `Rs${course.price}` : 'Free'}
          </div>
          <button
            className="explore-enroll-btn"
            disabled={course.enrolled}
            onClick={e => {
              e.stopPropagation();
              handleBuy(course);
            }}
          >
            {course.enrolled ? 'Enrolled' : 'Enroll Now'}
          </button>
        </div>
      </div>
    ))}
  </div>
)}

            {totalPages > 1 && (
              <div className="explore-pagination">
                <button disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
                <span>Page {page} of {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</button>
              </div>
            )}
          </>
        )}
      </main>

      {showPayment && selectedCourse && (
        <PaymentModal
          course={selectedCourse}
          onClose={() => setShowPayment(false)}
          onSuccess={handlePaymentSuccess}
          loading={enrolling}
        />
      )}

      <ToastContainer position="bottom-right" />
    </div>
  );
}
