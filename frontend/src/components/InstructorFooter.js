import React from 'react';
import { motion } from 'framer-motion';
import { FaLinkedin, FaTwitter, FaFacebook } from 'react-icons/fa';
import '../styles/instructor.modern.css';

export default function InstructorFooter() {
  return (
    <>
      {/* Divider */}
      <div className="footer-divider" style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.09)', margin: '0 auto 18px auto', maxWidth: 1200 }} />
      <motion.footer
        className="instructor-footer"
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        style={{ fontFamily: 'Poppins, Urbanist, DM Sans, Arial, sans-serif', fontSize: '0.97rem', color: '#f6f7fb', background: 'rgba(30,34,54,0.97)', padding: '2rem 0 1.1rem 0', marginTop: 0 }}
      >
        <div className="footer-content" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem', maxWidth: 1200, margin: '0 auto', padding: '0 1.2rem' }}>
          {/* Quick Links */}
          <div className="footer-section">
            <div className="footer-section-title" style={{ fontWeight: 600, fontSize: '1.03rem', marginBottom: 8 }}>Quick Links</div>
            <motion.a whileHover={{ color: '#ffd700', textDecoration: 'underline' }} href="/instructor/home" className="footer-link" style={{ display: 'block', marginBottom: 4, color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}>Home</motion.a>
            <motion.a whileHover={{ color: '#ffd700', textDecoration: 'underline' }} href="/instructor/dashboard" className="footer-link" style={{ display: 'block', marginBottom: 4, color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}>Dashboard</motion.a>
            <motion.a whileHover={{ color: '#ffd700', textDecoration: 'underline' }} href="/instructor/settings" className="footer-link" style={{ display: 'block', color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}>Settings</motion.a>
          </div>
          {/* Support Contact */}
          <div className="footer-section">
            <div className="footer-section-title" style={{ fontWeight: 600, fontSize: '1.03rem', marginBottom: 8 }}>Support</div>
            <a href="mailto:support@yourlms.com" className="footer-link" style={{ display: 'block', color: 'inherit', marginBottom: 4, textDecoration: 'none' }}>support@yourlms.com</a>
            <span className="footer-link" style={{ display: 'block', color: 'inherit', opacity: 0.7, fontSize: '0.97rem' }}>+1 800 123 4567</span>
          </div>
          {/* Legal Links */}
          <div className="footer-section">
            <div className="footer-section-title" style={{ fontWeight: 600, fontSize: '1.03rem', marginBottom: 8 }}>Legal</div>
            <motion.a whileHover={{ color: '#ffd700', textDecoration: 'underline' }} href="/terms" className="footer-link" style={{ display: 'block', marginBottom: 4, color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}>Terms of Use</motion.a>
            <motion.a whileHover={{ color: '#ffd700', textDecoration: 'underline' }} href="/privacy" className="footer-link" style={{ display: 'block', color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}>Privacy Policy</motion.a>
          </div>
          {/* Security Reminder */}
          <div className="footer-section">
            <div className="footer-section-title" style={{ fontWeight: 600, fontSize: '1.03rem', marginBottom: 8 }}>Security</div>
            <span style={{ display: 'block', color: '#ffd700', fontWeight: 500, fontSize: '0.97rem', opacity: 0.95 }}>Keep your account secure.</span>
          </div>
          {/* Social Media */}
          <div className="footer-section">
            <div className="footer-section-title" style={{ fontWeight: 600, fontSize: '1.03rem', marginBottom: 8 }}>Connect</div>
            <div style={{ display: 'flex', gap: '1.1rem', marginTop: 2 }}>
              <motion.a whileHover={{ scale: 1.18, color: '#1877f3' }} href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" style={{ color: '#f6f7fb', fontSize: '1.3rem', transition: 'color 0.2s' }}><FaFacebook /></motion.a>
              <motion.a whileHover={{ scale: 1.18, color: '#ffd700' }} href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" style={{ color: '#f6f7fb', fontSize: '1.3rem', transition: 'color 0.2s' }}><FaLinkedin /></motion.a>
              <motion.a whileHover={{ scale: 1.18, color: '#6c63ff' }} href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" style={{ color: '#f6f7fb', fontSize: '1.3rem', transition: 'color 0.2s' }}><FaTwitter /></motion.a>
            </div>
          </div>
        </div>
        <div className="footer-bottom" style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.97rem', opacity: 0.85 }}>
          &copy; 2025 YourLMS. All rights reserved.
        </div>
      </motion.footer>
    </>
  );
}
