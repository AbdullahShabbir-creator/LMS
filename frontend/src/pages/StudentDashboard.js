import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import StudentHeader from '../components/StudentHeader';
import StudentFooter from '../components/StudentFooter';
import AnimatedBallsBackground from '../components/AnimatedBallsBackground';
import LoadingSpinner from '../components/LoadingSpinner';
import useAuth from '../hooks/useAuth';
import './StudentDashboard.css';

export default function StudentDashboard() {
  const { user, loading } = useAuth('student');
  
  if (loading) {
    return <LoadingSpinner message="Loading Student Dashboard" />;
  }
  
  return (
    <div className="student-dashboard-container">
      <AnimatedBallsBackground />
      <StudentHeader />
      
      <main className="student-dashboard-content">
        <motion.div 
          className="welcome-section"
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.7 }}
        >
          <motion.h1
            className="dashboard-title"
            initial={{ scale: 0.8, rotateY: 30, opacity: 0 }}
            animate={{ scale: 1, rotateY: 0, opacity: 1 }}
            whileHover={{ scale: 1.05, rotateY: -10, textShadow: '0 8px 32px #00bfff88' }}
            transition={{ type: 'spring', stiffness: 140 }}
          >
            Student Dashboard
          </motion.h1>
          
          <p className="welcome-message">
            Welcome{user?.name ? `, ${user.name}` : ''}! 
            <span className="welcome-subtitle">Access your courses, track progress, and explore new content</span>
          </p>
        </motion.div>

        <section className="dashboard-cards">
          <motion.div 
            className="dashboard-card"
            whileHover={{ scale: 1.03, boxShadow: '0 10px 40px rgba(67, 206, 162, 0.2)' }} 
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <div className="card-icon">📚</div>
            <Link to="/student/my-courses" className="card-title">My Courses</Link>
            <p className="card-description">Continue learning your enrolled courses</p>
          </motion.div>

          <motion.div 
            className="dashboard-card"
            whileHover={{ scale: 1.03, boxShadow: '0 10px 40px rgba(108, 99, 255, 0.2)' }} 
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <div className="card-icon">🛒</div>
            <Link to="/student/explore" className="card-title" style={{ color: '#6c63ff' }}>Explore Courses</Link>
            <p className="card-description">Browse and enroll in new courses</p>
          </motion.div>

          <motion.div 
            className="dashboard-card"
            whileHover={{ scale: 1.03, boxShadow: '0 10px 40px rgba(255, 215, 0, 0.2)' }} 
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <div className="card-icon">📈</div>
            <Link to="/student/progress" className="card-title" style={{ color: '#ffd700' }}>Progress</Link>
            <p className="card-description">View your course completion and badges</p>
          </motion.div>

          <motion.div 
            className="dashboard-card"
            whileHover={{ scale: 1.03, boxShadow: '0 10px 40px rgba(67, 206, 162, 0.2)' }} 
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <div className="card-icon">🔔</div>
            <Link to="/student/notifications" className="card-title" style={{ color: '#43cea2' }}>Notifications</Link>
            <p className="card-description">See latest announcements and updates</p>
          </motion.div>

          <motion.div 
            className="dashboard-card"
            whileHover={{ scale: 1.03, boxShadow: '0 10px 40px rgba(108, 99, 255, 0.2)' }} 
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <div className="card-icon">👤</div>
            <Link to="/student/profile" className="card-title" style={{ color: '#6c63ff' }}>Profile</Link>
            <p className="card-description">Edit your personal details</p>
          </motion.div>

          <motion.div 
            className="dashboard-card"
            whileHover={{ scale: 1.03, boxShadow: '0 10px 40px rgba(255, 215, 0, 0.2)' }} 
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <div className="card-icon">⚙️</div>
            <Link to="/student/settings" className="card-title" style={{ color: '#ffd700' }}>Settings</Link>
            <p className="card-description">Update password and privacy</p>
          </motion.div>

          <motion.div 
            className="dashboard-card"
            whileHover={{ scale: 1.03, boxShadow: '0 10px 40px rgba(0, 191, 255, 0.2)' }} 
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <div className="card-icon">🤖</div>
            <Link to="/student/smart-quiz" className="card-title" style={{ color: '#00bfff' }}>Smart Quiz</Link>
            <p className="card-description">AI-powered quizzes with instant feedback</p>
          </motion.div>
        </section>
      </main>
      
      <StudentFooter />
    </div>
  );
}
