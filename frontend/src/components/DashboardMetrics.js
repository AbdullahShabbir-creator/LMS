import React from 'react';
import { motion } from 'framer-motion';
import { FaBook, FaUserGraduate, FaDollarSign, FaPlayCircle } from 'react-icons/fa';
import '../styles/dashboard.modern.css';

const metrics = [
  {
    label: 'Total Courses',
    value: 8,
    icon: <FaBook size={28} />,
    color: 'linear-gradient(120deg,#43cea2 60%,#185a9d 100%)'
  },
  {
    label: 'Total Students',
    value: 124,
    icon: <FaUserGraduate size={28} />,
    color: 'linear-gradient(120deg,#ff5858 60%,#f09819 100%)'
  },
  {
    label: 'Total Earnings',
    value: '$2,350',
    icon: <FaDollarSign size={28} />,
    color: 'linear-gradient(120deg,#6a11cb 60%,#2575fc 100%)'
  },
  {
    label: 'Active Courses',
    value: 5,
    icon: <FaPlayCircle size={28} />,
    color: 'linear-gradient(120deg,#ffd700 60%,#232526 100%)'
  }
];

export default function DashboardMetrics() {
  return (
    <div className="dashboard-metrics-row">
      {metrics.map((m, idx) => (
        <motion.div
          className="dashboard-metric-card"
          key={m.label}
          style={{ background: m.color }}
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 + idx * 0.12 }}
          whileHover={{ scale: 1.05, boxShadow: '0 8px 32px #23252633' }}
        >
          <div className="dashboard-metric-icon">{m.icon}</div>
          <div className="dashboard-metric-value">{m.value}</div>
          <div className="dashboard-metric-label">{m.label}</div>
        </motion.div>
      ))}
    </div>
  );
}
