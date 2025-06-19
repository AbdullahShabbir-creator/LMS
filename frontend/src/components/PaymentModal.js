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

  const handlePay = async (e) => {
    e.preventDefault();

    if (!paymentDetails.name || !paymentDetails.phone || !paymentDetails.reference) {
      setError('All fields are required.');
      return;
    }

    setError('');
    setLoading(true);

    // Simulate request (replace with real API call if needed)
    setTimeout(() => {
      setLoading(false);
      setStep('paid');

      setTimeout(() => {
        setStep('info');
        onPaymentSuccess(paymentDetails);
        onClose();
        setPaymentDetails({ name: '', phone: '', reference: '' });
      }, 1500);
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
          <button
            className="payment-modal-close"
            onClick={() => {
              setStep('info');
              setPaymentDetails({ name: '', phone: '', reference: '' });
              setError('');
              onClose();
            }}
          >
            <FaTimes />
          </button>

          {step === 'info' && (
            <>
              <h2 className="payment-modal-title">
                Pay for <span>{course.title}</span>
              </h2>

              <div className="payment-modal-details">
                <div><strong>Price:</strong> Rs. {course.price}</div>
                <div>
                  <strong>Payment Method:</strong> {course.paymentMethod === 'JazzCash' ? 'JazzCash' : 'Meezan Bank'}
                </div>
                {course.paymentMethod === 'JazzCash' && (
                  <div><strong>JazzCash Number:</strong> {course.jazzCashNumber}</div>
                )}
                {course.paymentMethod === 'MeezanBank' && (
                  <div><strong>Meezan Bank Account:</strong> {course.meezanBankAccount}</div>
                )}
              </div>

              <form className="payment-modal-form" onSubmit={handlePay}>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={paymentDetails.name}
                  onChange={e => setPaymentDetails({ ...paymentDetails, name: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Your Phone Number"
                  value={paymentDetails.phone}
                  onChange={e => setPaymentDetails({ ...paymentDetails, phone: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Transaction Reference"
                  value={paymentDetails.reference}
                  onChange={e => setPaymentDetails({ ...paymentDetails, reference: e.target.value })}
                  required
                />

                {error && <div className="payment-modal-error">{error}</div>}

                <button
                  type="submit"
                  className="payment-modal-pay-btn"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit Payment Request'}
                </button>
              </form>
            </>
          )}

          {step === 'paid' && (
            <div className="payment-modal-success">
              <FaCheckCircle size={48} color="#4caf50" />
              <div>Payment request submitted! Waiting for instructor approval.</div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
