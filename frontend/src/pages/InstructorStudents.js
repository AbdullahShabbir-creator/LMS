import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import InstructorHeader from '../components/InstructorHeader';
import InstructorFooter from '../components/InstructorFooter';
import { FaUserGraduate, FaEnvelope, FaSearch, FaFilter, FaArrowLeft, FaStar, FaCalendarAlt, FaGraduationCap, FaEllipsisV, FaChartLine } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/instructor.modern.css';
import '../styles/instructorStudents.css';

export default function InstructorStudents() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [activeStudent, setActiveStudent] = useState(null);

  // Sample data - replace with actual API call
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const sampleStudents = [
        { id: 1, name: 'John Doe', email: 'john@example.com', course: 'Web Development', progress: 78, lastActive: '2 days ago', joined: '3 months ago', completedLessons: 18, totalLessons: 24, grade: 'A-' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', course: 'UI/UX Design', progress: 92, lastActive: '1 day ago', joined: '5 months ago', completedLessons: 22, totalLessons: 25, grade: 'A+' },
        { id: 3, name: 'Mike Johnson', email: 'mike@example.com', course: 'Web Development', progress: 45, lastActive: '5 days ago', joined: '2 months ago', completedLessons: 8, totalLessons: 24, grade: 'B' },
        { id: 4, name: 'Sarah Williams', email: 'sarah@example.com', course: 'Data Science', progress: 65, lastActive: 'Today', joined: '1 month ago', completedLessons: 12, totalLessons: 20, grade: 'B+' },
        { id: 5, name: 'Alex Thompson', email: 'alex@example.com', course: 'Mobile Development', progress: 88, lastActive: 'Today', joined: '4 months ago', completedLessons: 16, totalLessons: 18, grade: 'A' },
        { id: 6, name: 'Emily Davis', email: 'emily@example.com', course: 'Data Science', progress: 52, lastActive: '3 days ago', joined: '2 months ago', completedLessons: 7, totalLessons: 20, grade: 'C+' },
        { id: 7, name: 'Robert Wilson', email: 'robert@example.com', course: 'JavaScript Advanced', progress: 71, lastActive: '1 week ago', joined: '6 months ago', completedLessons: 15, totalLessons: 22, grade: 'B+' },
        { id: 8, name: 'Emma Brown', email: 'emma@example.com', course: 'UX Research', progress: 95, lastActive: 'Today', joined: '2 months ago', completedLessons: 19, totalLessons: 20, grade: 'A' },
      ];
      setStudents(sampleStudents);
      setLoading(false);
    }, 800);
  }, []);

  // Filtered and sorted students
  const filteredStudents = useMemo(() => {
    return students
      .filter(student => {
        // Search term matching - case insensitive
        const nameMatch = student.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const emailMatch = student.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const courseMatch = student.course?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesSearch = nameMatch || emailMatch || courseMatch;
        
        // Filter by activity status
        if (filter === 'all') return matchesSearch;
        if (filter === 'active' && (student.lastActive === 'Today' || student.lastActive?.includes('day'))) return matchesSearch;
        if (filter === 'inactive' && student.lastActive && !student.lastActive.includes('day') && student.lastActive !== 'Today') return matchesSearch;
        
        return false;
      })
      .sort((a, b) => {
        // Sort based on selected criteria
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'progress') return b.progress - a.progress;
        if (sortBy === 'activity') {
          if (a.lastActive === 'Today' && b.lastActive !== 'Today') return -1;
          if (b.lastActive === 'Today' && a.lastActive !== 'Today') return 1;
          if (a.lastActive?.includes('day') && !b.lastActive?.includes('day')) return -1;
          if (b.lastActive?.includes('day') && !a.lastActive?.includes('day')) return 1;
          return 0;
        }
        return 0;
      });
  }, [students, searchTerm, filter, sortBy]);

  const handleContactStudent = (email) => {
    toast.info(`Contact functionality for ${email} will be implemented soon!`);
  };

  const handleViewDetails = (id) => {
    navigate(`/instructor/students/${id}`);
  };

  const handleToggleStudentMenu = (id) => {
    setActiveStudent(activeStudent === id ? null : id);
  };

  return (
    <div className="instructor-page-root">
      <InstructorHeader />
      <main className="instructor-page-container">
        <div className="dashboard-container">
          {/* Sidebar */}
          <motion.div 
            className="sidebar"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="sidebar-header">
              <button 
                className="back-button-modern"
                onClick={() => navigate('/instructor')}
              >
                <FaArrowLeft /> <span>Dashboard</span>
              </button>
              <h3>Manage Students</h3>
            </div>
            
            <div className="sidebar-section">
              <h4>Filter By</h4>
              <div className="filter-options">
                <button 
                  className={`filter-btn ${filter === 'all' ? 'active' : ''}`} 
                  onClick={() => setFilter('all')}
                >
                  All Students
                </button>
                <button 
                  className={`filter-btn ${filter === 'active' ? 'active' : ''}`} 
                  onClick={() => setFilter('active')}
                >
                  Recently Active
                </button>
                <button 
                  className={`filter-btn ${filter === 'inactive' ? 'active' : ''}`} 
                  onClick={() => setFilter('inactive')}
                >
                  Inactive
                </button>
              </div>
            </div>
            
            <div className="sidebar-section">
              <h4>Sort By</h4>
              <div className="filter-options">
                <button 
                  className={`filter-btn ${sortBy === 'name' ? 'active' : ''}`} 
                  onClick={() => setSortBy('name')}
                >
                  Name
                </button>
                <button 
                  className={`filter-btn ${sortBy === 'progress' ? 'active' : ''}`} 
                  onClick={() => setSortBy('progress')}
                >
                  Progress
                </button>
                <button 
                  className={`filter-btn ${sortBy === 'activity' ? 'active' : ''}`} 
                  onClick={() => setSortBy('activity')}
                >
                  Recent Activity
                </button>
              </div>
            </div>
          </motion.div>
          
          {/* Main Content */}
          <div className="main-content">
            <motion.div 
              className="page-title"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1>Your Students</h1>
              <p>View and manage students enrolled in your courses</p>
            </motion.div>
            
            <motion.div 
              className="search-bar-container"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="search-wrapper">
                <FaSearch className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search by name, email or course..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Search students"
                />
              </div>
              <div className="search-results-info">
                {searchTerm ? (
                  <p>Found {filteredStudents.length} {filteredStudents.length === 1 ? 'student' : 'students'}</p>
                ) : (
                  <p>Showing {filteredStudents.length} {filteredStudents.length === 1 ? 'student' : 'students'}</p>
                )}
              </div>
            </motion.div>
            
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading students...</p>
              </div>
            ) : filteredStudents.length > 0 ? (
              <div className="students-modern-grid">
                {filteredStudents.map((student, index) => (
                  <motion.div 
                    key={student.id}
                    className="student-modern-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(0.05 * index, 0.5) }}
                    whileHover={{ y: -5, boxShadow: '0 8px 30px rgba(108, 99, 255, 0.2)' }}
                  >
                    <div className="student-card-header">
                      <div className="student-avatar">
                        <div className="avatar-circle">
                          <FaUserGraduate />
                        </div>
                        <div className="student-name-container">
                          <h3>{student.name}</h3>
                          <span className="course-tag">{student.course}</span>
                        </div>
                      </div>
                      <div className="action-menu">
                        <button 
                          className="menu-button"
                          onClick={() => handleToggleStudentMenu(student.id)}
                          aria-label="Student options"
                        >
                          <FaEllipsisV />
                        </button>
                        {activeStudent === student.id && (
                          <div className="menu-dropdown">
                            <button onClick={() => handleViewDetails(student.id)}>
                              View Profile
                            </button>
                            <button onClick={() => handleContactStudent(student.email)}>
                              Contact
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="student-card-body">
                      <div className="stat-row">
                        <div className="stat-item">
                          <FaChartLine className="stat-icon" />
                          <div className="stat-text">
                            <span className="stat-label">Progress</span>
                            <span className="stat-value">{student.progress}%</span>
                          </div>
                        </div>
                        <div className="stat-item">
                          <FaGraduationCap className="stat-icon" />
                          <div className="stat-text">
                            <span className="stat-label">Grade</span>
                            <span className="stat-value">{student.grade}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="progress-container">
                        <div 
                          className="progress-fill" 
                          style={{ 
                            width: `${student.progress}%`,
                            background: student.progress > 80 
                              ? 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)' 
                              : student.progress > 50 
                                ? 'linear-gradient(90deg, #ffb347 0%, #ffcc33 100%)' 
                                : 'linear-gradient(90deg, #ff6b6b 0%, #ff8e8e 100%)'
                          }}
                        ></div>
                      </div>
                      
                      <div className="student-meta">
                        <div className="meta-item">
                          <FaCalendarAlt />
                          <span>Last active: {student.lastActive}</span>
                        </div>
                        <div className="lessons-info">
                          <span>{student.completedLessons}/{student.totalLessons} lessons</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="student-card-footer">
                      <button 
                        className="contact-btn"
                        onClick={() => handleContactStudent(student.email)}
                      >
                        <FaEnvelope /> Contact
                      </button>
                      <button 
                        className="details-btn"
                        onClick={() => handleViewDetails(student.id)}
                      >
                        View Details
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="no-results">
                <FaUserGraduate className="no-results-icon" />
                <p>No students match your search criteria</p>
                <button 
                  className="clear-filter-button"
                  onClick={() => {
                    setSearchTerm('');
                    setFilter('all');
                  }}
                  aria-label="Clear search filters"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      <InstructorFooter />
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar newestOnTop />
    </div>
  );
} 