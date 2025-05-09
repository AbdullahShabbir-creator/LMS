import React, { useState } from 'react';
import axios from 'axios';

export default function MFAToggle({ mfaEnabled, onChange }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleToggle = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('lms_token');
    try {
      const res = await axios.patch('/api/student/mfa', { enabled: !mfaEnabled }, {
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
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
      <label style={{ fontWeight: 500, color: '#185a9d' }}>
        Two-Factor Authentication (MFA):
        <button
          onClick={handleToggle}
          disabled={loading}
          style={{
            marginLeft: 12,
            padding: '6px 18px',
            borderRadius: 8,
            border: 'none',
            background: mfaEnabled ? 'linear-gradient(90deg,#43cea2,#00bfff)' : '#e3e6f3',
            color: mfaEnabled ? '#fff' : '#185a9d',
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: mfaEnabled ? '0 1px 6px #43cea233' : 'none',
            transition: 'all 0.2s'
          }}
        >
          {loading ? 'Updating...' : mfaEnabled ? 'Disable MFA' : 'Enable MFA'}
        </button>
      </label>
      {error && <span style={{ color: 'red', marginLeft: 10 }}>{error}</span>}
    </div>
  );
}
