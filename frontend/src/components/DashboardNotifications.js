import React, { useState, useEffect } from 'react';
import '../styles/dashboard.modern.css';
import { toast } from 'react-toastify';
import { authHeader } from '../utils/auth';

export default function DashboardNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Function to fetch notifications
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/notifications', {
          method: 'GET',
          headers: authHeader()
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }
        
        const data = await response.json();
        setNotifications(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications');
        toast.error('Could not load notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="dashboard-notifications">
        <h3>Notifications</h3>
        <div className="dashboard-loading">Loading notifications...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-notifications">
        <h3>Notifications</h3>
        <div className="dashboard-error">{error}</div>
      </div>
    );
  }

  // If no notifications, show a message
  if (notifications.length === 0) {
    return (
      <div className="dashboard-notifications">
        <h3>Notifications</h3>
        <div className="dashboard-no-data">No notifications yet</div>
      </div>
    );
  }

  return (
    <div className="dashboard-notifications">
      <h3>Notifications</h3>
      <ul>
        {notifications.map((notification, idx) => (
          <li key={notification._id || idx} className={notification.read ? 'notification-read' : 'notification-unread'}>
            <span>{notification.message}</span>
            <span className="dashboard-notification-date">{formatDate(notification.date)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
