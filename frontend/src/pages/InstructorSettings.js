import React, { useState } from 'react';
import InstructorHeader from '../components/InstructorHeader';
import InstructorFooter from '../components/InstructorFooter';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/instructor.settings.css';
import NotificationPreferences from '../components/NotificationPreferences';

export default function InstructorSettings() {
  // Example state for profile
  const [profile, setProfile] = useState({ name: '', email: '', avatar: '', bio: '' });
  const [password, setPassword] = useState({ old: '', new: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  // Mock fetch profile info on mount
  React.useEffect(() => {
    // Replace with real API call
    setProfile({ name: 'Jane Doe', email: 'jane@yourlms.com', avatar: '', bio: 'Passionate instructor.' });
  }, []);

  function handleProfileChange(e) {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  }

  function handleProfileSubmit(e) {
    e.preventDefault();
    setLoading(true);
    // Replace with real API call
    setTimeout(() => {
      setLoading(false);
      toast.success('Profile updated successfully!');
    }, 900);
  }

  function handlePasswordChange(e) {
    setPassword({ ...password, [e.target.name]: e.target.value });
  }

  function handlePasswordSubmit(e) {
    e.preventDefault();
    if (password.new !== password.confirm) {
      toast.error('New passwords do not match!');
      return;
    }
    setLoading(true);
    // Replace with real API call
    setTimeout(() => {
      setLoading(false);
      toast.success('Password changed successfully!');
      setPassword({ old: '', new: '', confirm: '' });
    }, 900);
  }

  return (
    <div className="instructor-settings-root">
      <InstructorHeader />
      <main className="settings-main">
        <h2 className="settings-title">Settings</h2>
        <section className="settings-section">
          <div className="settings-section-title">Profile Information</div>
          <form className="settings-form" onSubmit={handleProfileSubmit}>
            <div className="settings-avatar-row">
              <img src={profile.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(profile.name)} alt="avatar" className="settings-avatar" />
              <input type="file" accept="image/*" className="settings-avatar-upload" />
            </div>
            <label>Name:<input name="name" value={profile.name} onChange={handleProfileChange} required /></label>
            <label>Email:<input name="email" type="email" value={profile.email} onChange={handleProfileChange} required /></label>
            <label>Bio:<textarea name="bio" value={profile.bio} onChange={handleProfileChange} /></label>
            <button type="submit" disabled={loading} className="settings-btn">{loading ? 'Saving...' : 'Save Changes'}</button>
          </form>
        </section>
        <section className="settings-section">
          <h3>Change Password</h3>
          <form className="settings-form" onSubmit={handlePasswordSubmit}>
            <label>Current Password:<input name="old" type="password" value={password.old} onChange={handlePasswordChange} required /></label>
            <label>New Password:<input name="new" type="password" value={password.new} onChange={handlePasswordChange} required /></label>
            <label>Confirm New Password:<input name="confirm" type="password" value={password.confirm} onChange={handlePasswordChange} required /></label>
            <button type="submit" disabled={loading} className="settings-btn">{loading ? 'Saving...' : 'Change Password'}</button>
          </form>
        </section>
        <NotificationPreferences />
      </main>
      <InstructorFooter />
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar newestOnTop />
    </div>
  );
}
