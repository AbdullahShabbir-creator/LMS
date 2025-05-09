import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaUserCheck, FaUserTimes, FaTrash, FaEye } from 'react-icons/fa';
import './AdminInstructors.css';
import { getUser } from '../utils/auth';
import Toast from '../components/Toast';

export default function AdminInstructors() {
  const [search, setSearch] = useState('');
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    async function fetchInstructors() {
      setLoading(true);
      setError(null);
      try {
        const user = getUser();
        const res = await fetch('/api/instructors', {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch instructors');
        const data = await res.json();
        setInstructors(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchInstructors();
  }, []);

  // --- ACTION HANDLERS ---
  async function handleSuspend(id) {
    try {
      setLoading(true);
      setError(null);
      const user = getUser();
      const res = await fetch(`/api/instructors/${id}/suspend`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (!res.ok) throw new Error('Failed to suspend instructor');
      setInstructors(instructors => instructors.map(i => i._id === id ? { ...i, status: 'suspended' } : i));
      setToast({ message: 'Instructor suspended!', type: 'success' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }
  async function handleActivate(id) {
    try {
      setLoading(true);
      setError(null);
      const user = getUser();
      const res = await fetch(`/api/instructors/${id}/activate`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (!res.ok) throw new Error('Failed to activate instructor');
      setInstructors(instructors => instructors.map(i => i._id === id ? { ...i, status: 'active' } : i));
      setToast({ message: 'Instructor activated!', type: 'success' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }
  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this instructor?')) return;
    try {
      setLoading(true);
      setError(null);
      const user = getUser();
      const res = await fetch(`/api/instructors/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (!res.ok) throw new Error('Failed to delete instructor');
      setInstructors(instructors => instructors.filter(i => i._id !== id));
      setToast({ message: 'Instructor deleted!', type: 'success' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  const filtered = instructors.filter(i =>
    i.name?.toLowerCase().includes(search.toLowerCase()) ||
    i.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div className="admin-instructors-page" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
      <div className="instructors-header">
        <h2>Manage Instructors</h2>
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="instructors-table-wrapper">
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
        {loading ? (
          <div className="loader">Loading instructors...</div>
        ) : error ? (
          <div className="error-msg">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="empty-msg">No instructors found.</div>
        ) : (
          <table className="instructors-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Courses</th>
                <th>Students</th>
                <th>Reviews</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(instr => (
                <motion.tr key={instr._id} whileHover={{ scale: 1.02, background: '#e3f2fd' }}>
                  <td>{instr.name}</td>
                  <td>{instr.email}</td>
                  <td>
                    <span className={instr.status === 'active' ? 'status-active' : instr.status === 'pending' ? 'status-pending' : 'status-suspended'}>
                      {instr.status ? instr.status.charAt(0).toUpperCase() + instr.status.slice(1) : 'Active'}
                    </span>
                  </td>
                  <td>{instr.courses || 0}</td>
                  <td>{instr.students || 0}</td>
                  <td>{instr.reviews || 0}</td>
                  <td>
                    <button className="action-btn view" onClick={() => setSelected(instr)}><FaEye /></button>
                    {instr.status === 'active' ? (
                      <button className="action-btn suspend" onClick={() => handleSuspend(instr._id)}><FaUserTimes /></button>
                    ) : (
                      <button className="action-btn activate" onClick={() => handleActivate(instr._id)}><FaUserCheck /></button>
                    )}
                    <button className="action-btn delete" onClick={() => handleDelete(instr._id)}><FaTrash /></button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {selected && (
        <motion.div className="instructor-profile-modal" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }}>
          <div className="profile-content glass">
            <h3>Instructor Profile</h3>
            <p><b>Name:</b> {selected.name}</p>
            <p><b>Email:</b> {selected.email}</p>
            <p><b>Status:</b> {selected.status || 'Active'}</p>
            <p><b>Courses Created:</b> {selected.courses || 0}</p>
            <p><b>Students:</b> {selected.students || 0}</p>
            <p><b>Reviews:</b> {selected.reviews || 0}</p>
            <button className="close-btn" onClick={() => setSelected(null)}>Close</button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
