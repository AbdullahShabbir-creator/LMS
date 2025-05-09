import React, { useEffect, useState } from 'react';
import StudentHeader from '../components/StudentHeader';
import StudentFooter from '../components/StudentFooter';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { FaBell, FaCheckCircle, FaInfoCircle, FaClock, FaChalkboardTeacher } from 'react-icons/fa';
import useAuth from '../hooks/useAuth';
import { getToken as getAuthToken } from '../utils/auth';
import axios from 'axios';

// Enhanced mock notifications with more details and instructor information
const DUMMY_NOTIFICATIONS = [
  { 
    _id: 'dummy1', 
    message: 'Welcome to your dashboard! Start exploring your courses.',
    date: '2025-04-29T10:15:00Z', 
    read: false,
    type: 'system',
    priority: 'normal',
    course: null,
    sender: { name: 'System', role: 'system' } 
  },
  { 
    _id: 'dummy2', 
    message: 'Your course progress in "React Fundamentals" has been updated. You\'ve completed 75% of the course.',
    date: '2025-04-28T14:30:00Z', 
    read: false,
    type: 'progress',
    priority: 'normal',
    course: { id: 'course1', title: 'React Fundamentals' },
    sender: { name: 'System', role: 'system' } 
  },
  { 
    _id: 'dummy3', 
    message: 'New assignment available in React Basics: "Building Your First Component". Please submit by next week.',
    date: '2025-04-27T09:45:00Z', 
    read: true,
    type: 'assignment',
    priority: 'high',
    course: { id: 'course1', title: 'React Fundamentals' },
    sender: { name: 'John Smith', role: 'instructor', avatar: 'https://source.unsplash.com/random/100x100/?portrait' } 
  },
  { 
    _id: 'dummy4', 
    message: 'IMPORTANT: The deadline for the Node.js project has been extended by 3 days. Take your time to perfect your work!',
    date: '2025-04-26T16:20:00Z', 
    read: false,
    type: 'announcement',
    priority: 'high',
    course: { id: 'course2', title: 'Node.js API Development' },
    sender: { name: 'Emily Chen', role: 'instructor', avatar: 'https://source.unsplash.com/random/100x100/?woman' } 
  },
  { 
    _id: 'dummy5', 
    message: 'Your recent quiz in "Python for Data Science" scored 85%. Great job! Review the feedback in your course area.',
    date: '2025-04-25T11:10:00Z', 
    read: true,
    type: 'grade',
    priority: 'normal',
    course: { id: 'course3', title: 'Python for Data Science' },
    sender: { name: 'Alex Johnson', role: 'instructor', avatar: 'https://source.unsplash.com/random/100x100/?man' } 
  },
  { 
    _id: 'dummy6', 
    message: 'Live session reminder: Join us tomorrow at 3 PM for "React State Management Deep Dive" with guest speaker Sarah from Facebook.',
    date: '2025-04-24T09:00:00Z', 
    read: false,
    type: 'event',
    priority: 'normal',
    course: { id: 'course1', title: 'React Fundamentals' },
    sender: { name: 'John Smith', role: 'instructor', avatar: 'https://source.unsplash.com/random/100x100/?portrait' } 
  }
];

