import React, { useEffect, useRef, useState } from 'react';
import { FaBell, FaUser, FaCog, FaSignOutAlt, FaSearch, FaBars, FaTimes, FaPalette, FaMoon, FaSun, 
  FaEnvelope, FaShieldAlt, FaWrench, FaTachometerAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './AdminNavbar.css';

// Import a real logo - you can replace this with your actual logo file
import logoImg from '../assets/logo.png.jpeg';

export default function AdminNavbar({ adminName, isMobile, isTablet, onMenuToggle }) {
  const navRef = useRef();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const searchInputRef = useRef(null);
  
  // Close all dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        searchOpen && 
        !event.target.closest('.search-container') && 
        !event.target.closest('.navbar-icon')
      ) {
        setSearchOpen(false);
      }
      
      if (
        notificationsOpen && 
        !event.target.closest('.notifications-dropdown') && 
        !event.target.closest('.navbar-icon')
      ) {
        setNotificationsOpen(false);
      }
      
      if (
        settingsOpen && 
        !event.target.closest('.settings-dropdown') && 
        !event.target.closest('.navbar-icon')
      ) {
        setSettingsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchOpen, notificationsOpen, settingsOpen]);
  
  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);
  
  // Scroll behavior for navbar
  useEffect(() => {
    let lastScroll = window.scrollY;
    function handleScroll() {
      const current = window.scrollY;
      if (navRef.current) {
        if (current > lastScroll && current > 60) {
          navRef.current.style.transform = 'translateY(-100%)';
        } else {
          navRef.current.style.transform = 'translateY(0)';
        }
      }
      lastScroll = current;
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function handleLogout() {
    localStorage.removeItem('user');
    navigate('/');
  }
  
  function handleSearchSubmit(e) {
    e.preventDefault();
    const searchTerm = searchInputRef.current.value;
    if (searchTerm.trim()) {
      // Implement search functionality here
      alert(`Searching for: ${searchTerm}`);
      setSearchOpen(false);
    }
  }
  
  function toggleDarkMode() {
    setIsDarkMode(!isDarkMode);
    // Here you would typically apply the theme change to the entire app
    document.body.classList.toggle('dark-mode');
    
    // Close settings after changing theme
    setTimeout(() => {
      setSettingsOpen(false);
    }, 300);
  }
  
  function goToProfile() {
    navigate('/admin/profile');
    setSettingsOpen(false);
  }
  
  function goToSystemSettings() {
    navigate('/admin/settings');
    setSettingsOpen(false);
  }
  
  function goToEmailSettings() {
    // Force navigation to trigger re-render
    navigate('/admin/profile');
    // Use a short timeout to ensure navigation has completed before setting the URL param
    setTimeout(() => {
      navigate('/admin/profile?tab=email', { replace: true });
    }, 50);
    setSettingsOpen(false);
  }

  function goToSecuritySettings() {
    // Force navigation to trigger re-render
    navigate('/admin/profile');
    // Use a short timeout to ensure navigation has completed before setting the URL param
    setTimeout(() => {
      navigate('/admin/profile?tab=security', { replace: true });
    }, 50);
    setSettingsOpen(false);
  }
  
  function goToThemeSettings() {
    // Force navigation to trigger re-render
    navigate('/admin/profile');
    // Use a short timeout to ensure navigation has completed before setting the URL param
    setTimeout(() => {
      navigate('/admin/profile?tab=theme', { replace: true });
    }, 50);
    setSettingsOpen(false);
  }
  
  function goToGeneralSettings() {
    // Force navigation to trigger re-render
    navigate('/admin/profile');
    // Use a short timeout to ensure navigation has completed before setting the URL param
    setTimeout(() => {
      navigate('/admin/profile?tab=general', { replace: true });
    }, 50);
    setSettingsOpen(false);
  }
  
  // Demo notifications data
  const notifications = [
    { id: 1, text: 'New student registration', time: '2 minutes ago', read: false },
    { id: 2, text: 'Course review submitted', time: '1 hour ago', read: false },
    { id: 3, text: 'Payment received for Web Development', time: '3 hours ago', read: true },
    { id: 4, text: 'System maintenance completed', time: 'Yesterday', read: true },
  ];
  
  // Organized settings by category
  const settingsCategories = [
    {
      title: "Profile",
      items: [
        { 
          id: 1, 
          label: 'General', 
          icon: <FaUser />, 
          action: goToGeneralSettings,
          description: 'View and edit personal information'
        },
        { 
          id: 2, 
          label: 'Security', 
          icon: <FaShieldAlt />, 
          action: goToSecuritySettings,
          description: 'Manage passwords and authentication'
        },
        { 
          id: 3, 
          label: 'Email', 
          icon: <FaEnvelope />, 
          action: goToEmailSettings,
          description: 'Configure email settings and notifications'
        }
      ]
    },
    {
      title: "Appearance",
      items: [
        { 
          id: 4, 
          label: 'Theme', 
          icon: <FaPalette />, 
          action: goToThemeSettings,
          description: 'Customize UI appearance and colors'
        },
        { 
          id: 5, 
          label: isDarkMode ? 'Light Mode' : 'Dark Mode', 
          icon: isDarkMode ? <FaSun /> : <FaMoon />, 
          action: toggleDarkMode,
          description: `Switch to ${isDarkMode ? 'light' : 'dark'} theme`
        }
      ]
    },
    {
      title: "System",
      items: [
        { 
          id: 6, 
          label: 'System Settings', 
          icon: <FaWrench />, 
          action: goToSystemSettings,
          description: 'Configure system-wide settings'
        },
        { 
          id: 7, 
          label: 'Dashboard', 
          icon: <FaTachometerAlt />, 
          action: () => { navigate('/admin'); setSettingsOpen(false); },
          description: 'Return to the main dashboard'
        },
        { 
          id: 8, 
          label: 'Logout', 
          icon: <FaSignOutAlt />, 
          action: handleLogout,
          description: 'Sign out from your account'
        }
      ]
    }
  ];

  return (
    <div className={`admin-navbar ${isMobile ? 'mobile' : isTablet ? 'tablet' : ''}`} ref={navRef}>
      <div className="navbar-left">
        {isMobile && (
          <motion.button 
            className="mobile-menu-toggle"
            onClick={onMenuToggle}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaBars />
          </motion.button>
        )}
        
        {/* Logo */}
        <div className="navbar-logo">
          <img src={logoImg} alt="LMS Admin" className="navbar-logo-img" />
        </div>
        
        <div className="admin-name">
          Welcome, <span className="admin-home-3d">{adminName}</span>
        </div>
      </div>
      <div className="navbar-right">
        {/* Search Button */}
        <motion.div 
          className={`navbar-icon ${searchOpen ? 'active' : ''}`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            setSearchOpen(!searchOpen);
            setNotificationsOpen(false);
            setSettingsOpen(false);
          }}
        >
          {searchOpen ? <FaTimes /> : <FaSearch />}
        </motion.div>
        
        {/* Notifications Button */}
        <motion.div 
          className={`navbar-icon ${notificationsOpen ? 'active' : ''} ${notifications.some(n => !n.read) ? 'has-badge' : ''}`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            setNotificationsOpen(!notificationsOpen);
            setSearchOpen(false);
            setSettingsOpen(false);
          }}
        >
          <FaBell />
          {notifications.some(n => !n.read) && <span className="badge"></span>}
        </motion.div>
        
        {/* Settings Button */}
        <motion.div 
          className={`navbar-icon ${settingsOpen ? 'active' : ''}`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            setSettingsOpen(!settingsOpen);
            setSearchOpen(false);
            setNotificationsOpen(false);
          }}
        >
          <FaCog />
        </motion.div>
        
        {/* Logout Button */}
        <motion.div 
          className="navbar-icon logout-icon"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleLogout}
        >
          <FaSignOutAlt />
        </motion.div>
      </div>
      
      {/* Search Dropdown */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div 
            className="search-container"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <form onSubmit={handleSearchSubmit}>
              <input 
                type="text" 
                placeholder="Search courses, students, instructors..." 
                ref={searchInputRef}
              />
              <button type="submit">
                <FaSearch />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Notifications Dropdown */}
      <AnimatePresence>
        {notificationsOpen && (
          <motion.div 
            className="notifications-dropdown"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <h3>Notifications</h3>
            <div className="notifications-list">
              {notifications.length > 0 ? (
                notifications.map(notification => (
                  <div key={notification.id} className={`notification-item ${notification.read ? 'read' : 'unread'}`}>
                    <p>{notification.text}</p>
                    <span className="notification-time">{notification.time}</span>
                  </div>
                ))
              ) : (
                <p className="no-notifications">No notifications yet</p>
              )}
            </div>
            <div className="notification-actions">
              <button className="mark-all-read">Mark all as read</button>
              <button className="view-all">View all</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Settings Dropdown */}
      <AnimatePresence>
        {settingsOpen && (
          <motion.div 
            className="settings-dropdown"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <h3>Settings</h3>
            <div className="settings-categories">
              {settingsCategories.map((category, index) => (
                <div key={index} className="settings-category">
                  <h4 className="category-title">{category.title}</h4>
                  <ul className="settings-list">
                    {category.items.map(setting => (
                      <motion.li 
                        key={setting.id} 
                        onClick={setting.action}
                        whileHover={{ backgroundColor: 'rgba(58, 117, 196, 0.1)' }}
                      >
                        <span className="setting-icon">{setting.icon}</span>
                        <div className="setting-content">
                          <span className="setting-label">{setting.label}</span>
                          <span className="setting-description">{setting.description}</span>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
