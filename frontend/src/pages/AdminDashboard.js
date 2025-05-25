import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import AdminNavbar from '../components/AdminNavbar';
import { motion } from 'framer-motion';
import { FaUsers, FaChalkboardTeacher, FaBook, FaDollarSign } from 'react-icons/fa';
import { getUser, logout } from '../utils/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import useMediaQuery from '../utils/useMediaQuery';
import ThreeBallsBackground from '../components/ThreeBallsBackground';
import './AdminDashboard.css';
import './AdminDashboard.modern.css';

export default function AdminDashboard({ activeTab }) {
  const [summaryCards, setSummaryCards] = React.useState([
    { label: 'Students', value: 'Loading...', icon: <FaUsers /> },
    { label: 'Instructors', value: 'Loading...', icon: <FaChalkboardTeacher /> },
    { label: 'Revenue', value: '$0', icon: <FaDollarSign /> },
  ]);

  React.useEffect(() => {
    // Fetch student count
    const fetchStudentCount = async () => {
      try {
        console.log('Fetching student count...');
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/auth/students/count', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include'
        });
        
        const responseData = await response.json().catch(e => ({}));
        console.log('Student count response:', responseData);
        
        if (response.ok && responseData.success) {
          setSummaryCards(prevCards => {
            const newCards = [...prevCards];
            const studentIndex = newCards.findIndex(card => card.label === 'Students');
            if (studentIndex !== -1) {
              newCards[studentIndex] = { ...newCards[studentIndex], value: responseData.count };
            }
            return newCards;
          });
        }
      } catch (error) {
        console.error('Error fetching student count:', error);
      }
    };

    // Fetch instructor count
    const fetchInstructorCount = async () => {
      try {
        console.log('Fetching instructor count...');
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/auth/instructors/count', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include'
        });
        
        const responseData = await response.json().catch(e => ({}));
        console.log('Instructor count response:', responseData);
        
        if (response.ok && responseData.success) {
          setSummaryCards(prevCards => {
            const newCards = [...prevCards];
            const instructorIndex = newCards.findIndex(card => card.label === 'Instructors');
            if (instructorIndex !== -1) {
              newCards[instructorIndex] = { ...newCards[instructorIndex], value: responseData.count };
            }
            return newCards;
          });
        }
      } catch (error) {
        console.error('Error fetching instructor count:', error);
      }
    };

    fetchStudentCount();
    fetchInstructorCount();
  }, []);
  const [activeMenu, setActiveMenu] = useState(activeTab || 0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width: 600px)');
  const isTablet = useMediaQuery('(max-width: 900px)');

  // Close sidebar by default on mobile/tablet
  useEffect(() => {
    setSidebarOpen(!(isMobile || isTablet));
  }, [isMobile, isTablet]);

  useEffect(() => {
    // Set active menu based on URL path
    if (activeTab !== undefined) {
      setActiveMenu(activeTab);
    } else {
      const path = location.pathname;
      if (path.includes("/admin/students")) setActiveMenu(1);
      else if (path.includes("/admin/instructors")) setActiveMenu(2);
      else if (path.includes("/admin/courses")) setActiveMenu(3);
      else if (path.includes("/admin/categories")) setActiveMenu(4);
      else if (path.includes("/admin/reviews")) setActiveMenu(5);
      else if (path.includes("/admin/payments")) setActiveMenu(6);
      else if (path.includes("/admin/settings")) setActiveMenu(7);
      else setActiveMenu(0);
    }
  }, [activeTab, location.pathname]);

  useEffect(() => {
    const user = getUser();
    if (!user || user.role !== 'admin') {
      logout();
      navigate('/login');
    }
  }, [navigate]);

  function handleLogout() {
    logout();
    window.location.href = '/';
  }

  function handleMenuSelect(index) {
    setActiveMenu(index);
    if (isMobile || isTablet) {
      setSidebarOpen(false);
    }
    
    switch(index) {
      case 0: navigate('/admin'); break;
      case 1: navigate('/admin/students'); break;
      case 2: navigate('/admin/instructors'); break;
      case 3: navigate('/admin/courses'); break;
      case 4: navigate('/admin/categories'); break;
      case 5: navigate('/admin/reviews'); break;
      case 6: navigate('/admin/payments'); break;
      case 7: navigate('/admin/settings'); break;
      default: navigate('/admin');
    }
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="admin-dashboard-modern-layout">
      <AdminSidebar 
        active={activeMenu} 
        onMenuSelect={handleMenuSelect} 
        onLogout={handleLogout} 
        isMobile={isMobile} 
        isTablet={isTablet}
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
      />
      <div className="modern-main-content">
        <AdminNavbar adminName="Admin" isMobile={isMobile} isTablet={isTablet} onMenuToggle={toggleSidebar} />
        <div className="modern-dashboard-header">
          <h1 className="modern-dashboard-title">
            {activeMenu === 0 && "Admin Home"}
            {activeMenu === 1 && "Manage Students"}
            {activeMenu === 2 && "Manage Instructors"}
            {activeMenu === 3 && "Manage Courses"}
            {activeMenu === 4 && "Manage Categories"}
            {activeMenu === 5 && "Manage Reviews"}
            {activeMenu === 6 && "Manage Payments"}
            {activeMenu === 7 && "Settings"}
          </h1>
          <span className="modern-dashboard-desc">
            {activeMenu === 0 && "Welcome to your modern LMS admin panel. Manage users, instructors, courses, and more with real-time insights."}
            {activeMenu === 1 && "View and manage all student accounts, track activities, and control access permissions."}
            {activeMenu === 2 && "Manage instructor profiles, review qualifications, and monitor course creation."}
            {activeMenu === 3 && "Browse all courses, manage content, and review course materials."}
            {activeMenu === 4 && "Create and manage course categories to organize the learning platform."}
            {activeMenu === 5 && "Monitor student reviews and ratings for courses and instructors."}
            {activeMenu === 6 && "Review payment transactions and manage financial operations."}
            {activeMenu === 7 && "Configure system settings, appearance, and platform behavior."}
          </span>
        </div>
        
        {/* Only show summary cards on main dashboard */}
        {activeMenu === 0 && (
          <div className="modern-summary-row">
            {summaryCards.map((card, i) => (
              <motion.div
                className="modern-summary-card"
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.3 }}
              >
                <span className="modern-summary-icon">{card.icon}</span>
                <span className="modern-summary-value">{card.value}</span>
                <span className="modern-summary-label">{card.label}</span>
              </motion.div>
            ))}
          </div>
        )}
        
        {activeMenu === 0 && (
          <div className="modern-dashboard-grid">
            <div className="modern-dashboard-section modern-chart-section">
              <h2>Growth Analytics</h2>
              <React.Suspense fallback={<div>Loading charts...</div>}>
                {React.createElement(require('../components/AdminDashboardCharts').default)}
              </React.Suspense>
            </div>
            {/* Modern Manage Students Card (only show in dashboard overview) */}
            <div className="dashboard-below-section">
              <div className="dashboard-below-card">
                <div className="dashboard-below-title">Manage Students</div>
                <div className="dashboard-below-search">
                  <input type="text" placeholder="Search by name or email..." />
                </div>
                <div className="dashboard-below-error">Failed to fetch students</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Render specific page content based on activeMenu */}
        {activeMenu === 1 && (
          <React.Suspense fallback={<div className="loading-spinner">Loading students...</div>}>
            {React.createElement(require('./AdminStudents').default)}
          </React.Suspense>
        )}
        {activeMenu === 2 && (
          <React.Suspense fallback={<div className="loading-spinner">Loading instructors...</div>}>
            {React.createElement(require('./AdminInstructors').default)}
          </React.Suspense>
        )}
        {activeMenu === 3 && (
          <React.Suspense fallback={<div className="loading-spinner">Loading courses...</div>}>
            {React.createElement(require('./AdminCourses').default)}
          </React.Suspense>
        )}
        {activeMenu === 4 && (
          <React.Suspense fallback={<div className="loading-spinner">Loading categories...</div>}>
            {React.createElement(require('./AdminCategories').default)}
          </React.Suspense>
        )}
        {activeMenu === 5 && (
          <React.Suspense fallback={<div className="loading-spinner">Loading reviews...</div>}>
            <AdminReviews />
          </React.Suspense>
        )}
        {activeMenu === 6 && (
          <React.Suspense fallback={<div className="loading-spinner">Loading payments...</div>}>
            <AdminPayments />
          </React.Suspense>
        )}
        {activeMenu === 7 && (
          <React.Suspense fallback={<div className="loading-spinner">Loading settings...</div>}>
            <AdminSettings />
          </React.Suspense>
        )}
      </div>
      
      {/* 3D Animated Background */}
      <ThreeBallsBackground />
    </div>
  );
}

