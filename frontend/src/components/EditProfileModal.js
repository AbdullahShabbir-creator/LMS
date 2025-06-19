import React, { useState,useEffect } from 'react';
import axios from 'axios';
import { FaTimes } from 'react-icons/fa';

export default function EditProfileModal({ profile, onClose }) {
  const token=localStorage.getItem('lms_token')
  const [form, setForm] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    bio: profile?.bio || '',
    avatar: profile?.avatar || '', // image URL or File
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
useEffect(() => {
  if (profile) {
    setForm({
      name: profile.name || '',
      email: profile.email || '',
      bio: profile.bio || '',
      avatar: profile.avatar || '',
    });
  }
}, [profile]);
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, avatar: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('email', form.email);
      formData.append('bio', form.bio);
      if (form.avatar && typeof form.avatar !== 'string') {
        formData.append('avatar', form.avatar); // only append if new file
      }
console.log(form)
      const res = await axios.put('http://localhost:3001/api/instructor/update-profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data',
           Authorization: `Bearer ${token}`,
         },
       
        });
        console.log(res)

      setMessage('Profile updated successfully!');
      
      onClose(); // close the modal
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
      console.log(err)
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="edit-profile-modal__overlay">
      <div className="edit-profile-modal__container">
        <button className="edit-profile-modal__close" onClick={onClose}><FaTimes /></button>
        <h2>Edit Profile</h2>
        {message && <div className="success">{message}</div>}
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit} className="edit-profile-modal__form">
          <label>Name
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>
          <label>Email
            <input name="email" value={form.email} onChange={handleChange} required type="email" />
          </label>
          <label>Bio
            <textarea name="bio" value={form.bio} onChange={handleChange} rows={4} />
          </label>
          <label>Avatar
<input
  type="file"
  accept="image/*"
  name="avatar" // ✅ this is necessary!
  onChange={handleAvatarChange}
/>

            {form.avatar && typeof form.avatar !== 'string' && (
              <p>{form.avatar.name}</p>
            )}
            {typeof form.avatar === 'string' && (
              <img src={form.avatar} alt="Current Avatar" style={{ width: 100, marginTop: 10 }} />
            )}
          </label>
          <button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
