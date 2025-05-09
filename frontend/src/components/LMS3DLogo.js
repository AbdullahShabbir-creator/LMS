import React from 'react';
import { motion } from 'framer-motion';

export default function LMS3DLogo({ size = 54 }) {
  return (
    <motion.div
      className="lms-3d-logo"
      initial={{ rotateY: 0 }}
      animate={{ rotateY: [0, 360] }}
      transition={{ repeat: Infinity, duration: 7, ease: 'linear' }}
      style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="lms3d_grad" cx="50%" cy="50%" r="65%">
            <stop offset="0%" stopColor="#ffd700" />
            <stop offset="70%" stopColor="#6c63ff" />
            <stop offset="100%" stopColor="#232526" />
          </radialGradient>
        </defs>
        <ellipse cx="32" cy="32" rx="28" ry="28" fill="url(#lms3d_grad)" filter="url(#shadow)" />
        <text x="50%" y="56%" textAnchor="middle" fill="#fff" fontSize="26" fontWeight="bold" fontFamily="Poppins, Urbanist, DM Sans, sans-serif" style={{ textShadow: '0 2px 12px #232526' }}>
          LMS
        </text>
        <ellipse cx="32" cy="38" rx="20" ry="6" fill="#fff" opacity="0.12" />
      </svg>
    </motion.div>
  );
}