export default function StudentNotifications() {
  const { user, loading: authLoading } = useAuth('student');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [detailsVisible, setDetailsVisible] = useState({});

  useEffect(() => {
    if (!authLoading) {
      const fetchNotifications = async () => {
        try {
          const token = getAuthToken();
          if (!token) return;
          
          const res = await axios.get('/api/student/notifications', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (res.status === 200 && res.data && Array.isArray(res.data)) {
            // Process and enhance real notifications if they exist
            const enhancedData = processNotifications(res.data);
            setNotifications(enhancedData.length > 0 ? enhancedData : DUMMY_NOTIFICATIONS);
          } else {
            // Fall back to dummy data
            setNotifications(DUMMY_NOTIFICATIONS);
          }
        } catch (error) {
          console.error('Error fetching notifications:', error);
          setNotifications(DUMMY_NOTIFICATIONS);
        } finally {
          setLoading(false);
        }
      };
      
      fetchNotifications();
    }
  }, [authLoading]);

  // Process real notifications to ensure they have all required fields
  const processNotifications = (notifications) => {
    return notifications.map(notification => {
      // Ensure all notifications have necessary properties
      return {
        ...notification,
        type: notification.type || detectType(notification.message),
        priority: notification.priority || 'normal',
        date: notification.date || notification.timestamp || notification.createdAt || new Date().toISOString(),
        read: !!notification.read
      };
    });
  };

  // Helper to detect notification type from message
  const detectType = (message) => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('assignment') || lowerMessage.includes('submit')) return 'assignment';
    if (lowerMessage.includes('grade') || lowerMessage.includes('score')) return 'grade';
    if (lowerMessage.includes('live') || lowerMessage.includes('session')) return 'event';
    if (lowerMessage.includes('important') || lowerMessage.includes('deadline')) return 'announcement';
    if (lowerMessage.includes('progress') || lowerMessage.includes('completed')) return 'progress';
    return 'system';
  };

  const markAsRead = async (id) => {
    if (id.startsWith('dummy')) {
      setNotifications(notifications => notifications.map(n => n._id === id ? { ...n, read: true } : n));
      return;
    }
    
    try {
      const token = getAuthToken();
      if (!token) return;
      
      const res = await axios.patch(`/api/student/notifications/${id}/read`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (res.status === 200) {
        setNotifications(notifications => notifications.map(n => n._id === id ? { ...n, read: true } : n));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const toggleDetails = (id) => {
    setDetailsVisible(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter notifications based on selection
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  // Sort notifications - newest first
  const sortedNotifications = [...filteredNotifications].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'assignment': return '📝';
      case 'grade': return '🎯';
      case 'event': return '📅';
      case 'announcement': return '📢';
      case 'progress': return '📊';
      default: return '🔔';
    }
  };

  // Format relative time
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return format(date, 'MMM d, yyyy');
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f6faff', display: 'flex', flexDirection: 'column' }}>
        <StudentHeader showMain showPrevious />
        <main style={{ flex: 1, maxWidth: 800, margin: '0 auto', padding: '36px 16px 24px 16px' }}>
          <div style={{ textAlign: 'center', color: '#aaa', fontWeight: 600, marginTop: 60 }}>
            <div className="loading-spinner" style={{ marginBottom: 20 }}></div>
            Loading notifications...
          </div>
        </main>
        <div style={{ marginTop: 'auto' }}>
          <StudentFooter />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f6faff', display: 'flex', flexDirection: 'column' }}>
      <StudentHeader showMain showPrevious />
      <main style={{ flex: 1, maxWidth: 800, margin: '0 auto', padding: '36px 16px 24px 16px' }}>
        <motion.div
          className="notifications-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            marginBottom: 32 
          }}
        >
          <motion.h1
            style={{
              fontWeight: 900,
              fontSize: '2.1rem',
              marginBottom: 8,
              background: 'linear-gradient(90deg,#43cea2 0%,#185a9d 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textAlign: 'center',
              letterSpacing: 1.2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12
            }}
          >
            <FaBell size={28} style={{ color: '#43cea2' }} />
            Notifications
          </motion.h1>
          <div style={{ 
            color: '#666', 
            marginBottom: 24, 
            fontSize: 15, 
            fontWeight: 500 
          }}>
            Stay updated with course announcements and messages from instructors
          </div>
          
          <div className="filter-tabs" style={{ 
            display: 'flex', 
            gap: 8, 
            flexWrap: 'wrap',
            justifyContent: 'center',
            width: '100%',
            marginBottom: 16
          }}>
            {['all', 'unread', 'announcement', 'assignment', 'grade', 'event', 'progress'].map(filterOption => (
              <button 
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                style={{
                  background: filter === filterOption ? 'linear-gradient(90deg,#43cea2 0%,#185a9d 100%)' : '#fff',
                  color: filter === filterOption ? '#fff' : '#444',
                  border: 'none',
                  borderRadius: 20,
                  padding: '6px 14px',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                {filterOption === 'all' ? 'All' : 
                 filterOption === 'unread' ? 'Unread' : 
                 filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#aaa', fontWeight: 600 }}>Loading notifications...</div>
        ) : sortedNotifications.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            color: '#aaa', 
            fontWeight: 600,
            background: '#fff',
            padding: 24,
            borderRadius: 12,
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}>
            <FaInfoCircle size={24} style={{ marginBottom: 8 }} />
            <div>No notifications in this category</div>
          </div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {sortedNotifications.map((notification, idx) => (
              <motion.li
                key={notification._id || idx}
                style={{
                  background: notification.read ? '#f9f9f9' : '#fff',
                  borderLeft: notification.priority === 'high' ? '6px solid #ff7675' : 
                             notification.read ? '6px solid #43cea2' : '6px solid #185a9d',
                  borderRadius: 14,
                  boxShadow: notification.read ? '0 1px 6px rgba(0,0,0,0.05)' : '0 3px 12px rgba(0,0,0,0.1)',
                  marginBottom: 16,
                  padding: '16px 18px',
                  fontWeight: notification.read ? 500 : 600,
                  color: notification.read ? '#555' : '#232526',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  opacity: notification.read ? 0.85 : 1,
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => {
                  toggleDetails(notification._id || idx);
                  if (!notification.read) {
                    markAsRead(notification._id);
                  }
                }}
              >
                {/* Notification header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ 
                      fontSize: 20, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: notification.read ? '#f0f0f0' : '#eafaf1',
                      marginRight: 4
                    }}>
                      {getNotificationIcon(notification.type)}
                    </span>
                    {notification.priority === 'high' && (
                      <span style={{ 
                        color: '#fff', 
                        background: '#ff7675', 
                        fontSize: 12, 
                        padding: '2px 8px', 
                        borderRadius: 12,
                        fontWeight: 700
                      }}>
                        IMPORTANT
                      </span>
                    )}
                    {notification.course && (
                      <span style={{ 
                        fontSize: 13, 
                        color: '#43cea2', 
                        fontWeight: 600 
                      }}>
                        {notification.course.title}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ 
                      color: '#999', 
                      fontSize: 13, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 4 
                    }}>
                      <FaClock size={12} />
                      {formatRelativeTime(notification.date)}
                    </span>
                    {notification.read && (
                      <FaCheckCircle size={14} style={{ color: '#43cea2' }} />
                    )}
                  </div>
                </div>
                
                {/* Notification message */}
                <div style={{ 
                  fontSize: 15,
                  lineHeight: 1.5, 
                  marginTop: 4, 
                  marginBottom: 4,
                  whiteSpace: 'pre-line'
                }}>
                  {notification.message}
                </div>
                
                {/* Notification details */}
                {notification.sender && (detailsVisible[notification._id || idx]) && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                    style={{ 
                      marginTop: 8, 
                      display: 'flex', 
                      alignItems: 'center',
                      padding: '8px 10px',
                      background: '#f0f8ff',
                      borderRadius: 8,
                      fontSize: 13
                    }}
                  >
                    {notification.sender.role === 'instructor' ? (
                      <>
                        {notification.sender.avatar ? (
                          <img 
                            src={notification.sender.avatar} 
                            alt={notification.sender.name}
                            style={{ 
                              width: 28, 
                              height: 28, 
                              borderRadius: '50%',
                              marginRight: 8
                            }}
                          />
                        ) : (
                          <FaChalkboardTeacher size={18} style={{ marginRight: 8, color: '#185a9d' }} />
                        )}
                        <div>
                          <span style={{ fontWeight: 600 }}>From: {notification.sender.name}</span>
                          <span style={{ marginLeft: 8, color: '#43cea2', fontWeight: 500 }}>Instructor</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <FaInfoCircle size={18} style={{ marginRight: 8, color: '#43cea2' }} />
                        <div>
                          <span style={{ fontWeight: 600 }}>System Notification</span>
                          <span style={{ marginLeft: 8, color: '#999' }}>
                            {format(new Date(notification.date), 'MMM d, yyyy - h:mm a')}
                          </span>
                        </div>
                      </>
                    )}
                    
                    {!notification.read && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification._id);
                        }}
                        style={{
                          marginLeft: 'auto',
                          background: '#43cea2',
                          color: 'white',
                          border: 'none',
                          borderRadius: 20,
                          padding: '3px 12px',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Mark as Read
                      </button>
                    )}
                  </motion.div>
                )}
              </motion.li>
            ))}
          </ul>
        )}
      </main>
      <div style={{ marginTop: 'auto' }}>
        <StudentFooter />
      </div>
      
      <style jsx="true">{`
        .loading-spinner {
          display: inline-block;
          width: 30px;
          height: 30px;
          border: 3px solid rgba(67, 206, 162, 0.3);
          border-radius: 50%;
          border-top-color: #43cea2;
          animation: spin 1s ease-in-out infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
