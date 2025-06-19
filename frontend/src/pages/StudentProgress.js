import React, { useEffect, useState } from 'react';
import StudentHeader from '../components/StudentHeader';
import StudentFooter from '../components/StudentFooter';
import '../pages/StudentExploreCourses.css';

import { motion } from 'framer-motion';
import ProgressDetailsModal from '../components/ProgressDetailsModal';
import useAuth from '../hooks/useAuth';
import { getToken as getAuthToken } from '../utils/auth';
import { getAllProgress } from '../services/api';
import { FaSearch, FaBookOpen, FaChartLine, FaCalendarAlt, FaClock, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import './StudentProgress.css'
export default function StudentProgress() {
  const { user, loading: authLoading } = useAuth('student');
  const [progressData, setProgressData] = useState([]);
    const [courses, setCourses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProgress, setSelectedProgress] = useState(null);

  // Fetch progress data from API
  useEffect(() => {
    async function fetchProgress() {
      const result = await getAllProgress();
      console.log(result)
      if (result.error) {
        setError(result.error);
      } else {
        setProgressData(result);
      }
      setLoading(false);
    }

    fetchProgress();
  }, []);
  // Get unique categories
  const categories = ['all', ...new Set(progressData.map(item => item.category))];
//console.log(categories)
  // Filter progress data based on selected category and search query
  const displayProgress = progressData.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.lastLesson.toLowerCase().includes(searchQuery.toLowerCase());
    return  matchesSearch;
  });

  const handleCardClick = (progress) => {
    setSelectedProgress(progress);
  };

  // Get appropriate badge color based on progress percentage
  const getBadgeColor = (percent) => {
    if (percent >= 80) return 'var(--progress-excellent)';
    if (percent >= 50) return 'var(--progress-good)';
    if (percent >= 30) return 'var(--progress-moderate)';
    return 'var(--progress-beginner)';
  };

  return (
    <div className="progress-page-wrapper">
      <StudentHeader showPrevious={true} />
      
  <div className="progress-cards-grid">
  {displayProgress?.map((item, idx) => {
    const {
      courseId,
     title,
      percent,
      category,
      completed,
      totalLectures,
      lastLesson,
      lastAccessed,
      daysActive,
    } = item;

    return (
      <motion.div
        key={courseId || idx}
        className="progress-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.05, duration: 0.3 }}
        onClick={() => handleCardClick(item)}
        whileHover={{
          y: -8,
          boxShadow:
            '0 15px 30px rgba(0, 0, 0, 0.1), 0 8px 12px rgba(67, 206, 162, 0.15)',
        }}
      >
        {/* card content here */}
        <div className="progress-card-badge" style={{ backgroundColor: getBadgeColor(percent) }}>
          {percent}%
        </div>
        <div className="progress-card-header">
          <div
            className="progress-course-icon"
            style={{
              background: `linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%)`,
            }}
          >
            {title[0]}
          </div>
          <div className="progress-card-title-container">
            <h3 className="progress-card-title">{title}</h3>
    
          </div>
        </div>
        <div className="progress-info">
          <div className="progress-card-stat">
            <FaBookOpen className="progress-stat-icon" />
            <div className="progress-stat-text">
              <span>
                {completed} of {totalLectures} lessons
              </span>
            </div>
          </div>
          <div className="progress-card-stat">
    
            <div className="progress-stat-text">
                     <p>{category}</p>
            </div>
          </div>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${percent}%` }}></div>
          </div>
        <div className="progress-milestones">
  {[20, 40, 60, 80, 100].map((milestone, index) => (
    <div
      key={index}
      className="milestone"
      style={{
        left: `${milestone}%`,
        transform: milestone === 100 ? 'translateX(-100%)' : 'translateX(-50%)',
        background: percent >= milestone ? getBadgeColor(percent) : '#ddd',
      }}
    ></div>
  ))}
</div>

        </div>
        <div className="progress-card-footer">
          <div className="progress-card-stat small">
            <FaCalendarAlt className="progress-stat-icon small" />
            <span>Last access: {new Date(lastAccessed).toLocaleDateString()}</span>
          </div>
          <div className="progress-card-stat small">
            <FaChartLine className="progress-stat-icon small" />
            <span>{daysActive} days active</span>
          </div>
        </div>
        <div className="progress-card-action">
          <span>View Details</span>
        </div>
      </motion.div>
    );
  })}
</div>


      
      <div id="progress-footer" className="fixed-footer">
        <StudentFooter />
      </div>
      
      
    </div>
  );
}
