import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes, FaHome, FaChalkboardTeacher, FaCog, FaSignOutAlt, FaVideo } from 'react-icons/fa';
import LMS3DLogo from './LMS3DLogo';
import '../styles/instructor.modern.css';

const navLinks = [
  { label: 'Home', path: '/instructor/home', icon: <FaHome /> },
  { label: 'Leactures', path: '/instructor/leactures', icon: <FaChalkboardTeacher /> },
  { label: 'Free Lectures', path: '/instructor/free-lectures', icon: <FaVideo /> },
  { label: 'Dashboard', path: '/instructor/dashboard', icon: <FaChalkboardTeacher /> },
  { label: 'Settings', path: '/instructor/settings', icon: <FaCog /> },
];

export default function InstructorHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    localStorage.removeItem('user');
    navigate('/');
  }

  return (
    <header className="instructor-header glassy-header">
      <div className="header-content">
        <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
          <LMS3DLogo size={48} />
          <span className="lms-header-title" style={{ fontWeight: 700, fontSize: '1.5rem', color: '#fff', letterSpacing: '0.03em', fontFamily: 'Poppins, Urbanist, DM Sans, sans-serif', textShadow: '0 2px 12px #23252699', display: 'flex', alignItems: 'center' }}>YourLMS</span>
        </div>
        <nav className={`header-nav ${menuOpen ? 'open' : ''}`}>
          {navLinks.map((link, idx) => (
            <motion.div
              key={link.label}
              className={`nav-link${location.pathname === link.path ? ' active' : ''}`}
              whileHover={{ scale: 1.08, color: '#ffd700' }}
              onClick={() => {
                navigate(link.path);
              }}
              tabIndex={0}
              style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontWeight: 500, fontSize: 18, padding: '7px 16px', borderRadius: 8, transition: 'background 0.2s' }}
            >
              {link.icon}
              <span>{link.label}</span>
            </motion.div>
          ))}
          <motion.div
            whileHover={{ scale: 1.13, color: '#e74c3c' }}
            className="nav-link logout-link"
            onClick={() => { setMenuOpen(false); handleLogout(); }}
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </motion.div>
        </nav>
        <button className="menu-toggle" onClick={() => setMenuOpen(v => !v)}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-nav-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </header>
  );
}
