import React, { useState, useEffect } from 'react';
import InstructorHeader from '../components/InstructorHeader';
import InstructorFooter from '../components/InstructorFooter';
import { ToastContainer, toast } from 'react-toastify';
import { getInstructorPaymentRequests, approveInstructorPayment } from '../services/api';

import 'react-toastify/dist/ReactToastify.css';
import { authHeader } from '../utils/auth';

export default function InstructorNotifications() {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [paymentRequests, setPaymentRequests] = useState([]);

  useEffect(() => {
    fetchPaymentRequests();
  }, []);

  async function fetchPaymentRequests() {
  const { requests, error } = await getInstructorPaymentRequests();
  if (error) {
    toast.error(error);
  } else {
    setPaymentRequests(requests);
  }
}

async function handleApprovePayment(courseId, studentId) {
  const { success, error } = await approveInstructorPayment(courseId, studentId);
  if (success) {
    toast.success('Payment approved!');
    fetchPaymentRequests();
  } else {
    toast.error(error || 'Error approving payment');
  }
}


  async function handleSend() {
    if (!message.trim()) return;
    setSending(true);
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ message, timestamp: new Date().toISOString() }),
      });

      if (res.ok) {
        toast.success('Notification sent successfully!');
        setMessage('');
      } else {
        toast.error(`Failed to send notification! Status: ${res.status}`);
      }
    } catch (err) {
      console.error('Network error:', err);
      toast.error('Network error! Please check your connection.');
    }
    setSending(false);
  }

  

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f6f7fb 0%, #e3e6f3 100%)', display: 'flex', flexDirection: 'column' }}>
      <InstructorHeader />
      <main style={{ flex: 1, maxWidth: 800, margin: '0 auto', padding: '32px 16px', width: '100%' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24, fontWeight: 700, fontSize: '2rem', color: '#185a9d' }}>Send Notification</h2>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Type your notification message here..."
          rows={5}
          style={{ width: '100%', borderRadius: 10, border: '1px solid #bbb', padding: 12, fontSize: 16, marginBottom: 18 }}
        />
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
          <button
            onClick={handleSend}
            disabled={sending || !message.trim()}
            style={{
              background: '#185a9d',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '10px 24px',
              fontWeight: 600,
              fontSize: 16,
              cursor: sending || !message.trim() ? 'not-allowed' : 'pointer',
              opacity: sending || !message.trim() ? 0.7 : 1,
              transition: 'all 0.3s ease'
            }}
          >
            {sending ? 'Sending...' : 'Send Notification'}
          </button>
        </div>

        <h3 style={{ marginTop: 40, fontSize: '1.5rem', color: '#333' }}>Payment Requests</h3>
        {paymentRequests.length === 0 ? (
          <p>No payment requests found.</p>
        ) : (
          paymentRequests.map(course => (
            <div key={course._id} style={{ marginBottom: 24, padding: 16, background: '#fff', borderRadius: 8, boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
              <h4 style={{ marginBottom: 12, color: '#185a9d' }}>{course.title}</h4>
              {course.paymentRequests.length === 0 ? (
                <p style={{ fontStyle: 'italic' }}>No requests for this course.</p>
              ) : (
               course.paymentRequests.map(req => (
  <div key={req._id} style={{ padding: 8, borderBottom: '1px solid #ddd' }}>
    <p><strong>Student:</strong> {req.student?.name || 'Unknown'} ({req.student?.email || 'N/A'})</p>
    <p><strong>Phone:</strong> {req.phone || 'N/A'}</p>
    <p><strong>Reference:</strong> {req.reference || 'N/A'}</p>
    <p><strong>Requested At:</strong> {new Date(req.requestedAt).toLocaleString()}</p>
    
    <button
      onClick={() => handleApprovePayment(course._id, req.student?._id)}
      disabled={req.status === 'approved'}
      style={{
        background: req.status === 'approved' ? '#6c757d' : '#28a745',
        color: '#fff',
        border: 'none',
        borderRadius: 5,
        padding: '6px 12px',
        marginTop: 6,
        cursor: req.status === 'approved' ? 'not-allowed' : 'pointer',
        opacity: req.status === 'approved' ? 0.7 : 1,
        transition: 'all 0.3s ease'
      }}
    >
      {req.status === 'approved' ? 'Already Approved' : 'Allow Payment'}
    </button>
  </div>
))

              )}
            </div>
          ))
        )}
      </main>
      <InstructorFooter />
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar newestOnTop />
    </div>
  );
}
