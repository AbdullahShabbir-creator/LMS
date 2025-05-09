import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaEye, FaUserCheck, FaUserTimes, FaRedo } from 'react-icons/fa';
import './AdminStudents.css';
import { getUser } from '../utils/auth';
import Toast from '../components/Toast';

export default function AdminStudents() {
  const [search, setSearch] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    async function fetchStudents() {
      setLoading(true);
      setError(null);
      try {
        const user = getUser();
        const res = await fetch('/api/students', {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch students');
        const data = await res.json();
        setStudents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, []);

  // --- ACTION HANDLERS ---
  async function handleSuspend(id) {
    try {
      setLoading(true);
      setError(null);
      const user = getUser();
      const res = await fetch(`/api/students/${id}/suspend`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (!res.ok) throw new Error('Failed to suspend student');
      setStudents(students => students.map(s => s._id === id ? { ...s, status: 'suspended' } : s));
      setToast({ message: 'Student suspended!', type: 'success' });
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
      const res = await fetch(`/api/students/${id}/activate`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (!res.ok) throw new Error('Failed to activate student');
      setStudents(students => students.map(s => s._id === id ? { ...s, status: 'active' } : s));
      setToast({ message: 'Student activated!', type: 'success' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }
  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    try {
      setLoading(true);
      setError(null);
      const user = getUser();
      const res = await fetch(`/api/students/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (!res.ok) throw new Error('Failed to delete student');
      setStudents(students => students.filter(s => s._id !== id));
      setToast({ message: 'Student deleted!', type: 'success' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  const filtered = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div className="admin-students-page" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
      <div className="students-header">
        <h2>Manage Students</h2>
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
      <div className="students-table-wrapper">
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
        {loading ? (
          <div className="loader">Loading students...</div>
        ) : error ? (
          <div className="error-msg">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="empty-msg">No students found.</div>
        ) : (
          <table className="students-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(student => (
                <motion.tr key={student._id} whileHover={{ scale: 1.02, background: '#e3f2fd' }}>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>
                    <span className={student.status === 'active' ? 'status-active' : student.status === 'suspended' ? 'status-suspended' : 'status-pending'}>
                      {student.status ? student.status.charAt(0).toUpperCase() + student.status.slice(1) : 'Active'}
                    </span>
                  </td>
                  <td>
                    <button className="action-btn view" onClick={() => setSelected(student)}><FaEye /></button>
                    {student.status === 'active' ? (
                      <button className="action-btn suspend" onClick={() => handleSuspend(student._id)}><FaUserTimes /></button>
                    ) : (
                      <button className="action-btn activate" onClick={() => handleActivate(student._id)}><FaUserCheck /></button>
                    )}
                    <button className="action-btn delete" onClick={() => handleDelete(student._id)}><FaRedo /></button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {selected && (
        <motion.div className="student-profile-modal" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }}>
          <div className="profile-content glass">
            <h3>Student Profile</h3>
            <p><b>Name:</b> {selected.name}</p>
            <p><b>Email:</b> {selected.email}</p>
            <p><b>Status:</b> {selected.status || 'Active'}</p>
            <button className="close-btn" onClick={() => setSelected(null)}>Close</button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
