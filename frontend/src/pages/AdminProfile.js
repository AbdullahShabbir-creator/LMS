import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaLock, FaEdit, FaSave, FaTimes, FaCamera, 
  FaShieldAlt, FaCodeBranch, FaGraduationCap, FaPlus, FaTrash, FaCheck, FaEye, FaEyeSlash,
  FaPalette, FaBell, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { getUser } from '../utils/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AdminProfile.css';
import AdminDashboard from './AdminDashboard';

export default function AdminProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get tab from URL query param
  const queryParams = new URLSearchParams(location.search);
  const tabParam = queryParams.get('tab');
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Admin',
    email: 'admin@lms.com',
    phone: '+1 (555) 123-4567',
    joinDate: 'January 15, 2023',
    role: 'admin',
    avatar: null,
    bio: 'LMS System Administrator responsible for platform management and user support.',
    skills: ['System Administration', 'User Management', 'Content Moderation', 'Data Analysis']
  });
  
  const [formData, setFormData] = useState({...profile});
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Map URL param to tab IDs
  const getTabFromParam = (param) => {
    console.log('Tab param received:', param);
    switch(param) {
      case 'general': return 'personal';
      case 'security': return 'security';
      case 'email': return 'email';
      case 'theme': return 'theme';
      case 'skills': return 'skills';
      default: return 'personal';
    }
  };
  
  const [activeTab, setActiveTab] = useState(getTabFromParam(tabParam));
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: ''
  });
  const [newSkill, setNewSkill] = useState('');
  const [mfaEnabled, setMfaEnabled] = useState(false);
  
  // Email notifications settings
  const [emailSettings, setEmailSettings] = useState({
    newStudents: true,
    courseUpdates: true,
    systemAlerts: true,
    marketingEmails: false,
    dailyDigest: true,
    weeklyReport: true
  });
  
  // Theme settings
  const [themeSettings, setThemeSettings] = useState({
    primaryColor: '#3a75c4',
    accentColor: '#2ecc71',
    fontFamily: 'Inter',
    isDarkMode: true,
    sidebarCollapsed: false,
    animationsEnabled: true
  });
  
  // Update active tab based on URL parameter when it changes
  useEffect(() => {
    if (tabParam) {
      console.log('URL tab parameter changed to:', tabParam);
      const newActiveTab = getTabFromParam(tabParam);
      console.log('Setting active tab to:', newActiveTab);
      setActiveTab(newActiveTab);
    }
  }, [tabParam]);
  
  // Load user data on component mount
  useEffect(() => {
    const user = getUser();
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    
    // Simulate fetching admin profile data
    setLoading(true);
    setTimeout(() => {
      setProfile(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
      }));
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
      }));
      setLoading(false);
    }, 800);
  }, [navigate]);
  
  // Update URL when tab changes
  const handleTabChange = (tab) => {
    let paramTab = tab;
    if (tab === 'personal') paramTab = 'general';
    
    console.log('Changing tab to:', tab, 'with URL param:', paramTab);
    
    // Update active tab immediately for better UX
    setActiveTab(tab);
    
    // Update URL without reloading page
    navigate(`/admin/profile?tab=${paramTab}`, { replace: true });
  };
  
  // Handle input changes for profile form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle input changes for password form
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Check password strength if it's the new password field
    if (name === 'newPassword') {
      checkPasswordStrength(value);
    }
  };
  
  // Handle email settings changes
  const handleEmailSettingChange = (setting) => {
    setEmailSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
    
    toast.success(`Email setting updated successfully!`);
  };
  
  // Handle theme setting changes
  const handleThemeSettingChange = (e) => {
    const { name, value } = e.target;
    setThemeSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Toggle theme boolean settings
  const toggleThemeSetting = (setting) => {
    setThemeSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
    
    // Apply dark mode setting immediately for demo purposes
    if (setting === 'isDarkMode') {
      document.body.classList.toggle('dark-mode', !themeSettings.isDarkMode);
      toast.success(`Theme updated successfully!`);
    }
  };
  
  // Check password strength
  const checkPasswordStrength = (password) => {
    let score = 0;
    let label = 'Weak';
    
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    if (score === 2) label = 'Medium';
    else if (score === 3) label = 'Good';
    else if (score === 4) label = 'Strong';
    
    setPasswordStrength({ score, label });
  };
  
  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };
  
  // Handle avatar upload
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        setFormData(prev => ({
          ...prev,
          avatar: file
        }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle profile form submission
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call to update profile
    setTimeout(() => {
      setProfile({
        ...profile,
        ...formData,
        avatar: avatarPreview || profile.avatar
      });
      setIsEditing(false);
      setLoading(false);
      toast.success('Profile updated successfully!');
    }, 1000);
  };
  
  // Handle email settings form submission
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call to update email settings
    setTimeout(() => {
      setLoading(false);
      toast.success('Email settings updated successfully!');
    }, 1000);
  };
  
  // Handle theme settings form submission
  const handleThemeSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call to update theme settings
    setTimeout(() => {
      setLoading(false);
      toast.success('Theme settings updated successfully!');
      
      // Apply theme changes for demo purposes
      document.documentElement.style.setProperty('--primary-color', themeSettings.primaryColor);
      document.documentElement.style.setProperty('--accent-color', themeSettings.accentColor);
    }, 1000);
  };
  
  // Handle password form submission
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    // Validate password
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match!');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long!');
      return;
    }
    
    if (passwordStrength.score < 2) {
      toast.error('Please choose a stronger password!');
      return;
    }
    
    setLoading(true);
    
    // Simulate API call to update password
    setTimeout(() => {
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordStrength({ score: 0, label: '' });
      setLoading(false);
      toast.success('Password updated successfully!');
    }, 1000);
  };
  
  // Toggle MFA
  const handleToggleMFA = () => {
    setLoading(true);
    
    // Simulate API call to toggle MFA
    setTimeout(() => {
      setMfaEnabled(!mfaEnabled);
      setLoading(false);
      toast.success(`Two-factor authentication ${!mfaEnabled ? 'enabled' : 'disabled'} successfully!`);
    }, 1000);
  };
  
  // Add new skill
  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    
    // Check if skill already exists
    if (profile.skills.includes(newSkill.trim())) {
      toast.info('This skill is already in your profile');
      return;
    }
    
    setProfile(prev => ({
      ...prev,
      skills: [...prev.skills, newSkill.trim()]
    }));
    setNewSkill('');
  };
  
  // Remove skill
  const handleRemoveSkill = (skillToRemove) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };
  
  // Cancel editing
  const handleCancel = () => {
    setFormData({...profile});
    setAvatarPreview(null);
    setIsEditing(false);
  };
  
  // Get default avatar if none is provided
  const getAvatar = () => {
    if (avatarPreview) return avatarPreview;
    if (profile.avatar) return profile.avatar;
    return `https://ui-avatars.com/api/?name=${profile.name.replace(/\s+/g, '+')}&background=3a75c4&color=fff&size=200`;
  };
  
  // Render the profile within the admin dashboard
  return (
    <AdminDashboard activeTab={7}>
      <motion.div 
        className="admin-profile-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover />
        
        <motion.div 
          className="admin-profile-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1>Admin Profile</h1>
          <p>View and manage your profile information</p>
        </motion.div>
        
        <div className="admin-profile-content">
          {/* Profile Card */}
          <motion.div 
            className="admin-profile-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="profile-avatar-container">
              <img 
                src={getAvatar()} 
                alt={profile.name} 
                className="profile-avatar" 
              />
              {isEditing && (
                <label className="avatar-upload-btn">
                  <FaCamera />
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleAvatarChange} 
                    style={{ display: 'none' }} 
                  />
                </label>
              )}
            </div>
            
            <div className="profile-name">{profile.name}</div>
            <div className="profile-role">{profile.role.toUpperCase()}</div>
            
            <ul className="profile-info-list">
              <li className="profile-info-item">
                <FaEnvelope />
                <span>{profile.email}</span>
              </li>
              <li className="profile-info-item">
                <FaPhone />
                <span>{profile.phone}</span>
              </li>
              <li className="profile-info-item">
                <FaCalendarAlt />
                <span>Joined {profile.joinDate}</span>
              </li>
            </ul>
            
            <p className="profile-bio">{profile.bio}</p>
            
            <div className="profile-actions">
              {!isEditing ? (
                <motion.button 
                  className="profile-action-btn edit-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(true)}
                >
                  <FaEdit />
                  Edit Profile
                </motion.button>
              ) : (
                <>
                  <motion.button 
                    className="profile-action-btn save-btn"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleProfileSubmit}
                  >
                    <FaSave />
                    Save
                  </motion.button>
                  
                  <motion.button 
                    className="profile-action-btn cancel-btn"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCancel}
                  >
                    <FaTimes />
                    Cancel
                  </motion.button>
                </>
              )}
            </div>
          </motion.div>
          
          {/* Tabs Container */}
          <motion.div 
            className="admin-profile-tabs-container"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="profile-tabs">
              <div 
                className={`profile-tab ${activeTab === 'personal' ? 'active' : ''}`}
                onClick={() => handleTabChange('personal')}
              >
                <FaUser /> General
              </div>
              <div 
                className={`profile-tab ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => handleTabChange('security')}
              >
                <FaShieldAlt /> Security
              </div>
              <div 
                className={`profile-tab ${activeTab === 'email' ? 'active' : ''}`}
                onClick={() => handleTabChange('email')}
              >
                <FaEnvelope /> Email
              </div>
              <div 
                className={`profile-tab ${activeTab === 'theme' ? 'active' : ''}`}
                onClick={() => handleTabChange('theme')}
              >
                <FaPalette /> Theme
              </div>
              <div 
                className={`profile-tab ${activeTab === 'skills' ? 'active' : ''}`}
                onClick={() => handleTabChange('skills')}
              >
                <FaCodeBranch /> Skills
              </div>
            </div>
            
            <AnimatePresence mode="wait">
              {/* Personal Info Tab */}
              {activeTab === 'personal' && (
                <motion.div 
                  key="personal"
                  className="tab-content personal-tab-content"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <form onSubmit={handleProfileSubmit}>
                    <div className="personal-settings-section">
                      <h3>Personal Information</h3>
                      <p className="personal-description">
                        View and update your personal details and contact information.
                      </p>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="name">Full Name</label>
                          <input 
                            type="text" 
                            id="name" 
                            name="name" 
                            className="form-control" 
                            value={formData.name} 
                            onChange={handleInputChange} 
                            required 
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="email">Email Address</label>
                          <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            className="form-control" 
                            value={formData.email} 
                            onChange={handleInputChange} 
                            required 
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="phone">Phone Number</label>
                          <input 
                            type="tel" 
                            id="phone" 
                            name="phone" 
                            className="form-control" 
                            value={formData.phone} 
                            onChange={handleInputChange} 
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="personal-settings-section">
                      <h3>Professional Information</h3>
                      <p className="personal-description">
                        Share information about your professional background and expertise.
                      </p>
                      
                      <div className="form-group">
                        <label htmlFor="bio">Professional Bio</label>
                        <textarea 
                          id="bio" 
                          name="bio" 
                          className="form-control" 
                          value={formData.bio} 
                          onChange={handleInputChange} 
                          disabled={!isEditing}
                          placeholder="Describe your professional experience and role..."
                        />
                      </div>
                      
                      {isEditing && (
                        <div className="form-group" style={{ marginTop: '20px' }}>
                          <button 
                            type="submit" 
                            className="profile-action-btn save-btn"
                            disabled={loading}
                          >
                            {loading ? 'Saving...' : 'Save Profile Information'}
                          </button>
                        </div>
                      )}
                    </div>
                  </form>
                </motion.div>
              )}
              
              {/* Security Tab */}
              {activeTab === 'security' && (
                <motion.div 
                  key="security"
                  className="tab-content"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="security-section">
                    <h3>Change Password</h3>
                    <form onSubmit={handlePasswordSubmit}>
                      <div className="form-group password-field">
                        <label htmlFor="currentPassword">Current Password</label>
                        <div className="password-input-wrapper">
                          <input 
                            type={showPassword.current ? "text" : "password"} 
                            id="currentPassword" 
                            name="currentPassword" 
                            className="form-control" 
                            value={passwordData.currentPassword} 
                            onChange={handlePasswordChange} 
                            required 
                          />
                          <button 
                            type="button" 
                            className="password-toggle" 
                            onClick={() => togglePasswordVisibility('current')}
                          >
                            {showPassword.current ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                      </div>
                      
                      <div className="form-group password-field">
                        <label htmlFor="newPassword">New Password</label>
                        <div className="password-input-wrapper">
                          <input 
                            type={showPassword.new ? "text" : "password"} 
                            id="newPassword" 
                            name="newPassword" 
                            className="form-control" 
                            value={passwordData.newPassword} 
                            onChange={handlePasswordChange} 
                            required
                            minLength="8"
                          />
                          <button 
                            type="button" 
                            className="password-toggle" 
                            onClick={() => togglePasswordVisibility('new')}
                          >
                            {showPassword.new ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                        
                        {passwordData.newPassword && (
                          <>
                            <div className="password-strength">
                              <div 
                                className={`password-strength-meter ${
                                  passwordStrength.score === 1 ? 'weak' : 
                                  passwordStrength.score === 2 ? 'medium' : 
                                  passwordStrength.score === 3 ? 'good' : 
                                  passwordStrength.score === 4 ? 'strong' : ''
                                }`}
                              ></div>
                            </div>
                            <span className="password-strength-text">
                              {passwordStrength.label}
                            </span>
                          </>
                        )}
                      </div>
                      
                      <div className="form-group password-field">
                        <label htmlFor="confirmPassword">Confirm New Password</label>
                        <div className="password-input-wrapper">
                          <input 
                            type={showPassword.confirm ? "text" : "password"} 
                            id="confirmPassword" 
                            name="confirmPassword" 
                            className="form-control" 
                            value={passwordData.confirmPassword} 
                            onChange={handlePasswordChange} 
                            required
                          />
                          <button 
                            type="button" 
                            className="password-toggle" 
                            onClick={() => togglePasswordVisibility('confirm')}
                          >
                            {showPassword.confirm ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                        
                        {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                          <span className="password-mismatch">Passwords do not match</span>
                        )}
                      </div>
                      
                      <div className="form-group">
                        <button 
                          type="submit" 
                          className="profile-action-btn save-btn"
                          disabled={loading}
                        >
                          {loading ? 'Updating...' : 'Update Password'}
                        </button>
                      </div>
                    </form>
                  </div>
                  
                  <div className="security-section mfa-section">
                    <h3>Two-Factor Authentication</h3>
                    <p className="mfa-description">
                      Add an extra layer of security to your account by enabling two-factor authentication.
                    </p>
                    
                    <div className="mfa-status">
                      <div className="mfa-indicator">
                        <div className={`mfa-indicator-dot ${mfaEnabled ? 'enabled' : 'disabled'}`}></div>
                        <span>Two-factor authentication is {mfaEnabled ? 'enabled' : 'disabled'}</span>
                      </div>
                      
                      <button 
                        className={`mfa-toggle ${mfaEnabled ? 'mfa-disable' : 'mfa-enable'}`}
                        onClick={handleToggleMFA}
                        disabled={loading}
                      >
                        {mfaEnabled ? 'Disable' : 'Enable'} 2FA
                      </button>
                    </div>
                  </div>
                  
                  <div className="security-section">
                    <h3>Session Management</h3>
                    <p>You are currently logged in from 1 device:</p>
                    
                    <div className="session-item">
                      <div className="session-info">
                        <span className="session-device">Chrome on Windows</span>
                        <span className="session-location">Current Session</span>
                      </div>
                      <button className="session-logout" disabled>Current</button>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Email Tab */}
              {activeTab === 'email' && (
                <motion.div 
                  key="email"
                  className="tab-content email-tab-content"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <form onSubmit={handleEmailSubmit}>
                    <div className="email-settings-section">
                      <h3>Email Notifications</h3>
                      <p className="email-description">
                        Configure what type of email notifications you want to receive.
                      </p>
                      
                      <div className="settings-toggle-list">
                        <div className="toggle-item">
                          <div className="toggle-content">
                            <h4>New Student Registrations</h4>
                            <p>Receive notifications when new students register on the platform</p>
                          </div>
                          <div 
                            className={`toggle-switch ${emailSettings.newStudents ? 'active' : ''}`}
                            onClick={() => handleEmailSettingChange('newStudents')}
                          >
                            {emailSettings.newStudents ? <FaToggleOn /> : <FaToggleOff />}
                          </div>
                        </div>

                        <div className="toggle-item">
                          <div className="toggle-content">
                            <h4>Course Updates</h4>
                            <p>Receive notifications about new courses and updates to existing courses</p>
                          </div>
                          <div 
                            className={`toggle-switch ${emailSettings.courseUpdates ? 'active' : ''}`}
                            onClick={() => handleEmailSettingChange('courseUpdates')}
                          >
                            {emailSettings.courseUpdates ? <FaToggleOn /> : <FaToggleOff />}
                          </div>
                        </div>

                        <div className="toggle-item">
                          <div className="toggle-content">
                            <h4>System Alerts</h4>
                            <p>Receive important system alert notifications</p>
                          </div>
                          <div 
                            className={`toggle-switch ${emailSettings.systemAlerts ? 'active' : ''}`}
                            onClick={() => handleEmailSettingChange('systemAlerts')}
                          >
                            {emailSettings.systemAlerts ? <FaToggleOn /> : <FaToggleOff />}
                          </div>
                        </div>

                        <div className="toggle-item">
                          <div className="toggle-content">
                            <h4>Marketing Emails</h4>
                            <p>Receive promotional emails and special offers</p>
                          </div>
                          <div 
                            className={`toggle-switch ${emailSettings.marketingEmails ? 'active' : ''}`}
                            onClick={() => handleEmailSettingChange('marketingEmails')}
                          >
                            {emailSettings.marketingEmails ? <FaToggleOn /> : <FaToggleOff />}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="email-settings-section">
                      <h3>Email Reports</h3>
                      <p className="email-description">
                        Configure automated email reports and summaries
                      </p>
                      
                      <div className="settings-toggle-list">
                        <div className="toggle-item">
                          <div className="toggle-content">
                            <h4>Daily Digest</h4>
                            <p>Receive a daily summary of platform activity</p>
                          </div>
                          <div 
                            className={`toggle-switch ${emailSettings.dailyDigest ? 'active' : ''}`}
                            onClick={() => handleEmailSettingChange('dailyDigest')}
                          >
                            {emailSettings.dailyDigest ? <FaToggleOn /> : <FaToggleOff />}
                          </div>
                        </div>

                        <div className="toggle-item">
                          <div className="toggle-content">
                            <h4>Weekly Reports</h4>
                            <p>Receive detailed weekly analytics and usage reports</p>
                          </div>
                          <div 
                            className={`toggle-switch ${emailSettings.weeklyReport ? 'active' : ''}`}
                            onClick={() => handleEmailSettingChange('weeklyReport')}
                          >
                            {emailSettings.weeklyReport ? <FaToggleOn /> : <FaToggleOff />}
                          </div>
                        </div>
                      </div>
                      
                      <div className="form-group" style={{ marginTop: '20px' }}>
                        <button 
                          type="submit" 
                          className="profile-action-btn save-btn"
                          disabled={loading}
                        >
                          {loading ? 'Saving...' : 'Save Email Preferences'}
                        </button>
                      </div>
                    </div>
                  </form>
                </motion.div>
              )}
              
              {/* Theme Tab (NEW) */}
              {activeTab === 'theme' && (
                <motion.div 
                  key="theme"
                  className="tab-content"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="theme-settings-section">
                    <h3>Appearance Settings</h3>
                    <p className="theme-description">
                      Customize the look and feel of your dashboard
                    </p>
                    
                    <form onSubmit={handleThemeSubmit}>
                      <div className="color-picker-group">
                        <label>Primary Color</label>
                        <div className="color-picker-wrapper">
                          <input 
                            type="color" 
                            name="primaryColor"
                            value={themeSettings.primaryColor}
                            onChange={handleThemeSettingChange}
                            className="color-picker"
                          />
                          <span className="color-value">{themeSettings.primaryColor}</span>
                        </div>
                      </div>
                      
                      <div className="color-picker-group">
                        <label>Accent Color</label>
                        <div className="color-picker-wrapper">
                          <input 
                            type="color" 
                            name="accentColor"
                            value={themeSettings.accentColor}
                            onChange={handleThemeSettingChange}
                            className="color-picker"
                          />
                          <span className="color-value">{themeSettings.accentColor}</span>
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <label>Font Family</label>
                        <select 
                          name="fontFamily"
                          value={themeSettings.fontFamily}
                          onChange={handleThemeSettingChange}
                          className="form-control"
                        >
                          <option value="Inter">Inter</option>
                          <option value="Roboto">Roboto</option>
                          <option value="Open Sans">Open Sans</option>
                          <option value="Montserrat">Montserrat</option>
                          <option value="Lato">Lato</option>
                        </select>
                      </div>
                      
                      <div className="settings-toggle-list">
                        <div className="toggle-item">
                          <div className="toggle-content">
                            <h4>Dark Mode</h4>
                            <p>Switch between light and dark themes</p>
                          </div>
                          <div 
                            className={`toggle-switch ${themeSettings.isDarkMode ? 'active' : ''}`}
                            onClick={() => toggleThemeSetting('isDarkMode')}
                          >
                            {themeSettings.isDarkMode ? <FaToggleOn /> : <FaToggleOff />}
                          </div>
                        </div>
                        
                        <div className="toggle-item">
                          <div className="toggle-content">
                            <h4>Collapse Sidebar</h4>
                            <p>Auto-collapse sidebar for more workspace</p>
                          </div>
                          <div 
                            className={`toggle-switch ${themeSettings.sidebarCollapsed ? 'active' : ''}`}
                            onClick={() => toggleThemeSetting('sidebarCollapsed')}
                          >
                            {themeSettings.sidebarCollapsed ? <FaToggleOn /> : <FaToggleOff />}
                          </div>
                        </div>
                        
                        <div className="toggle-item">
                          <div className="toggle-content">
                            <h4>Enable Animations</h4>
                            <p>Show animations and transitions</p>
                          </div>
                          <div 
                            className={`toggle-switch ${themeSettings.animationsEnabled ? 'active' : ''}`}
                            onClick={() => toggleThemeSetting('animationsEnabled')}
                          >
                            {themeSettings.animationsEnabled ? <FaToggleOn /> : <FaToggleOff />}
                          </div>
                        </div>
                      </div>
                      
                      <div className="form-group" style={{ marginTop: '20px' }}>
                        <button 
                          type="submit" 
                          className="profile-action-btn save-btn"
                          disabled={loading}
                        >
                          {loading ? 'Applying...' : 'Apply Theme'}
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}
              
              {/* Skills Tab */}
              {activeTab === 'skills' && (
                <motion.div 
                  key="skills"
                  className="tab-content"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="skills-section">
                    <h3>Your Skills & Expertise</h3>
                    <p>Add skills that describe your expertise and capabilities</p>
                    
                    <div className="skills-container">
                      {profile.skills.map((skill, index) => (
                        <motion.div 
                          key={index} 
                          className="skill-badge"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          {skill}
                          <span 
                            className="remove-skill" 
                            onClick={() => handleRemoveSkill(skill)}
                          >
                            <FaTimes />
                          </span>
                        </motion.div>
                      ))}
                    </div>
                    
                    <div className="add-skill-input">
                      <input 
                        type="text" 
                        placeholder="Add a new skill..." 
                        value={newSkill} 
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                      />
                      <button 
                        onClick={handleAddSkill}
                        type="button"
                      >
                        <FaPlus />
                      </button>
                    </div>
                  </div>
                  
                  <div className="skills-section certifications-section">
                    <h3>Certifications & Education</h3>
                    <p>List your educational background and certifications relevant to your admin role</p>
                    
                    <div className="certification-item">
                      <div className="certification-icon">
                        <FaGraduationCap />
                      </div>
                      <div className="certification-details">
                        <h4>Bachelor of Science in Computer Science</h4>
                        <p>University of Technology, 2018</p>
                      </div>
                    </div>
                    
                    <div className="certification-item">
                      <div className="certification-icon">
                        <FaCheck />
                      </div>
                      <div className="certification-details">
                        <h4>AWS Certified Solutions Architect</h4>
                        <p>Amazon Web Services, 2020</p>
                      </div>
                    </div>
                    
                    <button className="add-certification-btn">
                      <FaPlus /> Add Certification
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </AdminDashboard>
  );
} 