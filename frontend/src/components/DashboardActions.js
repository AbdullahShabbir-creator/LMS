import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/dashboard.modern.css';

export default function DashboardActions() {
  const navigate = useNavigate();
  return (
    <div className="dashboard-actions">
      <button className="dashboard-action-btn" onClick={() => navigate('/instructor/courses')}>Create New Course</button>
      <button className="dashboard-action-btn" onClick={() => navigate('/instructor/notifications')}>Send Notification</button>
      <button className="dashboard-action-btn" onClick={() => navigate('/instructor/report')}>View Reports</button>
    </div>
  );
}
