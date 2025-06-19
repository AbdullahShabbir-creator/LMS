import React, { useState, useEffect } from 'react';
import InstructorHeader from '../components/InstructorHeader';
import InstructorFooter from '../components/InstructorFooter';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/instructor.settings.css';

export default function InstructorSettings() {
  const [profile, setProfile] = useState({ name: '', email: '', avatar: '', bio: '' });
  const [password, setPassword] = useState({ old: '', new: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const token = localStorage.getItem('lms_token');

  useEffect(() => {
    async function fetchInstructorProfile() {
      try {
        const res = await fetch('http://localhost:3001/api/instructor/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Failed to fetch profile');

        const data = await res.json();
        setProfile({
          name: data.name || '',
          email: data.email || '',
          avatar: data.avatar || '',
          bio: data.bio || '',
        });
      } catch (error) {
        toast.error(error.message || 'Error fetching profile');
      }
    }

    if (token) {
      fetchInstructorProfile();
    }
  }, [token]);

  // Clean up the object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }

  function handleProfileChange(e) {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  }

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', profile.name);
      formData.append('email', profile.email);
      formData.append('bio', profile.bio);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const res = await fetch('http://localhost:3001/api/instructor/update-profile', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update profile');

      toast.success(data.message || 'Profile updated successfully!');
      setProfile(prev => ({
        ...prev,
        name: data.user.name,
        email: data.user.email,
        bio: data.user.bio,
        avatar: data.user.avatar || prev.avatar,
      }));
      setAvatarFile(null);
      setPreviewUrl(null); // reset preview
    } catch (error) {
      toast.error(error.message || 'Profile update failed');
    } finally {
      setLoading(false);
    }
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
    // Dummy password change logic, replace with API later
    setTimeout(() => {
      setLoading(false);
      toast.success('Password changed successfully!');
      setPassword({ old: '', new: '', confirm: '' });
    }, 1000);
  }

  return (
    <div className="instructor-settings-root">
      <InstructorHeader />
      <main className="settings-main">
        <h2 className="settings-title">Settings</h2>

        {/* Profile Info */}
        <section className="settings-section">
          <div className="settings-section-title">Profile Information</div>
          <form className="settings-form" onSubmit={handleProfileSubmit}>
            <div className="settings-avatar-row">
              <img
                src={
                  previewUrl ||
                  profile.avatar ||
                  'https://ui-avatars.com/api/?name=' + encodeURIComponent(profile.name)
                }
                alt="avatar"
                className="settings-avatar"
              />
              <input
                type="file"
                accept="image/*"
                className="settings-avatar-upload"
                onChange={handleAvatarChange}
              />
            </div>

            <label>
              Name:
              <input
                name="name"
                value={profile.name}
                onChange={handleProfileChange}
                required
              />
            </label>

            <label>
              Email:
              <input
                name="email"
                type="email"
                value={profile.email}
                onChange={handleProfileChange}
                required
              />
            </label>

            <label>
              Bio:
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleProfileChange}
              />
            </label>

            <button type="submit" disabled={loading} className="settings-btn">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </section>

        {/* Change Password */}
        <section className="settings-section">
          <h3>Change Password</h3>
          <form className="settings-form" onSubmit={handlePasswordSubmit}>
            <label>
              Current Password:
              <input
                name="old"
                type="password"
                value={password.old}
                onChange={handlePasswordChange}
                required
              />
            </label>
            <label>
              New Password:
              <input
                name="new"
                type="password"
                value={password.new}
                onChange={handlePasswordChange}
                required
              />
            </label>
            <label>
              Confirm Password:
              <input
                name="confirm"
                type="password"
                value={password.confirm}
                onChange={handlePasswordChange}
                required
              />
            </label>
            <button type="submit" disabled={loading} className="settings-btn">
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </section>
      </main>
      <ToastContainer />
      <InstructorFooter />
    </div>
  );
}
