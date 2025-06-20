// components/DeleteModal.js
import React from 'react';
import './DeleteModal.css';  // Create this CSS file

export default function DeleteModal({ open, onConfirm, onClose }) {
  if (!open) return null;

  return (
    <div className="delete-modal-overlay">
      <div className="delete-modal-content">
        <h4>Confirm Delete</h4>
        <p>Are you sure you want to delete this course?</p>
        <div className="delete-modal-actions">
          <button className="btn btn-danger" onClick={onConfirm}>
            Yes, Delete
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
