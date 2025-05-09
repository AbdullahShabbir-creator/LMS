import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import './AdminCategories.css';
import { getUser } from '../utils/auth';
import Toast from '../components/Toast';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCat, setNewCat] = useState('');
  const [editCat, setEditCat] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    async function fetchCategories() {
      setLoading(true);
      setError(null);
      try {
        const user = getUser();
        const res = await fetch('/api/categories', {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch categories');
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  // --- ACTION HANDLERS ---
  async function handleAdd() {
    if (newCat.trim()) {
      try {
        setLoading(true);
        setError(null);
        const user = getUser();
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token}`
          },
          body: JSON.stringify({ name: newCat })
        });
        if (!res.ok) throw new Error('Failed to add category');
        const data = await res.json();
        setCategories([...categories, data]);
        setNewCat('');
        setToast({ message: 'Category added!', type: 'success' });
      } catch (err) {
        setToast({ message: err.message, type: 'error' });
      } finally {
        setLoading(false);
      }
    }
  }

  async function handleEditSave() {
    try {
      setLoading(true);
      setError(null);
      const user = getUser();
      const res = await fetch(`/api/categories/${editCat}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify({ name: editValue })
      });
      if (!res.ok) throw new Error('Failed to update category');
      setCategories(categories.map(cat => cat._id === editCat ? { ...cat, name: editValue } : cat));
      setEditCat(null);
      setEditValue('');
      setToast({ message: 'Category updated!', type: 'success' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      setLoading(true);
      setError(null);
      const user = getUser();
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (!res.ok) throw new Error('Failed to delete category');
      setCategories(categories.filter(cat => cat._id !== id));
      setToast({ message: 'Category deleted!', type: 'success' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div className="admin-categories-page" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
      <div className="categories-header">
        <h2>Manage Categories</h2>
        <div className="add-category-box">
          <input
            type="text"
            placeholder="New category name..."
            value={newCat}
            onChange={e => setNewCat(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <button className="action-btn add" onClick={handleAdd}><FaPlus /></button>
        </div>
      </div>
      <div className="categories-table-wrapper">
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
        {loading ? (
          <div className="loader">Loading categories...</div>
        ) : error ? (
          <div className="error-msg">{error}</div>
        ) : categories.length === 0 ? (
          <div className="empty-msg">No categories found.</div>
        ) : (
          <table className="categories-table">
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <motion.tr key={cat._id} whileHover={{ scale: 1.02, background: '#e0f7fa' }}>
                  <td>
                    {editCat === cat._id ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleEditSave()}
                        autoFocus
                      />
                    ) : (
                      cat.name
                    )}
                  </td>
                  <td>
                    {editCat === cat._id ? (
                      <button className="action-btn save" onClick={handleEditSave}>Save</button>
                    ) : (
                      <>
                        <button className="action-btn edit" onClick={() => setEditCat(cat._id)}><FaEdit /></button>
                        <button className="action-btn delete" onClick={() => handleDelete(cat._id)}><FaTrash /></button>
                      </>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </motion.div>
  );
}
