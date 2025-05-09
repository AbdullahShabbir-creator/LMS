import React, { useEffect, useState } from 'react';
import InstructorHeader from '../components/InstructorHeader';
import InstructorFooter from '../components/InstructorFooter';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function InstructorApprovePayments() {
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
      } catch {
        toast.error('Network error');
      }
      setLoading(false);
    }
    fetchCourses();
  }, []);

  const handleAction = async (courseId, requestId, action) => {
    const token = localStorage.getItem('lms_token');
    const res = await fetch(`/api/courses/${courseId}/approve-payment/${requestId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action })
    });
    const data = await res.json();
    if (res.ok) {
      toast.success(data.message);
      // Refresh courses
      setCourses(courses => courses.map(c => c._id === courseId ? {
        ...c,
        paymentRequests: c.paymentRequests.map(r => r._id === requestId ? { ...r, status: action === 'approve' ? 'approved' : 'rejected', processedAt: new Date() } : r)
      } : c));
    } else {
      toast.error(data.message || 'Error processing request');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f6f7fb 0%, #e3e6f3 100%)', display: 'flex', flexDirection: 'column' }}>
      <InstructorHeader />
      <main style={{ flex: 1, maxWidth: 900, margin: '0 auto', padding: '32px 16px', width: '100%' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24, fontWeight: 700, fontSize: '2rem', color: '#185a9d' }}>Approve Payment Requests</h2>
        {loading ? (
          <div style={{ textAlign: 'center', marginTop: 60 }}>Loading...</div>
        ) : (
          <>
            {courses.length === 0 && <div>No courses found.</div>}
            {courses.map(course => (
              <div key={course._id} style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 16px #2325260a', marginBottom: 28, padding: 22 }}>
                <h3 style={{ margin: 0, color: '#185a9d' }}>{course.title}</h3>
                <div style={{ color: '#888', marginBottom: 8 }}>Category: {course.category} | Price: {course.isFree ? 'Free' : `Rs. ${course.price}`}</div>
                <div>
                  <b>Pending Payment Requests:</b>
                  {(!course.paymentRequests || course.paymentRequests.length === 0) && <div style={{ color: '#aaa', marginTop: 6 }}>No payment requests.</div>}
                  {course.paymentRequests && course.paymentRequests.filter(r => r.status === 'pending').length > 0 && (
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                      {course.paymentRequests.filter(r => r.status === 'pending').map(r => (
                        <li key={r._id} style={{ marginBottom: 10, padding: 10, background: '#f6f7fb', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <div><b>Name:</b> {r.name}</div>
                            <div><b>Phone:</b> {r.phone}</div>
                            <div><b>Reference:</b> {r.reference}</div>
                            <div style={{ fontSize: 13, color: '#888' }}>Requested: {new Date(r.requestedAt).toLocaleString()}</div>
                          </div>
                          <div>
                            <button onClick={() => handleAction(course._id, r._id, 'approve')} style={{ background: 'linear-gradient(90deg, #43cea2 0%, #00bfff 100%)', color: '#fff', border: 'none', borderRadius: 7, padding: '7px 18px', fontWeight: 700, marginRight: 8, cursor: 'pointer' }}>Approve</button>
                            <button onClick={() => handleAction(course._id, r._id, 'reject')} style={{ background: '#ff5252', color: '#fff', border: 'none', borderRadius: 7, padding: '7px 18px', fontWeight: 700, cursor: 'pointer' }}>Reject</button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </main>
      <InstructorFooter />
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar newestOnTop />
    </div>
  );
}