// Admin Reviews Component
function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function fetchReviews() {
      try {
        setLoading(true);
        const user = getUser();
        const res = await fetch('/api/reviews', {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch reviews');
        const data = await res.json();
        setReviews(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, []);

  async function handleApprove(id) {
    try {
      const user = getUser();
      const res = await fetch(`/api/reviews/${id}/approve`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (!res.ok) throw new Error('Failed to approve review');
      setReviews(reviews => reviews.map(r => r._id === id ? { ...r, status: 'approved' } : r));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id) {
    try {
      const user = getUser();
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (!res.ok) throw new Error('Failed to delete review');
      setReviews(reviews => reviews.filter(r => r._id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  // Demo data for UI display - replace with actual API data
  const demoReviews = [
    { _id: '1', courseTitle: 'Introduction to React', studentName: 'John Smith', rating: 4.5, comment: 'Great course!', status: 'pending' },
    { _id: '2', courseTitle: 'Advanced JavaScript', studentName: 'Sarah Jones', rating: 5, comment: 'Amazing content and instructor', status: 'approved' },
    { _id: '3', courseTitle: 'Web Development Bootcamp', studentName: 'Michael Brown', rating: 3, comment: 'Good but could be better', status: 'pending' },
  ];

  return (
    <motion.div 
      className="admin-reviews-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="admin-section-header">
        <h2>Course Reviews Management</h2>
        <p>Review and approve student feedback for courses</p>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading reviews...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="reviews-table-container">
          <table className="reviews-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Student</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Use real data when available, fallback to demo data */}
              {(reviews.length > 0 ? reviews : demoReviews).map(review => (
                <motion.tr 
                  key={review._id}
                  whileHover={{ backgroundColor: '#f0f7ff', scale: 1.01 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <td>{review.courseTitle}</td>
                  <td>{review.studentName}</td>
                  <td>⭐ {review.rating}</td>
                  <td>{review.comment}</td>
                  <td>
                    <span className={`status-badge ${review.status}`}>
                      {review.status === 'approved' ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    {review.status !== 'approved' && (
                      <motion.button
                        className="approve-btn"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleApprove(review._id)}
                      >
                        Approve
                      </motion.button>
                    )}
                    <motion.button
                      className="delete-btn"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(review._id)}
                    >
                      Delete
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}

// Admin Payments Component
function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function fetchPayments() {
      try {
        setLoading(true);
        const user = getUser();
        const res = await fetch('/api/payments', {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch payments');
        const data = await res.json();
        setPayments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPayments();
  }, []);

  async function handleApprove(id) {
    try {
      const user = getUser();
      const res = await fetch(`/api/payments/${id}/approve`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (!res.ok) throw new Error('Failed to approve payment');
      setPayments(payments => payments.map(p => p._id === id ? { ...p, status: 'approved' } : p));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleReject(id) {
    try {
      const user = getUser();
      const res = await fetch(`/api/payments/${id}/reject`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (!res.ok) throw new Error('Failed to reject payment');
      setPayments(payments => payments.map(p => p._id === id ? { ...p, status: 'rejected' } : p));
    } catch (err) {
      console.error(err);
    }
  }

  // Demo data for UI display - replace with actual API data
  const demoPayments = [
    { _id: '1', courseTitle: 'Web Development Bootcamp', studentName: 'John Smith', amount: 49.99, paymentMethod: 'JazzCash', reference: 'JC12345678', status: 'pending', date: '2023-05-15' },
    { _id: '2', courseTitle: 'Advanced JavaScript', studentName: 'Sarah Jones', amount: 29.99, paymentMethod: 'MeezanBank', reference: 'MB98765432', status: 'approved', date: '2023-05-14' },
    { _id: '3', courseTitle: 'React Native Masterclass', studentName: 'Michael Brown', amount: 59.99, paymentMethod: 'JazzCash', reference: 'JC87654321', status: 'rejected', date: '2023-05-13' },
  ];

  return (
    <motion.div 
      className="admin-payments-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="admin-section-header">
        <h2>Payment Transactions</h2>
        <p>Review and manage student payments for courses</p>
      </div>

      <div className="admin-cards-summary">
        <motion.div 
          className="admin-summary-card"
          whileHover={{ y: -10 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <h3>Total Revenue</h3>
          <p className="large-text">$14,587.00</p>
          <p className="text-success">+12.5% from last month</p>
        </motion.div>

        <motion.div 
          className="admin-summary-card"
          whileHover={{ y: -10 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <h3>Pending Approvals</h3>
          <p className="large-text">23</p>
          <p className="text-warning">Requires attention</p>
        </motion.div>

        <motion.div 
          className="admin-summary-card"
          whileHover={{ y: -10 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <h3>Completed Payments</h3>
          <p className="large-text">187</p>
          <p className="text-success">96% success rate</p>
        </motion.div>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading payment data...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="payments-table-container">
          <table className="payments-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Course</th>
                <th>Student</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Reference</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Use real data when available, fallback to demo data */}
              {(payments.length > 0 ? payments : demoPayments).map(payment => (
                <motion.tr 
                  key={payment._id}
                  whileHover={{ backgroundColor: '#f0f7ff', scale: 1.01 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <td>{payment.date}</td>
                  <td>{payment.courseTitle}</td>
                  <td>{payment.studentName}</td>
                  <td>${payment.amount}</td>
                  <td>{payment.paymentMethod}</td>
                  <td>{payment.reference}</td>
                  <td>
                    <span className={`status-badge ${payment.status}`}>
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    {payment.status === 'pending' && (
                      <>
                        <motion.button
                          className="approve-btn"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleApprove(payment._id)}
                        >
                          Approve
                        </motion.button>
                        <motion.button
                          className="reject-btn"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleReject(payment._id)}
                        >
                          Reject
                        </motion.button>
                      </>
                    )}
                    {payment.status !== 'pending' && (
                      <span className="completed-action">Processed</span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}

// Admin Settings Component
function AdminSettings() {
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Modern LMS',
    siteDescription: 'Advanced Learning Management System',
    maintenanceMode: false,
    allowRegistration: true,
    defaultUserRole: 'student',
    maxUploadSize: 50,
    enableDarkMode: false
  });
  
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.example.com',
    smtpPort: 587,
    smtpUsername: 'admin@example.com',
    enableEmailNotifications: true,
    emailSignature: 'The LMS Team'
  });

  function handleGeneralChange(e) {
    const { name, value, type, checked } = e.target;
    setGeneralSettings({
      ...generalSettings,
      [name]: type === 'checkbox' ? checked : value
    });
  }

  function handleEmailChange(e) {
    const { name, value, type, checked } = e.target;
    setEmailSettings({
      ...emailSettings,
      [name]: type === 'checkbox' ? checked : value
    });
  }

  async function handleSaveSettings() {
    try {
      const user = getUser();
      // Combine all settings
      const settings = {
        ...generalSettings,
        ...emailSettings
      };
      
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}` 
        },
        body: JSON.stringify(settings)
      });
      
      if (!res.ok) throw new Error('Failed to save settings');
      alert('Settings saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save settings: ' + err.message);
    }
  }

  return (
    <motion.div 
      className="admin-settings-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="admin-section-header">
        <h2>System Settings</h2>
        <p>Configure your LMS platform settings</p>
      </div>

      <div className="settings-tabs">
        <div className="settings-tab active">General</div>
        <div className="settings-tab">Email</div>
        <div className="settings-tab">Theme</div>
        <div className="settings-tab">Security</div>
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <h3>General Settings</h3>
          
          <div className="settings-form-group">
            <label>Site Name</label>
            <input 
              type="text" 
              name="siteName" 
              value={generalSettings.siteName} 
              onChange={handleGeneralChange}
            />
          </div>
          
          <div className="settings-form-group">
            <label>Site Description</label>
            <textarea 
              name="siteDescription" 
              value={generalSettings.siteDescription} 
              onChange={handleGeneralChange}
            />
          </div>
          
          <div className="settings-form-group">
            <label>Default User Role</label>
            <select 
              name="defaultUserRole" 
              value={generalSettings.defaultUserRole} 
              onChange={handleGeneralChange}
            >
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
            </select>
          </div>
          
          <div className="settings-form-group">
            <label>Max Upload Size (MB)</label>
            <input 
              type="number" 
              name="maxUploadSize" 
              value={generalSettings.maxUploadSize} 
              onChange={handleGeneralChange}
            />
          </div>
          
          <div className="settings-form-group checkbox">
            <input 
              type="checkbox" 
              id="maintenanceMode" 
              name="maintenanceMode" 
              checked={generalSettings.maintenanceMode} 
              onChange={handleGeneralChange}
            />
            <label htmlFor="maintenanceMode">Enable Maintenance Mode</label>
          </div>
          
          <div className="settings-form-group checkbox">
            <input 
              type="checkbox" 
              id="allowRegistration" 
              name="allowRegistration" 
              checked={generalSettings.allowRegistration} 
              onChange={handleGeneralChange}
            />
            <label htmlFor="allowRegistration">Allow New Registrations</label>
          </div>
          
          <div className="settings-form-group checkbox">
            <input 
              type="checkbox" 
              id="enableDarkMode" 
              name="enableDarkMode" 
              checked={generalSettings.enableDarkMode} 
              onChange={handleGeneralChange}
            />
            <label htmlFor="enableDarkMode">Enable Dark Mode by Default</label>
          </div>
        </div>
        
        <div className="settings-section">
          <h3>Email Settings</h3>
          
          <div className="settings-form-group">
            <label>SMTP Host</label>
            <input 
              type="text" 
              name="smtpHost" 
              value={emailSettings.smtpHost} 
              onChange={handleEmailChange}
            />
          </div>
          
          <div className="settings-form-group">
            <label>SMTP Port</label>
            <input 
              type="number" 
              name="smtpPort" 
              value={emailSettings.smtpPort} 
              onChange={handleEmailChange}
            />
          </div>
          
          <div className="settings-form-group">
            <label>SMTP Username</label>
            <input 
              type="text" 
              name="smtpUsername" 
              value={emailSettings.smtpUsername} 
              onChange={handleEmailChange}
            />
          </div>
          
          <div className="settings-form-group">
            <label>Email Signature</label>
            <textarea 
              name="emailSignature" 
              value={emailSettings.emailSignature} 
              onChange={handleEmailChange}
            />
          </div>
          
          <div className="settings-form-group checkbox">
            <input 
              type="checkbox" 
              id="enableEmailNotifications" 
              name="enableEmailNotifications" 
              checked={emailSettings.enableEmailNotifications} 
              onChange={handleEmailChange}
            />
            <label htmlFor="enableEmailNotifications">Enable Email Notifications</label>
          </div>
        </div>
        
        <motion.button 
          className="save-settings-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSaveSettings}
        >
          Save Settings
        </motion.button>
      </div>
    </motion.div>
  );
}
