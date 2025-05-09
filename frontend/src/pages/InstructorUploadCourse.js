import React, { useState } from 'react';
import InstructorHeader from '../components/InstructorHeader';
import InstructorFooter from '../components/InstructorFooter';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function InstructorUploadCourse() {
  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
    price: 0,
    isFree: true,
    paymentMethod: 'None',
    jazzCashNumber: '',
    meezanBankAccount: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'isFree' && checked ? { price: 0, paymentMethod: 'None', jazzCashNumber: '', meezanBankAccount: '' } : {})
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form)
      });
      if (res.ok) {
        toast.success('Course uploaded!');
        setForm({
          title: '', category: '', description: '', price: 0, isFree: true, paymentMethod: 'None', jazzCashNumber: '', meezanBankAccount: ''
        });
      } else {
        toast.error('Failed to upload course');
      }
    } catch (err) {
      toast.error('Network error');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f6f7fb 0%, #e3e6f3 100%)', display: 'flex', flexDirection: 'column' }}>
      <InstructorHeader />
      <main style={{ flex: 1, maxWidth: 540, margin: '0 auto', padding: '32px 16px', width: '100%' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24, fontWeight: 700, fontSize: '2rem', color: '#185a9d' }}>Upload New Course</h2>
        <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 16px #2325260a', padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input name="title" value={form.title} onChange={handleChange} required placeholder="Course Title" style={{ padding: 10, borderRadius: 7, border: '1.5px solid #00bfff44', fontSize: 16 }} />
          <input name="category" value={form.category} onChange={handleChange} required placeholder="Category" style={{ padding: 10, borderRadius: 7, border: '1.5px solid #00bfff44', fontSize: 16 }} />
          <textarea name="description" value={form.description} onChange={handleChange} required placeholder="Description" rows={3} style={{ padding: 10, borderRadius: 7, border: '1.5px solid #00bfff44', fontSize: 16 }} />
          <label style={{ fontSize: 15, color: '#185a9d', fontWeight: 600 }}>
            <input type="checkbox" name="isFree" checked={form.isFree} onChange={handleChange} style={{ marginRight: 7 }} />
            Free Course
          </label>
          {!form.isFree && (
            <>
              <input name="price" type="number" min="1" value={form.price} onChange={handleChange} required placeholder="Price (PKR)" style={{ padding: 10, borderRadius: 7, border: '1.5px solid #00bfff44', fontSize: 16 }} />
              <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} required style={{ padding: 10, borderRadius: 7, border: '1.5px solid #00bfff44', fontSize: 16 }}>
                <option value="None">Select Payment Method</option>
                <option value="JazzCash">JazzCash</option>
                <option value="MeezanBank">Meezan Bank</option>
              </select>
              {form.paymentMethod === 'JazzCash' && (
                <input name="jazzCashNumber" value={form.jazzCashNumber} onChange={handleChange} required placeholder="JazzCash Mobile Number" style={{ padding: 10, borderRadius: 7, border: '1.5px solid #00bfff44', fontSize: 16 }} />
              )}
              {form.paymentMethod === 'MeezanBank' && (
                <input name="meezanBankAccount" value={form.meezanBankAccount} onChange={handleChange} required placeholder="Meezan Bank Account" style={{ padding: 10, borderRadius: 7, border: '1.5px solid #00bfff44', fontSize: 16 }} />
              )}
            </>
          )}
          <button disabled={loading} style={{ background: 'linear-gradient(90deg, #43cea2 0%, #00bfff 100%)', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 0', fontWeight: 700, fontSize: 18, cursor: 'pointer', marginTop: 10 }}>
            {loading ? 'Uploading...' : 'Upload Course'}
          </button>
        </form>
      </main>
      <InstructorFooter />
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar newestOnTop />
    </div>
  );
}
