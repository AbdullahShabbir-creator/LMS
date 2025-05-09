import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaEdit, FaTrash, FaUser, FaUsers, FaLayerGroup, FaPlus } from 'react-icons/fa';
import './AdminCourses.css';
import { getUser } from '../utils/auth';
import Toast from '../components/Toast';

export default function AdminCourses() {
  const [search, setSearch] = useState('');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    async function fetchCourses() {
      setLoading(true);
      setError(null);
      try {
        const user = getUser();
        const res = await fetch('/api/courses', {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch courses');
        const data = await res.json();
        setCourses(data);
      } catch (err) {
        setError(err.message);
        setToast({ message: err.message, type: 'error' });
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  // --- ACTION HANDLERS ---
  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      setLoading(true);
      setError(null);
      const user = getUser();
      const res = await fetch(`/api/courses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (!res.ok) throw new Error('Failed to delete course');
      setCourses(courses => courses.filter(c => c._id !== id));
      setToast({ message: 'Course deleted!', type: 'success' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  const filtered = courses.filter(c =>
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    (c.instructor?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div className="admin-courses-page" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
      <div className="courses-header">
        <h2>Manage Courses</h2>
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by title or instructor..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className="action-btn create"><FaPlus /> Create</button>
        </div>
      </div>
      <div className="courses-table-wrapper">
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
        {loading ? (
          <div className="loader">Loading courses...</div>
        ) : error ? (
          <div className="error-msg">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="empty-msg">No courses found.</div>
        ) : (
          <table className="courses-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Instructor</th>
                <th>Students</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(course => (
                <motion.tr key={course._id} whileHover={{ scale: 1.02, background: '#fff8e1' }}>
                  <td>{course.title}</td>
                  <td><FaUser style={{ marginRight: 5, color: '#a18cd1' }} /> {course.instructor?.name || 'N/A'}</td>
                  <td><FaUsers style={{ marginRight: 5, color: '#a18cd1' }} /> {course.students?.length || 0}</td>
                  <td><FaLayerGroup style={{ marginRight: 5, color: '#fbc2eb' }} /> {course.category}</td>
                  <td>
                    <button className="action-btn view" onClick={() => setSelected(course)}><FaEdit /></button>
                    <button className="action-btn delete" onClick={() => handleDelete(course._id)}><FaTrash /></button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {selected && (
        <motion.div className="course-profile-modal" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }}>
          <div className="profile-content glass">
            <h3>Course Details</h3>
            <p><b>Title:</b> {selected.title}</p>
            <p><b>Instructor:</b> {selected.instructor?.name || 'N/A'}</p>
            <p><b>Enrolled Students:</b> {selected.students?.length || 0}</p>
            <p><b>Category:</b> {selected.category}</p>
            <p><b>Description:</b> {selected.description}</p>
            <button className="close-btn" onClick={() => setSelected(null)}>Close</button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
