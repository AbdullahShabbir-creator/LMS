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
import { getFreeCourses, getEnrolledCourses, getAllCourses, purchaseCourse } from '../services/api';
import useAuth from '../hooks/useAuth';
import { getToken as getAuthToken } from '../utils/auth';

// Add this utility function at the top of the file, before the component definition
const getPlaceholderImage = (category) => {
  const categories = {
    'Web Development': 'https://source.unsplash.com/random/300×200/?coding',
    'Programming': 'https://source.unsplash.com/random/300×200/?programming',
    'Design': 'https://source.unsplash.com/random/300×200/?design',
    'Business': 'https://source.unsplash.com/random/300×200/?business',
    'Marketing': 'https://source.unsplash.com/random/300×200/?marketing',
    'Photography': 'https://source.unsplash.com/random/300×200/?photography',
    'Music': 'https://source.unsplash.com/random/300×200/?music',
    'Health': 'https://source.unsplash.com/random/300×200/?health',
    'Science': 'https://source.unsplash.com/random/300×200/?science',
    'Language': 'https://source.unsplash.com/random/300×200/?language',
  };
  
  return categories[category] || `https://source.unsplash.com/random/300×200/?${category || 'education'}`;
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

  // Memoized fetchData function to avoid re-creation on every render
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      // Fetch free courses
      const { courses: freeCourses, error: freeCoursesError } = await getFreeCourses();
      
      if (freeCoursesError) {
        console.error('Error fetching free courses:', freeCoursesError);
        toast.warning(`Note: ${freeCoursesError}`);
      }
      
      // Fetch enrolled courses
      const { courses: enrolledCourses, error: enrolledCoursesError } = await getEnrolledCourses();
      
      if (enrolledCoursesError) {
        console.error('Error fetching enrolled courses:', enrolledCoursesError);
        toast.warning(`Note: ${enrolledCoursesError}`);
      }
      
      // Combine the courses and remove duplicates
      let allMyCourses = [];
      
      if (freeCourses && Array.isArray(freeCourses)) {
        allMyCourses = [...freeCourses];
      }
      
      if (enrolledCourses && Array.isArray(enrolledCourses)) {
        // Add enrolled courses and mark them as enrolled
        enrolledCourses.forEach(course => {
          if (!allMyCourses.some(c => c._id === course._id)) {
            allMyCourses.push({
              ...course,
              enrolled: true
            });
          }
        });
      }
      
      // If no courses found, add placeholder messages
      if (allMyCourses.length === 0) {
        console.log('No courses found from API, using sample data');
        // Add dummy courses for demo/testing (does not affect real logic)
        const dummyCourses = [
          {
            _id: 'dummy1',
            title: 'React for Beginners',
            category: 'Web Development',
            instructor: { name: 'John Doe' },
            description: 'Learn the basics of React.js and build your first web app.',
            preview: 'Intro to React concepts and JSX.',
            isFree: true,
            price: 0,
            students: [],
            image: 'https://source.unsplash.com/random/300×200/?react',
            content: [
              { title: 'Introduction to React', type: 'video', url: 'https://example.com/intro.mp4', duration: '10:30' },
              { title: 'JSX Basics', type: 'pdf', url: 'https://example.com/jsx.pdf', pages: 15 },
              { title: 'Components & Props', type: 'quiz', questions: 5 }
            ]
          },
          {
            _id: 'dummy3',
            title: 'UI/UX Design Fundamentals',
            category: 'Design',
            instructor: { name: 'Alex Lee' },
            description: 'Understand the principles of UI/UX design for web and mobile.',
            preview: 'Wireframing, prototyping, and usability.',
            isFree: true,
            price: 0,
            students: [],
            image: 'https://source.unsplash.com/random/300×200/?design',
            content: [
              { title: 'Design Thinking', type: 'video', url: 'https://example.com/design.mp4', duration: '8:20' },
              { title: 'User Research', type: 'document', url: 'https://example.com/research.pdf', pages: 12 },
              { title: 'Wireframing', type: 'tutorial', steps: 8 }
            ]
          }
        ];
        allMyCourses = dummyCourses;
      }
      
      // Process and normalize courses
      const processedCourses = allMyCourses.map(course => {
        return {
          ...course,
          // Add default image if missing
          image: course.image || getPlaceholderImage(course.category),
          // Add default preview if missing
          preview: course.preview || 'No preview available for this course',
          // Ensure category exists
          category: course.category || 'General',
          // Set free status
          isFree: course.isFree || course.price === 0
        };
      });
      
      console.log(`Loaded ${processedCourses.length} courses for My Courses tab`);
      setCourses(processedCourses);
      
      // Extract unique categories
      const uniqueCategories = ['All', ...new Set(processedCourses.map(c => c.category).filter(Boolean))];
      setCategories(uniqueCategories);
      
      // Set user ID from useAuth hook
      if (user && user._id) {
        setUserId(user._id);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Unexpected error fetching courses:', err);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      fetchData();
    }
  }, [authLoading, fetchData]);

  // Retry loading if there was an error
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

  const isUnlocked = course => {
    // All courses in My Courses should be accessible
    return true;
  };

  const handleBuy = course => {
    // Should not be needed in My Courses, but keeping for completeness
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
      
      // Update course in state
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

  // Render content based on loading state
  const renderContent = () => {
    if (loading) {
      return (
        <motion.div 
          className="my-courses-loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Loading your courses
        </motion.div>
      );
    }
    
    if (error) {
      return (
        <motion.div 
          className="my-courses-error"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {error}
          <motion.button 
            onClick={handleRetry}
            className="retry-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Retry
          </motion.button>
        </motion.div>
      );
    }
    
    if (filteredCourses.length === 0) {
      return (
        <motion.div 
          className="my-courses-empty"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          No courses found. Try adjusting your filters.
        </motion.div>
      );
    }
    
    return (
      <motion.div 
        className="my-courses-list"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
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
      <ToastContainer 
        position="bottom-right" 
        autoClose={3000} 
        hideProgressBar 
        newestOnTop 
        closeButton={false}
        toastStyle={{
          background: 'rgba(255, 255, 255, 0.98)',
          color: '#112240',
          borderRadius: '10px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(67, 206, 162, 0.2)'
        }}
        progressStyle={{
          background: 'linear-gradient(90deg, #43cea2, #185a9d)'
        }}
      />
      
      <div className="my-courses-content">
        <div className="my-courses-header-section">
          <motion.h1
            className="my-courses-title"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            My Courses
          </motion.h1>
        </div>
        
        <motion.div 
          className="my-courses-controls"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <motion.select 
            whileFocus={{ scale: 1.02 }}
            value={category} 
            onChange={e => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </motion.select>
        </motion.div>
        
        {renderContent()}
      </div>
      
      <PaymentModal 
        open={showPayment} 
        onClose={() => setShowPayment(false)} 
        course={selectedCourse} 
        onPaymentSuccess={handlePaymentSuccess} 
      />
      
      <CourseDetailsModal
        course={selectedCourse}
        isOpen={showCourseDetails}
        onClose={() => setShowCourseDetails(false)}
        onPurchase={handleBuy}
        isUnlocked={selectedCourse ? isUnlocked(selectedCourse) : false}
      />
      
      <StudentFooter />
    </div>
  );
}

// CourseCard Component for better organization
function CourseCard({ course, isUnlocked, onCardClick, onViewClick, onBuyClick, index }) {
  return (
    <motion.div
      className={`course-card ${isUnlocked ? 'unlocked' : 'locked'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ y: -15, boxShadow: '0 20px 40px rgba(24, 90, 157, 0.2)' }}
      onClick={() => onCardClick(course)}
    >
      <div className="course-card-header" style={{ "--animation-order": 1 }}>
        <span className="course-category">{course.category || 'General'}</span>
        <span className={`course-status ${isUnlocked ? 'unlocked' : 'locked'}`}>
          {isUnlocked ? 'Unlocked' : 'Preview'}
        </span>
      </div>
      
      {(course.image || course.category) && (
        <img 
          src={course.image || getPlaceholderImage(course.category)}
          alt={course.title} 
          className="course-image"
          style={{ "--animation-order": 2 }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = getPlaceholderImage(course.category);
          }}
        />
      )}
      
      <h2 className="course-title" style={{ "--animation-order": 3 }}>{course.title}</h2>
      <div className="course-instructor" style={{ "--animation-order": 4 }}>By {course.instructor?.name || 'Unknown'}</div>
      <div className="course-description" style={{ "--animation-order": 5 }}>
        {isUnlocked ? course.description : course.preview || 'Preview not available'}
      </div>
      
      <div className="course-actions" style={{ "--animation-order": 6 }}>
        {isUnlocked ? (
          <motion.button 
            className="course-view-btn" 
            onClick={(e) => {
              e.stopPropagation();
              onViewClick(course);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View Course
          </motion.button>
        ) : (
          <motion.button 
            className="course-buy-btn" 
            onClick={(e) => {
              e.stopPropagation();
              onBuyClick(course);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {course.isFree || course.price === 0 ? 'Free - Enroll Now' : `Rs.${course.price}`}
          </motion.button>
        )}
      </div>
      
      {isUnlocked && course.content && course.content.length > 0 && (
        <div className="course-content-preview" style={{ "--animation-order": 7 }}>
          <h3>Contents:</h3>
          <ul className="content-list">
            {course.content.slice(0, 2).map((item, index) => (
              <li key={index} className="content-item">
                <span className="content-title">{item.title}</span>
                <span className="content-type">{item.type}</span>
              </li>
            ))}
            {course.content.length > 2 && (
              <li className="content-more">+{course.content.length - 2} more</li>
            )}
          </ul>
        </div>
      )}
    </motion.div>
  );
}
