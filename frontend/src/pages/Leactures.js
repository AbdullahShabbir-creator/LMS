import React, { useState, useEffect, useMemo } from 'react';
import InstructorHeader from '../components/InstructorHeader';
import InstructorFooter from '../components/InstructorFooter';
import { motion } from 'framer-motion';
import { FaSearch, FaThLarge, FaThList } from 'react-icons/fa';
import { toast } from 'react-toastify';
import '../styles/instructor.modern.css';
import '../styles/leactures.modern.css';
const DEMO_CATEGORIES = [
  'All',
  'Programming',
  'General',
  'Design',
  'Business',
  'IT & Software',
  'Other',
  'Personal Development'
];

const CATEGORY_COLORS = {
  'All': 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)',
  'Programming': 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)',
  'General': 'linear-gradient(90deg, #f7971e 0%, #ffd200 100%)',
  'Design': 'linear-gradient(90deg, #ff6a00 0%, #ee0979 100%)',         // Orange to Pink
  'Business': 'linear-gradient(90deg, #11998e 0%, #38ef7d 100%)',       // Teal to Green
  'IT & Software': 'linear-gradient(90deg, #2c3e50 0%, #4ca1af 100%)',  // Dark Blue to Light Blue
  'Other': 'linear-gradient(90deg, #232526 0%, #6c63ff 100%)',
  'Personal Development': 'linear-gradient(90deg, #ff512f 0%, #dd2476 100%)' // Red to Purple
};


function LeactureCard({ leacture }) {
  return (
    <div style={{ perspective: 900 }}>
      <div
        className="leacture-card3d"
        style={{
          boxShadow: '0 4px 24px #6c63ff44, 0 2px 18px #23252633',
          borderRadius: 22,
          background: 'linear-gradient(120deg,#232526 60%,#6c63ff 100%)',
          minHeight: 260,
          maxWidth: 400,
          margin: '0 auto',
          width: '100%'
        }}
      >
        <div className="leacture-card-inner">
          <iframe
            src={leacture.videoUrl}
            title={leacture.title}
            allowFullScreen
            className="leacture-video"
            style={{
              borderRadius: 14,
              width: '100%',
              minHeight: 170,
              maxHeight: 200,
              marginBottom: 16,
              background: '#232526'
            }}
          />
          <div className="leacture-card-content">
            <h4
              className="leacture-title"
              style={{ fontSize: '1.18rem', fontWeight: 700, color: '#fff', marginBottom: 6 }}
            >
              {leacture.title}
            </h4>
            {/* New Course Title Badge */}
            <div
              style={{
                fontWeight: 600,
                fontSize: 12,
                marginBottom: 8,
                padding: '2px 8px',
                backgroundColor: '#43cea2cc',
                color: '#232526',
                borderRadius: 8,
                display: 'inline-block',
                fontStyle: 'italic',
                userSelect: 'none',
              }}
              title={`This video belongs to the course: ${leacture.courseTitle}`}
            >
              Course: {leacture.courseTitle}
            </div>

            <div
              className="leacture-category"
              style={{
                fontWeight: 500,
                fontSize: 13,
                marginBottom: 8,
                borderRadius: 8,
                padding: '3px 10px',
                display: 'inline-block',
                background: CATEGORY_COLORS[leacture.category] || '#6c63ff',
                color: '#fff',
              }}
            >
              {leacture.category}
            </div>
            <p
              className="leacture-desc"
              style={{ color: '#e0e0e0', fontSize: 15, marginBottom: 0 }}
            >
              {leacture.desc || 'No description available.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


export default function Leactures() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [layout, setLayout] = useState('grid');

  useEffect(() => {
    async function fetchCourses() {
      setLoading(true);
      try {
        const token = localStorage.getItem('lms_token');
        const res = await fetch('http://localhost:3001/api/courses', {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setCourses(data);
        } else {
          toast.error('Failed to fetch courses');
        }
      } catch (err) {
        toast.error('Network error');
      }
      setLoading(false);
    }
    fetchCourses();
  }, []);

  // Flatten curriculum from all courses
  const allLeactures = useMemo(() => {
    return courses.flatMap(course =>
      course.curriculum.map(video => ({
        ...video,
        category: course.category,
        desc: course.description,
        courseTitle: course.title
      }))
    );
  }, [courses]);

  const filteredLeactures = useMemo(() =>
    allLeactures.filter(l =>
      (category === 'All' || l.category === category) &&
      ((l.title?.toLowerCase() || '').includes(search.toLowerCase()) ||
       (l.desc?.toLowerCase() || '').includes(search.toLowerCase()))
    ),
    [allLeactures, category, search]
  );

  return (
    <div
      className="instructor-leactures-root"
      style={{
        position: 'relative',
        minHeight: '100vh',
        background: '#f5f6fa',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <InstructorHeader />
      <main
        className="leactures-main-section"
        style={{
          flex: 1,
          background: '#374151',
          borderRadius: 22,
          boxShadow: '0 4px 32px #23252618',
          margin: '24px auto',
          width: '100%',
          maxWidth: 1200
        }}
      >
        <div className="leactures-content-center">
          <motion.h2
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="leactures-heading"
          >
            Video Leactures
          </motion.h2>

          <div className="leactures-controls">
            <div className="leactures-categories">
              {DEMO_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`leactures-category-btn${category === cat ? ' active' : ''}`}
                  style={{
                    background: CATEGORY_COLORS[cat],
                    color: category === cat ? '#232526' : '#fff',
                    fontWeight: category === cat ? 700 : 500,
                    border: category === cat ? '2px solid #ffd700' : 'none',
                    boxShadow: category === cat ? '0 2px 12px #ffd70044' : '0 2px 12px #6c63ff22'
                  }}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="leactures-search-layout">
              <div className="leactures-searchbar">
                <FaSearch style={{ marginRight: 6, color: '#6c63ff' }} />
                <input
                  type="text"
                  placeholder="Search leactures..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="leactures-search-input"
                />
              </div>
              <div className="leactures-layout-toggle">
                <button
                  className={layout === 'grid' ? 'active' : ''}
                  onClick={() => setLayout('grid')}
                  style={{ color: layout === 'grid' ? '#43cea2' : '#6a11cb' }}
                >
                  <FaThLarge />
                </button>
                <button
                  className={layout === 'list' ? 'active' : ''}
                  onClick={() => setLayout('list')}
                  style={{ color: layout === 'list' ? '#f7971e' : '#ff5858' }}
                >
                  <FaThList />
                </button>
              </div>
            </div>
          </div>

          <div className={`leactures-list ${layout}`}>
            {loading ? (
              <div className="no-leactures">Loading...</div>
            ) : filteredLeactures.length === 0 ? (
              <div className="no-leactures">No leactures found.</div>
            ) : (
              filteredLeactures.map(leacture => (
                
                <LeactureCard key={leacture._id} leacture={leacture} />
              ))
            )}
          </div>
        </div>
      </main>
      <InstructorFooter />
    </div>
  );
}
