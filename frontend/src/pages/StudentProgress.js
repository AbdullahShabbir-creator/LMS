import React, { useEffect, useState } from 'react';
import StudentHeader from '../components/StudentHeader';
import StudentFooter from '../components/StudentFooter';
import '../pages/StudentExploreCourses.css';
import './StudentProgress.css';
import { motion } from 'framer-motion';
import ProgressDetailsModal from '../components/ProgressDetailsModal';
import useAuth from '../hooks/useAuth';
import { getToken as getAuthToken } from '../utils/auth';
import { FaSearch, FaBookOpen, FaChartLine, FaCalendarAlt, FaClock, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

export default function StudentProgress() {
  const { user, loading: authLoading } = useAuth('student');
  const [progressData, setProgressData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProgress, setSelectedProgress] = useState(null);

  // Fetch progress data from API
  useEffect(() => {
    if (!authLoading) {
      const fetchProgressData = async () => {
        setLoading(true);
        try {
          const token = getAuthToken();
          if (!token) {
            setError('Authentication error. Please login again.');
            setLoading(false);
            return;
          }
          
          // Simulate API call with mock data
          if (process.env.NODE_ENV === 'development') {
            // Mock data for development
            setTimeout(() => {
              const mockProgressData = [
                {
                  courseId: 'course1',
                  courseTitle: 'React JS Fundamentals',
                  category: 'Web Development',
                  completed: 8,
                  total: 10,
                  percent: 80,
                  lastLesson: 'React Hooks',
                  lastAccessed: '2023-05-10',
                  daysActive: 14
                },
                {
                  courseId: 'course2',
                  courseTitle: 'Python for Data Science',
                  category: 'Programming',
                  completed: 5,
                  total: 12,
                  percent: 42,
                  lastLesson: 'Pandas DataFrame',
                  lastAccessed: '2023-05-12',
                  daysActive: 10
                },
                {
                  courseId: 'course3',
                  courseTitle: 'UI/UX Design Principles',
                  category: 'Design',
                  completed: 3,
                  total: 8,
                  percent: 38,
                  lastLesson: 'User Research',
                  lastAccessed: '2023-05-08',
                  daysActive: 6
                }
              ];
              setProgressData(mockProgressData);
              setLoading(false);
            }, 800);
          } else {
            // Replace with actual API call in production
            const response = await fetch('/api/student/progress', {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (!response.ok) {
              throw new Error('Failed to fetch progress data');
            }
            
            const data = await response.json();
            setProgressData(data);
            setLoading(false);
          }
        } catch (err) {
          console.error('Error fetching progress:', err);
          setError(err.message || 'Failed to load progress data');
          setLoading(false);
        }
      };
      
      fetchProgressData();
    }
  }, [authLoading]);

  // Get unique categories
  const categories = ['all', ...new Set(progressData.map(item => item.category))];

  // Filter progress data based on selected category and search query
  const displayProgress = progressData.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.lastLesson.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
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
      
      <div className="progress-content-container">
        <main className="progress-main">
          <div className="progress-hero">
            <motion.div 
              className="progress-hero-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="progress-title">Your Learning Journey</h1>
              <p className="progress-subtitle">Track your progress across all courses and pick up where you left off</p>
            </motion.div>
          </div>
          
          <div className="progress-dashboard">
            <div className="progress-controls">
              <div className="progress-search-wrapper">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search courses or lessons..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="progress-search-input"
                />
              </div>
              
              <div className="progress-filter-tabs">
                {categories.map(category => (
                  <button
                    key={category}
                    className={`progress-filter-btn ${selectedCategory === category ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            {authLoading || loading ? (
              <div className="progress-loading-container">
                <div className="progress-loader"></div>
                <p>Loading your progress data...</p>
              </div>
            ) : error ? (
              <div className="progress-error-container">
                <p>{error}</p>
                <button className="progress-retry-btn" onClick={() => window.location.reload()}>
                  Retry
                </button>
              </div>
            ) : (
              <div className="progress-cards-grid">
                {displayProgress.length === 0 ? (
                  <div className="progress-empty-state">
                    <FaBookOpen className="empty-icon" />
                    <h3>No courses found</h3>
                    <p>Try changing your search criteria or explore new courses</p>
                  </div>
                ) : (
                  displayProgress.map((item, idx) => (
                    <motion.div
                      key={item.courseId || item._id || idx}
                      className="progress-card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05, duration: 0.3 }}
                      onClick={() => handleCardClick(item)}
                      whileHover={{ 
                        y: -8,
                        boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1), 0 8px 12px rgba(67, 206, 162, 0.15)'
                      }}
                    >
                      <div className="progress-card-badge" style={{ backgroundColor: getBadgeColor(item.percent) }}>
                        {item.percent}%
                      </div>
                      
                      <div className="progress-card-header">
                        <div className="progress-course-icon" style={{ background: `linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%)` }}>
                          {item.courseTitle ? item.courseTitle[0] : 'C'}
                        </div>
                        <div className="progress-card-title-container">
                          <h3 className="progress-card-title">{item.courseTitle || item.title}</h3>
                          <span className="progress-card-category">{item.category}</span>
                        </div>
                      </div>
                      
                      <div className="progress-info">
                        <div className="progress-card-stat">
                          <FaBookOpen className="progress-stat-icon" />
                          <div className="progress-stat-text">
                            <span>{item.completed} of {item.total} lessons</span>
                          </div>
                        </div>
                        <div className="progress-card-stat">
                          <FaClock className="progress-stat-icon" />
                          <div className="progress-stat-text">
                            <span>Last: {item.lastLesson}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="progress-bar-container">
                        <div className="progress-bar">
                          <div className="progress-bar-fill" style={{ width: `${item.percent}%` }}></div>
                        </div>
                        <div className="progress-milestones">
                          <div className="milestone" style={{ left: '25%', background: item.percent >= 25 ? getBadgeColor(item.percent) : '#ddd' }}></div>
                          <div className="milestone" style={{ left: '50%', background: item.percent >= 50 ? getBadgeColor(item.percent) : '#ddd' }}></div>
                          <div className="milestone" style={{ left: '75%', background: item.percent >= 75 ? getBadgeColor(item.percent) : '#ddd' }}></div>
                          <div className="milestone" style={{ left: '100%', transform: 'translateX(-100%)', background: item.percent >= 100 ? getBadgeColor(item.percent) : '#ddd' }}></div>
                        </div>
                      </div>
                      
                      <div className="progress-card-footer">
                        <div className="progress-card-stat small">
                          <FaCalendarAlt className="progress-stat-icon small" />
                          <span>Last access: {new Date(item.lastAccessed).toLocaleDateString()}</span>
                        </div>
                        <div className="progress-card-stat small">
                          <FaChartLine className="progress-stat-icon small" />
                          <span>{item.daysActive} days active</span>
                        </div>
                      </div>
                      
                      <div className="progress-card-action">
                        <span>View Details</span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </div>
        </main>
      
        {selectedProgress && (
          <ProgressDetailsModal
            progress={selectedProgress}
            onClose={() => setSelectedProgress(null)}
          />
        )}
      </div>
      
      <div id="progress-footer" className="fixed-footer">
        <StudentFooter />
      </div>
      
      <style jsx="true">{`
        :root {
          --primary-color: #43cea2;
          --accent-color: #185a9d;
          --text-primary: #232526;
          --text-secondary: #555;
          --text-light: #888;
          --background-light: #f6faff;
          --card-background: #fff;
          --progress-excellent: #4caf50;
          --progress-good: #2196f3;
          --progress-moderate: #ff9800;
          --progress-beginner: #ff5722;
        }

        .progress-page-wrapper {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--background-light);
        }

        .progress-content-container {
          flex: 1 0 auto;
          padding-bottom: 60px; /* Space for footer */
        }

        .progress-main {
          width: 100%;
        }

        /* Hero section */
        .progress-hero {
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%);
          padding: 3rem 2rem;
          color: white;
          text-align: center;
          border-radius: 0 0 30px 30px;
          box-shadow: 0 4px 20px rgba(24, 90, 157, 0.2);
        }

        .progress-hero-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .progress-title {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          letter-spacing: 1px;
        }

        .progress-subtitle {
          font-size: 1.1rem;
          opacity: 0.9;
          max-width: 600px;
          margin: 0 auto;
        }

        /* Dashboard section */
        .progress-dashboard {
          padding: 2rem;
          margin-top: -40px;
          position: relative;
          z-index: 10;
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
          width: 100%;
        }

        /* Controls */
        .progress-controls {
          background: white;
          border-radius: 15px;
          padding: 1.5rem;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
          margin-bottom: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .progress-search-wrapper {
          position: relative;
          width: 100%;
        }

        .search-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-light);
        }

        .progress-search-input {
          width: 100%;
          padding: 1rem 1rem 1rem 2.5rem;
          border: 1px solid #e0e0e0;
          border-radius: 10px;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .progress-search-input:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(67, 206, 162, 0.2);
          outline: none;
        }

        .progress-filter-tabs {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-top: 0.5rem;
        }

        .progress-filter-btn {
          padding: 0.5rem 1rem;
          border: none;
          background: #f0f0f0;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          color: var(--text-secondary);
        }

        .progress-filter-btn:hover {
          background: #e0e0e0;
        }

        .progress-filter-btn.active {
          background: linear-gradient(90deg, var(--primary-color) 0%, var(--accent-color) 100%);
          color: white;
        }

        /* Progress Cards Grid */
        .progress-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
          width: 100%;
        }

        /* Progress Card */
        .progress-card {
          background: var(--card-background);
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          padding: 1.5rem;
          position: relative;
          transition: all 0.3s ease;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .progress-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 25px rgba(0, 0, 0, 0.1);
        }

        .progress-card-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: var(--primary-color);
          color: white;
          font-weight: bold;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.9rem;
        }

        .progress-card-header {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .progress-course-icon {
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          color: white;
          font-size: 1.5rem;
          font-weight: bold;
          flex-shrink: 0;
        }

        .progress-card-title-container {
          flex: 1;
        }

        .progress-card-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 0.25rem 0;
        }

        .progress-card-category {
          font-size: 0.85rem;
          color: var(--primary-color);
          font-weight: 600;
        }

        .progress-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .progress-card-stat {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--text-secondary);
          font-size: 0.95rem;
        }

        .progress-card-stat.small {
          font-size: 0.85rem;
          color: var(--text-light);
        }

        .progress-stat-icon {
          color: var(--accent-color);
          flex-shrink: 0;
        }

        .progress-stat-icon.small {
          color: var(--text-light);
          font-size: 0.85rem;
        }

        .progress-stat-text {
          display: flex;
          flex-direction: column;
        }

        .progress-bar-container {
          margin: 0.5rem 0;
        }

        .progress-bar {
          height: 8px;
          background: #f0f0f0;
          border-radius: 4px;
          overflow: hidden;
          position: relative;
        }

        .progress-bar-fill {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
          border-radius: 4px;
          transition: width 1s ease;
        }

        .progress-milestones {
          position: relative;
          margin-top: 5px;
          height: 5px;
        }

        .milestone {
          position: absolute;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #ddd;
          top: -2.5px;
          transform: translateX(-50%);
        }

        .progress-card-footer {
          display: flex;
          justify-content: space-between;
          margin-top: auto;
          padding-top: 0.5rem;
          border-top: 1px solid #f0f0f0;
        }

        .progress-card-action {
          background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
          color: white;
          padding: 0.5rem;
          border-radius: 8px;
          text-align: center;
          font-weight: 600;
          margin-top: 0.5rem;
          transition: all 0.2s ease;
        }

        .progress-card-action:hover {
          opacity: 0.9;
          transform: scale(1.02);
        }

        /* Loading & Empty States */
        .progress-loading-container,
        .progress-error-container,
        .progress-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          background: white;
          border-radius: 15px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          text-align: center;
          grid-column: 1 / -1;
        }

        .progress-loader {
          width: 50px;
          height: 50px;
          border: 5px solid rgba(67, 206, 162, 0.2);
          border-top-color: var(--primary-color);
          border-radius: 50%;
          animation: spin 1s infinite linear;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .progress-retry-btn {
          margin-top: 1rem;
          padding: 0.5rem 1.5rem;
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .progress-retry-btn:hover {
          background: var(--accent-color);
        }

        .empty-icon {
          font-size: 3rem;
          color: var(--text-light);
          margin-bottom: 1rem;
        }

        /* Footer styles */
        .fixed-footer {
          flex-shrink: 0;
          width: 100%;
          z-index: 100;
          background: white;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .progress-hero {
            padding: 2rem 1rem;
          }
          
          .progress-title {
            font-size: 1.8rem;
          }
          
          .progress-subtitle {
            font-size: 1rem;
          }
          
          .progress-dashboard {
            padding: 1rem;
            margin-top: -30px;
          }
          
          .progress-cards-grid {
            grid-template-columns: 1fr;
          }
          
          .progress-card {
            padding: 1.25rem;
          }
        }

        @media (min-width: 769px) and (max-width: 1024px) {
          .progress-cards-grid {
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          }
        }

        @media (max-width: 576px) {
          .progress-card-footer {
            flex-direction: column;
            gap: 0.5rem;
          }
          
          .progress-dashboard {
            padding: 1rem 0.5rem;
          }
          
          .progress-controls {
            padding: 1rem;
          }
          
          .progress-title {
            font-size: 1.5rem;
          }
          
          .progress-subtitle {
            font-size: 0.9rem;
          }
          
          .progress-filter-tabs {
            justify-content: center;
          }
        }
        
        @media (max-width: 390px) {
          .progress-hero {
            padding: 1.5rem 0.75rem;
          }
          
          .progress-title {
            font-size: 1.3rem;
          }
          
          .progress-subtitle {
            font-size: 0.85rem;
          }
          
          .progress-card {
            padding: 1rem;
          }
          
          .progress-card-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .progress-course-icon {
            margin-bottom: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}
