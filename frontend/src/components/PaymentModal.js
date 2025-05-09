import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCheckCircle } from 'react-icons/fa';
import './PaymentModal.css';

export default function PaymentModal({ open, onClose, course, onPaymentSuccess }) {
  const [step, setStep] = useState('info'); // info | paid | error
  const [paymentDetails, setPaymentDetails] = useState({
    name: '',
    phone: '',
    reference: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open || !course) return null;

  const handlePay = async e => {
    e.preventDefault();
    if (!paymentDetails.name || !paymentDetails.phone || !paymentDetails.reference) {
      setError('All fields are required.');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('paid');
      setTimeout(() => {
        setStep('info');
        onPaymentSuccess(paymentDetails);
        onClose();
        setPaymentDetails({ name: '', phone: '', reference: '' });
      }, 1400);
    }, 1200);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="payment-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="payment-modal"
          initial={{ scale: 0.8, y: 80, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.8, y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 160, damping: 20 }}
        >
          <button className="payment-modal-close" onClick={() => {
            setStep('info');
            setPaymentDetails({ name: '', phone: '', reference: '' });
            setError('');
            onClose();
          }}><FaTimes /></button>
          {step === 'info' && (
            <>
              <h2 className="payment-modal-title">Pay for <span>{course.title}</span></h2>
              <div className="payment-modal-details">
                <div><b>Price:</b> Rs. {course.price}</div>
                <div><b>Payment Method:</b> {course.paymentMethod === 'JazzCash' ? 'JazzCash' : 'Meezan Bank'}</div>
                {course.paymentMethod === 'JazzCash' && (
                  <div><b>JazzCash Number:</b> {course.jazzCashNumber}</div>
                )}
                {course.paymentMethod === 'MeezanBank' && (
                  <div><b>Meezan Bank Account:</b> {course.meezanBankAccount}</div>
                )}
              </div>
              <form className="payment-modal-form" onSubmit={handlePay}>
                <input type="text" required placeholder="Your Name" value={paymentDetails.name} onChange={e => setPaymentDetails({ ...paymentDetails, name: e.target.value })} />
                <input type="text" required placeholder="Your Phone Number" value={paymentDetails.phone} onChange={e => setPaymentDetails({ ...paymentDetails, phone: e.target.value })} />
                <input type="text" required placeholder="Transaction Reference" value={paymentDetails.reference} onChange={e => setPaymentDetails({ ...paymentDetails, reference: e.target.value })} />
                {error && <div className="payment-modal-error">{error}</div>}
                <button className="payment-modal-pay-btn" type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit Payment Request'}</button>
              </form>
            </>
          )}
          {step === 'paid' && (
            <div className="payment-modal-success">
              <FaCheckCircle size={48} />
              <div>Payment Request Submitted! Waiting for Instructor Approval.</div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
