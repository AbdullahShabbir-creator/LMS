import React from 'react';
import { FaUserGraduate, FaChalkboardTeacher, FaBook, FaThLarge, FaStar, FaMoneyBill, FaCog, FaSignOutAlt, FaLayerGroup, FaBars, FaUsers } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './AdminSidebar.css';

const menuItems = [
  { label: 'Dashboard', icon: <FaThLarge />, path: '/admin' },
  { label: 'Manage Users', icon: <FaUsers />, path: '/admin/users' },
  { label: 'Logout', icon: <FaSignOutAlt />, path: '/logout' },
];

export default function AdminSidebar({ active, onMenuSelect, onLogout, isMobile, isTablet, isOpen, onToggle }) {
  return (
    <>
      <motion.button 
        className="sidebar-toggle-btn"
        onClick={onToggle}
        whileHover={{ scale: 1.1, rotate: isOpen ? 90 : 0 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      >
        <FaBars />
      </motion.button>
      <motion.div
        className={`admin-sidebar ${isOpen ? 'open' : ''} ${isMobile ? 'mobile' : isTablet ? 'tablet' : ''}`}
        initial={{ x: 320, opacity: 0 }}
        animate={{ 
          x: isOpen ? 0 : 320, 
          opacity: isOpen ? 1 : 0.7,
          boxShadow: isOpen ? '0 0 40px rgba(0, 0, 0, 0.25)' : 'none'
        }}
        transition={{ duration: 0.3, type: 'spring', stiffness: 280, damping: 30 }}
        style={{ right: 0, left: 'unset', position: 'fixed' }}
      >
        <motion.div 
          className="sidebar-logo"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <span className="logo-text">LMS Admin</span>
        </motion.div>
        
        <ul className="sidebar-menu">
          {menuItems.map((item, idx) => (
            <motion.li
              key={item.label}
              className={active === idx ? 'active' : ''}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                delay: 0.1 + idx * 0.05, 
                duration: 0.3,
                type: 'spring',
                stiffness: 280,
                damping: 24
              }}
              whileHover={{ 
                scale: 1.03, 
                translateX: 5,
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                boxShadow: '0 6px 15px rgba(0, 0, 0, 0.15)',
                color: '#ffffff'
              }}
              onClick={() => {
                if (item.label === 'Logout') onLogout();
                else onMenuSelect(idx);
              }}
            >
              <span className="sidebar-icon">{item.icon}</span> 
              <span className="sidebar-label">{item.label}</span>
              {active === idx && (
                <motion.span 
                  className="active-indicator"
                  layoutId="activeIndicator" 
                  transition={{ type: 'spring', stiffness: 280, damping: 20 }}
                />
              )}
            </motion.li>
          ))}
        </ul>
        
        <motion.div 
          className="sidebar-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.3 }}
        >
          <p>LMS Admin v1.0</p>
        </motion.div>
      </motion.div>
    </>
  );
}
