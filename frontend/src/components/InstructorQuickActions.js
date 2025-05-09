import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaBookOpen, FaChartBar, FaCloudUploadAlt, FaUserGraduate, FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../styles/instructor.modern.css';

export default function InstructorQuickActions() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ courses: 0, earnings: 0, students: 0 });
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    // Example API call for instructor stats
    fetch('/api/instructor/stats', {
      headers: { Authorization: `Bearer ${localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : ''}` }
    })
      .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch stats'))
      .then(data => setStats(data))
      .catch(() => setStats({ courses: 0, earnings: 0, students: 0 }));
  }, []);

  const actions = [
    {
      icon: <FaBookOpen />,
      title: 'Manage Your Courses',
      desc: `You have ${stats.courses} courses. See, Edit, or Create new Courses`,
      cta: 'Go to Courses',
      to: '/instructor/courses',
      gradient: 'linear-gradient(135deg, #6c63ff 0%, #a18cd1 100%)',
      hoverGradient: 'linear-gradient(135deg, #a18cd1 0%, #6c63ff 100%)',
    },
    {
      icon: <FaChartBar />,
      title: 'View Analytics',
      desc: `Track earnings, enrollments and student engagement`,
      cta: 'View Analytics',
      to: '/instructor/analytics',
      gradient: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)',
      hoverGradient: 'linear-gradient(135deg, #185a9d 0%, #43cea2 100%)',
    },
    {
      icon: <FaCloudUploadAlt />,
      title: 'Upload New Lectures',
      desc: 'Bulk upload videos easily',
      cta: 'Upload Now',
      to: '/instructor/upload',
      gradient: 'linear-gradient(135deg, #ff6f61 0%, #ffd700 100%)',
      hoverGradient: 'linear-gradient(135deg, #ffd700 0%, #ff6f61 100%)',
    },
    {
      icon: <FaUserGraduate />,
      title: 'Manage Students',
      desc: `You have ${stats.students} enrolled students. Check & contact them`,
      cta: 'View Students',
      to: '/instructor/students',
      gradient: 'linear-gradient(135deg, #00bfff 0%, #6c63ff 100%)',
      hoverGradient: 'linear-gradient(135deg, #6c63ff 0%, #00bfff 100%)',
    },
  ];

  return (
    <section className="instructor-quick-actions">
      <motion.h2 
        className="quick-actions-title"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Quick Actions
      </motion.h2>
      <div className="quick-actions-grid">
        {actions.map((action, i) => (
          <motion.div
            key={action.title}
            className="quick-action-card"
            style={{
              background: hoveredCard === i ? action.hoverGradient : action.gradient,
              boxShadow: hoveredCard === i 
                ? '0 10px 30px rgba(108, 99, 255, 0.4), 0 0 20px rgba(255, 255, 255, 0.1) inset' 
                : '0 8px 20px rgba(0, 0, 0, 0.15)'
            }}
            whileHover={{ 
              scale: 1.05, 
              y: -10,
              transition: { type: 'spring', stiffness: 300 }
            }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i, duration: 0.5 }}
            onClick={() => navigate(action.to)}
            onMouseEnter={() => setHoveredCard(i)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <motion.div 
              className="quick-action-icon"
              animate={{ 
                rotate: hoveredCard === i ? [0, 15, 0, -15, 0] : 0,
                scale: hoveredCard === i ? [1, 1.2, 1] : 1
              }}
              transition={{ duration: 0.5, repeat: hoveredCard === i ? Infinity : 0, repeatDelay: 1 }}
            >
              {action.icon}
            </motion.div>
            <div className="quick-action-content">
              <h3 className="quick-action-title">{action.title}</h3>
              <p className="quick-action-desc">{action.desc}</p>
              <motion.button 
                className="quick-action-btn"
                whileHover={{ 
                  scale: 1.1,
                  boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)'
                }}
                whileTap={{ scale: 0.95 }}
              >
                <span>{action.cta}</span>
                <FaArrowRight className="arrow-icon" />
              </motion.button>
            </div>
            <div className="card-shine"></div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
