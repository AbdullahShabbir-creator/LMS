import React from 'react';
import './StudentFooter.css';
import { motion } from 'framer-motion';

export default function StudentFooter() {
  return (
    <footer className="student-footer student-footer__custom">
      <motion.span
        className="footer-logo-3d"
        animate={{ rotate: [0, 360] }}
        transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
        style={{ display: 'inline-block', marginRight: 16 }}
      >
        <span role="img" aria-label="logo" style={{ fontSize: 28 }}>🎓</span>
      </motion.span>
      <span className="footer-copyright">
        {new Date().getFullYear()} MyLMS. All rights reserved.
      </span>
      <div className="footer-social">
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="footer-social-icon">
          <svg height="20" width="20" viewBox="0 0 320 512" fill="currentColor"><path d="M279.14 288l14.22-92.66h-88.91V127.92c0-25.35 12.42-50.06 52.24-50.06H293V6.26S259.5 0 225.36 0c-73.22 0-121 44.38-121 124.72v70.62H22.89V288h81.47v224h100.2V288z"/></svg>
        </a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="footer-social-icon">
          <svg height="20" width="20" viewBox="0 0 512 512" fill="currentColor"><path d="M459.4 151.7c.32 4.54.32 9.1.32 13.66 0 138.72-105.58 298.56-298.56 298.56-59.5 0-114.68-17.22-161.14-47.11 8.44 1 16.88 1.6 25.5 1.6 49.06 0 94.22-16.63 132.19-44.84-46.13-1-84.8-31.3-98.1-73 6.5 1 13.16 1.6 20.13 1.6 9.42 0 18.84-1.28 27.61-3.68-48.08-9.7-84.14-51.98-84.14-102.98v-1.28c14.08 7.82 30.22 12.54 47.43 13.16-28.26-18.84-46.78-51.02-46.78-87.39 0-19.42 5.2-37.36 14.3-52.95C100.3 180.1 210.8 233.6 329.6 240.7c-1.6-7.82-2.6-15.96-2.6-24.1 0-58.72 47.43-106.48 106.48-106.48 30.64 0 58.36 12.54 77.76 32.74 24.26-4.54 47.43-13.66 67.8-25.98-7.82 24.5-24.5 45.24-46.13 58.36 21.6-2.28 42.84-8.44 62.28-17.22-14.3 21.3-32.36 40.16-53.34 55.16z"/></svg>
        </a>
        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="footer-social-icon">
          <svg height="20" width="20" viewBox="0 0 448 512" fill="currentColor"><path d="M100.28 448H7.4V148.9h92.88zm-46.44-340C24.12 108 0 83.87 0 53.5A53.5 53.5 0 0 1 53.5 0C82.87 0 108 24.12 108 53.5c0 30.37-25.13 54.5-54.16 54.5zM447.8 448h-92.4V302.4c0-34.7-12.4-58.4-43.3-58.4-23.6 0-37.6 15.9-43.7 31.3-2.3 5.6-2.8 13.4-2.8 21.2V448h-92.4s1.2-242.4 0-267.1h92.4v37.9c-.2.3-.5.7-.7 1h.7v-1c12.3-19 34.3-46.2 83.5-46.2 60.9 0 106.7 39.7 106.7 125.2V448z"/></svg>
        </a>
      </div>
    </footer>
  );
}