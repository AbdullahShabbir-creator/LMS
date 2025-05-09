import React, { useState } from 'react';
import axios from 'axios';

export default function MFAToggleInline({ mfaEnabled, email, onChange }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Only allow updating MFA if user is already logged in (token exists)
  const handleChange = async (e) => {
    const enabled = e.target.value === 'enabled';
    setLoading(true);
    setError('');
    const token = localStorage.getItem('lms_token');
    if (!token) {
      setError('Please log in to change MFA setting.');
      setLoading(false);
      return;
    }
    try {
      const res = await axios.patch('/api/student/mfa', { enabled }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onChange(res.data.mfaEnabled);
    } catch (err) {
      setError('Failed to update MFA setting.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 12, marginBottom: 12 }}>
      <span style={{ fontWeight: 500, color: '#185a9d', marginRight: 10 }}>
        Two-Factor Authentication (MFA):
      </span>
      <select
        value={mfaEnabled ? 'enabled' : 'disabled'}
        onChange={handleChange}
        disabled={loading}
        style={{
          marginLeft: 8,
          padding: '5px 15px',
          borderRadius: 7,
          border: '1.5px solid #e3e6f3',
          color: '#185a9d',
          fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer',
          background: '#fff',
          transition: 'all 0.2s'
        }}
      >
        <option value="enabled">Enable MFA</option>
        <option value="disabled">Disable MFA</option>
      </select>
      {error && <span style={{ color: 'red', marginLeft: 10 }}>{error}</span>}
    </div>
  );
}
