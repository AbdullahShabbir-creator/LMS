import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import './StudentHeader.css';

export default function StudentHeader({ minimal = false, showPrevious = false, showBack, showMain }) {
  const navigate = useNavigate();
  const { logout, user } = useAuth('student');
  
  return (
    <header
      className={`student-header${minimal ? ' minimal' : ''}`}
    >
      <div
        className="student-header__logo"
        onClick={() => navigate('/student')}
        style={{ cursor: 'pointer' }}
      >
        <span role="img" aria-label="logo" style={{ fontSize: 32, marginRight: 6 }}>🎓</span>
        <span className="logo-text">MyLMS</span>
        {user && <span className="student-name">{user.name}</span>}
      </div>
      <div className="student-header__actions">
        {showPrevious && (
          <button
            className="student-header-prev-btn"
            onClick={() => navigate(-1)}
          >
            Previous
          </button>
        )}
        {showBack && (
          <button
            className="student-header__back"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
        )}
        {showMain && (
          <button
            className="student-header__main"
            onClick={() => navigate('/student')}
          >
            Main
          </button>
        )}
        {!minimal && (
          <button
            className="student-header__logout"
            onClick={logout}
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
}
