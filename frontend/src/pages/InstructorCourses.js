import React, { useState, useEffect } from 'react';
import InstructorHeader from '../components/InstructorHeader';
import InstructorFooter from '../components/InstructorFooter';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';

export default function InstructorCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      setLoading(true);
      try {
        const token = localStorage.getItem('lms_token');
        const res = await fetch('/api/courses', {
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

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f6f7fb 0%, #e3e6f3 100%)', display: 'flex', flexDirection: 'column' }}>
      <InstructorHeader />
      <main style={{ flex: 1, maxWidth: 900, margin: '0 auto', padding: '32px 16px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ textAlign: 'center', fontWeight: 700, fontSize: '2rem', color: '#185a9d', margin: 0 }}>My Courses</h2>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/instructor/upload-course" style={{ background: 'linear-gradient(90deg, #43cea2 0%, #00bfff 100%)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 700, fontSize: 17, textDecoration: 'none', marginLeft: 18 }}>+ Upload New</Link>
            <Link to="/instructor/approve-payments" style={{ background: '#ffd700', color: '#232526', border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 700, fontSize: 17, textDecoration: 'none' }}>Approve Payments</Link>
          </div>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', marginTop: 60 }}>Loading courses...</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {courses.map(course => (
              <li key={course._id || course.id} style={{ background: '#fff', marginBottom: 16, borderRadius: 12, padding: 18, boxShadow: '0 2px 16px #2325260a' }}>
                <h3 style={{ margin: 0, color: 'black' }}>{course.title}</h3>
                <div style={{ color: '#555', marginTop: 6 }}>{course.description}</div>
                <div style={{ marginTop: 10, color: '#00bfff', fontWeight: 600 }}>
                  {course.isFree ? 'Free' : `Rs. ${course.price} (${course.paymentMethod === 'JazzCash' ? 'JazzCash' : 'Meezan Bank'})`}
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
      <InstructorFooter />
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar newestOnTop />
    </div>
  );
}
