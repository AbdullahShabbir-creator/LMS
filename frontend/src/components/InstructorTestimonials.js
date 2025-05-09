import React from 'react';
import { motion } from 'framer-motion';
import '../styles/instructor.modern.css';

const testimonials = [
  {
    name: 'Sarah K.',
    text: 'Teaching on YourLMS has connected me to thousands of eager students and provided a seamless experience!',
    stat: '500+ students taught',
  },
  {
    name: 'James L.',
    text: 'The analytics and earnings dashboard are top-notch. I have full control over my content and income.',
    stat: '1M+ revenue generated',
  },
];

const advantages = [
  'Large student audience',
  'Secure earnings',
  'Modern dashboard',
  'Full control over content',
];

export default function InstructorTestimonials() {
  return (
    <section className="instructor-testimonials">
      <motion.div className="testimonials-header" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
        <h2>🌟 Why Choose Our Platform to Teach?</h2>
        <div className="advantages-list">
          {advantages.map((adv, i) => (
            <motion.div key={adv} className="advantage-item" initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }}>
              {adv}
            </motion.div>
          ))}
        </div>
      </motion.div>
      <div className="testimonials-grid">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            className="testimonial-card"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 * i }}
          >
            <div className="testimonial-text" style={{ color: '#ffffff' }}>"{t.text}"</div>
            <div className="testimonial-author">- {t.name}</div>
            <div className="testimonial-stat">{t.stat}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
