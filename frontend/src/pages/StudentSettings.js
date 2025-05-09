import React, { useState, useEffect } from 'react';
import StudentHeader from '../components/StudentHeader';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { FaLock, FaEye, FaShieldAlt, FaHistory, FaChevronRight, FaBell } from 'react-icons/fa';
import axios from 'axios';
import './StudentSettings.css';
import useAuth from '../hooks/useAuth';
import { getToken as getAuthToken } from '../utils/auth';

export default function StudentSettings() {
  const { user, loading } = useAuth('student');
  
  // Account Security
  const [showPassword, setShowPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changing, setChanging] = useState(false);
  const [changeMsg, setChangeMsg] = useState('');

  // 2FA
  const [twoFA, setTwoFA] = useState(false);

  // Privacy Controls
  const [publicProfile, setPublicProfile] = useState(true);
  const [leaderboard, setLeaderboard] = useState(true);
  const [dataConsent, setDataConsent] = useState(false);

  // Recent Logins
  const [recentLogins] = useState([
    { device: 'Chrome on Windows', location: 'Lahore, PK', date: '2025-04-29 22:13', active: true },
    { device: 'Safari on iPhone', location: 'Lahore, PK', date: '2025-04-28 16:41', active: false },
  ]);

  // Notification Preferences
  const [notifPrefs, setNotifPrefs] = useState({
    assignment: true,
    grades: true,
    announcements: true,
    newsletter: false
  });
  const [notifMsg, setNotifMsg] = useState('');

  useEffect(() => {
    // Fetch notification preferences on mount
    if (!loading) {
      (async () => {
        try {
          const token = getAuthToken();
          if (!token) return;
          
          const res = await axios.get('/api/student/notifications/prefs', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setNotifPrefs(res.data);
        } catch (err) {
          // Fallback to defaults
          console.error('Error fetching notification preferences:', err);
        }
      })();
    }
  }, [loading]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setChanging(true);
    setChangeMsg('');
    if (newPassword !== confirmPassword) {
      setChangeMsg('New passwords do not match.');
      setChanging(false);
      return;
    }
    try {
      const token = getAuthToken();
      if (!token) {
        setChangeMsg('Authentication error. Please login again.');
        setChanging(false);
        return;
      }
      
      await axios.patch('/api/student/password', {
        oldPassword,
        newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChangeMsg('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setChangeMsg(err.response?.data?.error || 'Failed to change password.');
    }
    setChanging(false);
  };

  const handle2FA = async (enabled) => {
    setTwoFA(enabled);
    try {
      const token = getAuthToken();
      if (!token) return;
      
      await axios.patch('/api/student/2fa', { enabled }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Error updating 2FA settings:', err);
      // Optionally show error
    }
  };

  const handlePrivacyChange = async (type, value) => {
    if (type === 'publicProfile') setPublicProfile(value);
    if (type === 'leaderboard') setLeaderboard(value);
    if (type === 'dataConsent') setDataConsent(value);
    try {
      const token = getAuthToken();
      if (!token) return;
      
      await axios.patch('/api/student/privacy', {
        [type]: value
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Error updating privacy settings:', err);
    }
  };

  const handleNotifChange = async (e) => {
    const { name, checked } = e.target;
    setNotifPrefs(prev => ({ ...prev, [name]: checked }));
    try {
      const token = getAuthToken();
      if (!token) {
        setNotifMsg('Authentication error. Please login again.');
        return;
      }
      
      await axios.patch('/api/student/notifications/prefs', {
        [name]: checked
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifMsg('Preferences updated!');
    } catch (err) {
      console.error('Error updating notification preferences:', err);
      setNotifMsg('Failed to update preferences.');
    }
  };

  if (loading) {
    return (
      <div className="settings-root">
        <StudentHeader minimal={false} showPrevious={true} />
        <main className="settings-main">
          <div className="settings-loading">Loading settings...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="settings-root">
      <StudentHeader minimal={false} showPrevious={true} />
      <main className="settings-main">
        <motion.section className="settings-section" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h2 className="settings-title"><FaLock style={{ marginRight: 8 }} /> Account Security</h2>
          <form className="settings-form settings-form-center" onSubmit={handlePasswordChange}>
            <label>Current Password
              <input type={showPassword ? 'text' : 'password'} value={oldPassword} onChange={e => setOldPassword(e.target.value)} required />
            </label>
            <label>New Password
              <input type={showPassword ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
            </label>
            <label>Confirm New Password
              <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
            </label>
            <div className="settings-row">
              <label className="settings-checkbox">
                <input type="checkbox" checked={showPassword} onChange={e => setShowPassword(e.target.checked)} /> Show Passwords
              </label>
              <button className="settings-btn" type="submit" disabled={changing}>{changing ? 'Changing...' : 'Change Password'}</button>
            </div>
            {changeMsg && <div className="settings-msg">{changeMsg}</div>}
          </form>
          <div className="settings-row" style={{ marginTop: 18 }}>
            <FaShieldAlt style={{ fontSize: 18, color: '#43cea2', marginRight: 8 }} />
            <label className="settings-checkbox">
              <input type="checkbox" checked={twoFA} onChange={e => handle2FA(e.target.checked)} /> Enable Two-Factor Authentication (2FA)
            </label>
          </div>
          <div className="settings-logins">
            <h3><FaHistory style={{ marginRight: 6 }} /> Recent Logins</h3>
            <ul>
              {recentLogins.map((login, idx) => (
                <li key={idx} className={login.active ? 'active' : ''}>
                  <span>{login.device}</span> <span>{login.location}</span> <span>{login.date}</span>
                  {login.active && <span className="settings-active">Active</span>}
                  {!login.active && <button className="settings-btn settings-btn-small">Revoke</button>}
                </li>
              ))}
            </ul>
          </div>
        </motion.section>

        <motion.section className="settings-section" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <h2 className="settings-title"><FaEye style={{ marginRight: 8 }} /> Privacy Controls</h2>
          <div className="settings-row">
            <label className="settings-checkbox">
              <input type="checkbox" checked={publicProfile} onChange={e => handlePrivacyChange('publicProfile', e.target.checked)} /> Public Profile
            </label>
            <label className="settings-checkbox">
              <input type="checkbox" checked={leaderboard} onChange={e => handlePrivacyChange('leaderboard', e.target.checked)} /> Show on Leaderboard
            </label>
            <label className="settings-checkbox">
              <input type="checkbox" checked={dataConsent} onChange={e => handlePrivacyChange('dataConsent', e.target.checked)} /> Consent to Analytics & Third-Party Data
            </label>
          </div>
        </motion.section>

        <motion.section className="settings-section settings-section-center" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h2 className="settings-title"><FaBell style={{ marginRight: 8 }} /> Notification Preferences</h2>
          <div className="settings-row settings-row-center">
            <label className="settings-checkbox notif-checkbox">
              <input type="checkbox" checked={notifPrefs.assignment} onChange={handleNotifChange} name="assignment" />
              Assignment Updates
            </label>
            <label className="settings-checkbox notif-checkbox">
              <input type="checkbox" checked={notifPrefs.grades} onChange={handleNotifChange} name="grades" />
              Grade Notifications
            </label>
            <label className="settings-checkbox notif-checkbox">
              <input type="checkbox" checked={notifPrefs.announcements} onChange={handleNotifChange} name="announcements" />
              Announcements
            </label>
            <label className="settings-checkbox notif-checkbox">
              <input type="checkbox" checked={notifPrefs.newsletter} onChange={handleNotifChange} name="newsletter" />
              Newsletter Subscription
            </label>
          </div>
          {notifMsg && <div className="settings-msg">{notifMsg}</div>}
        </motion.section>
      </main>
      <Footer />
    </div>
  );
}
