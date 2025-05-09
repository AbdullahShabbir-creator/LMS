import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUserGraduate, FaEnvelope, FaCalendarAlt, FaBook, FaGraduationCap, FaChartLine, FaStar, FaClock, FaPhoneAlt, FaInfoCircle } from 'react-icons/fa';
import InstructorHeader from '../components/InstructorHeader';
import InstructorFooter from '../components/InstructorFooter';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/instructor.modern.css';
import '../styles/instructorStudents.css';

export default function StudentDetail() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate API call to fetch student details
    setTimeout(() => {
      // Mock data - in a real app this would be fetched from API
      const sampleStudents = [
        { id: 1, name: 'John Doe', email: 'john@example.com', course: 'Web Development', progress: 78, lastActive: '2 days ago', joined: '3 months ago', completedLessons: 18, totalLessons: 24, grade: 'A-', phone: '+1 (555) 123-4567', assignments: [
          { title: 'HTML Structure', score: 95, status: 'Completed', submittedOn: '2 months ago' },
          { title: 'CSS Styling', score: 88, status: 'Completed', submittedOn: '1 month ago' },
          { title: 'JavaScript Basics', score: 75, status: 'Completed', submittedOn: '3 weeks ago' },
          { title: 'Responsive Design', score: 92, status: 'Completed', submittedOn: '2 weeks ago' },
          { title: 'Final Project', score: 0, status: 'Not Started', submittedOn: '' }
        ]},
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', course: 'UI/UX Design', progress: 92, lastActive: '1 day ago', joined: '5 months ago', completedLessons: 22, totalLessons: 25, grade: 'A+', phone: '+1 (555) 987-6543', assignments: [
          { title: 'Design Systems', score: 98, status: 'Completed', submittedOn: '3 months ago' },
          { title: 'User Research', score: 95, status: 'Completed', submittedOn: '2 months ago' },
          { title: 'Wireframing', score: 90, status: 'Completed', submittedOn: '1 month ago' },
          { title: 'Prototyping', score: 92, status: 'Completed', submittedOn: '2 weeks ago' },
          { title: 'Usability Testing', score: 89, status: 'Completed', submittedOn: '1 week ago' }
        ]},
        { id: 3, name: 'Mike Johnson', email: 'mike@example.com', course: 'Web Development', progress: 45, lastActive: '5 days ago', joined: '2 months ago', completedLessons: 8, totalLessons: 24, grade: 'B', phone: '+1 (555) 234-5678', assignments: [
          { title: 'HTML Structure', score: 85, status: 'Completed', submittedOn: '6 weeks ago' },
          { title: 'CSS Styling', score: 72, status: 'Completed', submittedOn: '4 weeks ago' },
          { title: 'JavaScript Basics', score: 0, status: 'In Progress', submittedOn: '' },
          { title: 'Responsive Design', score: 0, status: 'Not Started', submittedOn: '' },
          { title: 'Final Project', score: 0, status: 'Not Started', submittedOn: '' }
        ]},
        { id: 4, name: 'Sarah Williams', email: 'sarah@example.com', course: 'Data Science', progress: 65, lastActive: 'Today', joined: '1 month ago', completedLessons: 12, totalLessons: 20, grade: 'B+', phone: '+1 (555) 345-6789', assignments: [
          { title: 'Python Basics', score: 92, status: 'Completed', submittedOn: '3 weeks ago' },
          { title: 'Data Visualization', score: 85, status: 'Completed', submittedOn: '2 weeks ago' },
          { title: 'Statistical Analysis', score: 78, status: 'Completed', submittedOn: '1 week ago' },
          { title: 'Machine Learning', score: 0, status: 'In Progress', submittedOn: '' },
          { title: 'Final Project', score: 0, status: 'Not Started', submittedOn: '' }
        ]},
        { id: 5, name: 'Alex Thompson', email: 'alex@example.com', course: 'Mobile Development', progress: 88, lastActive: 'Today', joined: '4 months ago', completedLessons: 16, totalLessons: 18, grade: 'A', phone: '+1 (555) 456-7890', assignments: [] },
        { id: 6, name: 'Emily Davis', email: 'emily@example.com', course: 'Data Science', progress: 52, lastActive: '3 days ago', joined: '2 months ago', completedLessons: 7, totalLessons: 20, grade: 'C+', phone: '+1 (555) 567-8901', assignments: [] },
        { id: 7, name: 'Robert Wilson', email: 'robert@example.com', course: 'JavaScript Advanced', progress: 71, lastActive: '1 week ago', joined: '6 months ago', completedLessons: 15, totalLessons: 22, grade: 'B+', phone: '+1 (555) 678-9012', assignments: [] },
        { id: 8, name: 'Emma Brown', email: 'emma@example.com', course: 'UX Research', progress: 95, lastActive: 'Today', joined: '2 months ago', completedLessons: 19, totalLessons: 20, grade: 'A', phone: '+1 (555) 789-0123', assignments: [] },
      ];
      
      const foundStudent = sampleStudents.find(s => s.id === parseInt(studentId));
      setStudent(foundStudent || null);
      setLoading(false);
    }, 800);
  }, [studentId]);

  const handleContactStudent = (email) => {
    toast.info(`Contact functionality for ${email} will be implemented soon!`);
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
                onClick={() => navigate('/instructor/students')}
              >
                <FaArrowLeft /> <span>Back to Students</span>
              </button>
              <h3>Student Profile</h3>
            </div>
            
            <div className="sidebar-section">
              <h4>Quick Actions</h4>
              <div className="filter-options">
                <button 
                  className="filter-btn"
                  onClick={() => student && handleContactStudent(student.email)}
                >
                  <FaEnvelope style={{marginRight: '8px'}} /> Contact Student
                </button>
                <button 
                  className="filter-btn"
                  onClick={() => toast.info('Grading functionality coming soon!')}
                >
                  <FaStar style={{marginRight: '8px'}} /> Grade Assignments
                </button>
                <button 
                  className="filter-btn"
                  onClick={() => toast.info('Analytics functionality coming soon!')}
                >
                  <FaChartLine style={{marginRight: '8px'}} /> View Analytics
                </button>
              </div>
            </div>
            
            {student && (
              <div className="sidebar-section">
                <h4>Student Info</h4>
                <div className="student-info-list">
                  <div className="sidebar-info-item">
                    <FaEnvelope />
                    <span>{student.email}</span>
                  </div>
                  {student.phone && (
                    <div className="sidebar-info-item">
                      <FaPhoneAlt />
                      <span>{student.phone}</span>
                    </div>
                  )}
                  <div className="sidebar-info-item">
                    <FaCalendarAlt />
                    <span>Joined: {student.joined}</span>
                  </div>
                  <div className="sidebar-info-item">
                    <FaClock />
                    <span>Last active: {student.lastActive}</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
          
          {/* Main Content */}
          <div className="main-content">
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading student details...</p>
              </div>
            ) : student ? (
              <motion.div 
                className="student-detail-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <motion.div 
                  className="page-title"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h1>{student.name}</h1>
                  <p>Student Profile for {student.course}</p>
                </motion.div>
                
                <div className="student-profile-card">
                  <div className="student-details-grid">
                    <div className="detail-card">
                      <div className="detail-icon">
                        <FaChartLine />
                      </div>
                      <div className="detail-content">
                        <h3>Progress</h3>
                        <div className="progress-container large">
                          <div className="progress-label">
                            <span>Course Completion</span>
                            <span>{student.progress}%</span>
                          </div>
                          <div className="progress-bar">
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
                        </div>
                        <p>Completed {student.completedLessons} of {student.totalLessons} lessons</p>
                      </div>
                    </div>

                    <div className="detail-card">
                      <div className="detail-icon">
                        <FaGraduationCap />
                      </div>
                      <div className="detail-content">
                        <h3>Performance</h3>
                        <div className="grade-display">
                          <span className="grade">{student.grade}</span>
                        </div>
                        <p>Current course grade</p>
                      </div>
                    </div>

                    <div className="detail-card">
                      <div className="detail-icon">
                        <FaBook />
                      </div>
                      <div className="detail-content">
                        <h3>Course Details</h3>
                        <p><strong>Course:</strong> {student.course}</p>
                        <p><strong>Total Lessons:</strong> {student.totalLessons}</p>
                        <p><strong>Completion Rate:</strong> {Math.round((student.completedLessons / student.totalLessons) * 100)}%</p>
                      </div>
                    </div>
                    
                    <div className="detail-card">
                      <div className="detail-icon">
                        <FaInfoCircle />
                      </div>
                      <div className="detail-content">
                        <h3>Status Overview</h3>
                        <div className="status-overview">
                          <div className="status-item">
                            <div className="status-label">Activity Level</div>
                            <div className={`status-value ${student.lastActive === 'Today' || student.lastActive?.includes('day') ? 'active' : 'inactive'}`}>
                              {student.lastActive === 'Today' || student.lastActive?.includes('day') ? 'Active' : 'Inactive'}
                            </div>
                          </div>
                          <div className="status-item">
                            <div className="status-label">Current Status</div>
                            <div className={`status-value ${student.progress >= 70 ? 'good' : student.progress >= 40 ? 'average' : 'poor'}`}>
                              {student.progress >= 70 ? 'On Track' : student.progress >= 40 ? 'Needs Attention' : 'At Risk'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {student.assignments && student.assignments.length > 0 && (
                    <div className="student-assignments">
                      <h3>Assignment History</h3>
                      <div className="assignments-table-wrapper">
                        <table className="assignments-table">
                          <thead>
                            <tr>
                              <th>Assignment</th>
                              <th>Status</th>
                              <th>Score</th>
                              <th>Submitted</th>
                            </tr>
                          </thead>
                          <tbody>
                            {student.assignments.map((assignment, index) => (
                              <tr key={index} className={assignment.status.toLowerCase().replace(' ', '-')}>
                                <td>{assignment.title}</td>
                                <td>
                                  <span className={`status-badge ${assignment.status.toLowerCase().replace(' ', '-')}`}>
                                    {assignment.status}
                                  </span>
                                </td>
                                <td>{assignment.status === 'Completed' ? `${assignment.score}%` : '-'}</td>
                                <td>{assignment.submittedOn || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="action-buttons-container">
                  <button 
                    className="details-btn"
                    onClick={() => toast.info('Reports functionality coming soon!')}
                  >
                    Generate Report
                  </button>
                  <button 
                    className="contact-btn"
                    onClick={() => handleContactStudent(student.email)}
                  >
                    <FaEnvelope /> Contact Student
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="no-results">
                <FaUserGraduate className="no-results-icon" />
                <p>Student not found</p>
                <button 
                  className="clear-filter-button"
                  onClick={() => navigate('/instructor/students')}
                >
                  Return to Students List
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