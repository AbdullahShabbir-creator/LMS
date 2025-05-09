import React, { useState } from 'react';
import InstructorHeader from '../components/InstructorHeader';
import InstructorFooter from '../components/InstructorFooter';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { authHeader } from '../utils/auth';

export default function InstructorNotifications() {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  async function handleSend() {
    if (!message.trim()) return;
    setSending(true);
    
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...authHeader()
      };
      
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ 
          message,
          timestamp: new Date().toISOString()
        }),
      });
      
      if (res.ok) {
        toast.success('Notification sent successfully!');
        setMessage('');
      } else {
        if (res.status === 401) {
          toast.error('Authentication error. Please login again.');
        } else {
          toast.error('Failed to send notification! Status: ' + res.status);
        }
        
        try {
          const errorData = await res.json();
          console.error('Error details:', errorData);
        } catch (e) {
          console.error('Could not parse error response');
        }
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
      <main style={{ flex: 1, maxWidth: 600, margin: '0 auto', padding: '32px 16px', width: '100%' }}>
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
      </main>
      <InstructorFooter />
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar newestOnTop />
    </div>
  );
}
