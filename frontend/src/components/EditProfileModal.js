import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

export default function EditProfileModal({ profile, onSave, onClose }) {
  const [form, setForm] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    enrollmentNumber: profile?.enrollmentNumber || '',
    program: profile?.program || '',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="edit-profile-modal__overlay">
      <div className="edit-profile-modal__container">
        <button className="edit-profile-modal__close" onClick={onClose}><FaTimes /></button>
        <h2>Edit Profile</h2>
        <form onSubmit={handleSubmit} className="edit-profile-modal__form">
          <label>Name
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>
          <label>Email
            <input name="email" value={form.email} onChange={handleChange} required type="email" />
          </label>
          <label>Enrollment Number
            <input name="enrollmentNumber" value={form.enrollmentNumber} onChange={handleChange} required />
          </label>
          <label>Program
            <input name="program" value={form.program} onChange={handleChange} />
          </label>
          <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
        </form>
      </div>
    </div>
  );
}
