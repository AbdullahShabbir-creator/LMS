import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import BallsBackground from '../components/BallsBackground';
import { FaSignInAlt, FaGraduationCap, FaBook, FaSchool } from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import testimonials from '../testimonials';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import './Home.css'; // We'll create this file for better CSS organization

const news = [
  { title: 'AI Revolutionizes Education', desc: 'Artificial Intelligence is transforming the way students learn and teachers instruct.', img: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80' },
  { title: 'React 19 Released', desc: 'The latest version of React brings performance improvements and new hooks.', img: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=400&q=80' },
  { title: 'Web3 and Blockchain in LMS', desc: 'Decentralized tech is finding its way into online education platforms.', img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80' },
  { title: 'EdTech Startups Raise $1B+', desc: 'Investment in educational technology continues to surge worldwide.', img: 'https://images.unsplash.com/photo-1454023492550-5696f8ff10e1?auto=format&fit=crop&w=400&q=80' },
];

export default function Home() {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const logoRef = useRef(null);

  // Animate the 3D logo on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (logoRef.current) {
        const scrollY = window.scrollY;
        const rotation = Math.min(scrollY * 0.02, 15); // Limit rotation to 15deg
        
        logoRef.current.style.transform = `perspective(1000px) rotateY(${rotation}deg)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="home-container">
      <BallsBackground />
      {/* Header */}
      <header className="home-header">
        {/* New 3D Animated Logo */}
        <div className="animated-logo-wrapper" ref={logoRef}>
          <motion.div
            className="animated-logo"
            initial={{ scale: 0.9, rotateY: -30 }}
            animate={{ 
              scale: 1,
              rotateY: 0,
              transition: { duration: 1.2, type: 'spring' }
            }}
            whileHover={{ 
              scale: 1.05,
              rotateY: 5,
              transition: { duration: 0.5, ease: "easeOut" }
            }}
            onClick={() => navigate('/')}
          >
            <div className="logo-cube">
              <div className="logo-cube-face logo-cube-front">
                <FaGraduationCap />
              </div>
              <div className="logo-cube-face logo-cube-back">
                <FaBook />
              </div>
              <div className="logo-cube-face logo-cube-left">
                <FaSchool />
              </div>
              <div className="logo-cube-face logo-cube-right">
                <span>LMS</span>
              </div>
              <div className="logo-cube-face logo-cube-top">
                <span>EDU</span>
              </div>
              <div className="logo-cube-face logo-cube-bottom">
                <span>3D</span>
              </div>
            </div>
            <motion.span 
              className="logo-text"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              whileHover={{ 
                scale: 1.07, 
                color: '#ffffff',
                transition: { duration: 0.3 }
              }}
            >
              EduSphere
            </motion.span>
          </motion.div>
        </div>

        {/* Navigation buttons - Always visible without toggle */}
        <div className="nav-buttons" ref={menuRef}>
          <button
            onClick={() => navigate('/login')}
            className="login-button"
          >
            <FaSignInAlt className="login-icon" />
            <span>Login</span>
          </button>
        </div>
      </header>

      {/* Main Section */}
      <main className="home-main">
        <motion.h1
          initial={{ y: -60, scale: 0.8, rotateY: 0, textShadow: '0 0px 0px rgba(0, 191, 255, 1)' }}
          animate={{ y: 0, scale: 1, rotateY: 360, textShadow: '0 8px 32px rgba(0, 191, 255, 1), 0 2px 36px rgba(255, 255, 255, 1)' }}
          whileHover={{ scale: 1.07, color: 'rgba(255, 229, 59, 1)', rotateY: 720, textShadow: '0 8px 32px rgba(127, 83, 172, 1), 0 2px 36px rgba(255, 255, 255, 1)' }}
          transition={{ type: 'spring', stiffness: 160, duration: 1.2 }}
          className="main-title"
        >
          Welcome to LMS
        </motion.h1>
        
        {/* Slider Section */}
        <section className="slider-section">
          <Swiper spaceBetween={18} slidesPerView={1} loop={true} className="news-swiper">
            {news.map((item, idx) => (
              <SwiperSlide key={idx}>
                <motion.div
                  whileHover={{ scale: 1.03, boxShadow: '0 8px 32px rgba(127, 83, 172, 0.2)' }}
                  transition={{ type: 'spring', stiffness: 180 }}
                  className="news-slide"
                >
                  <img src={item.img} alt={item.title} className="news-image" />
                  <div className="news-content">
                    <span className="news-title">{item.title}</span>
                    <span className="news-desc">{item.desc}</span>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </section>
        
        {/* Why Choose Section */}
        <motion.section
          initial={{ opacity: 0, y: 60, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 120 }}
          className="why-choose-section"
        >
          <img src="https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=200&q=80" alt="students" className="why-choose-image" />
          <div className="why-choose-content">
            <motion.h2
              whileHover={{ scale: 1.04, color: 'rgba(0, 191, 255, 1)', textShadow: '0 2px 18px rgba(127, 83, 172, 1)' }}
              transition={{ type: 'spring', stiffness: 160 }}
              className="section-title"
            >
              Why Choose EduSphere?
            </motion.h2>
            <p className="section-text">
              Experience the next generation of online learning with 3D animated interfaces, real-time collaboration, and expertly curated courses. Our platform is designed for engagement, accessibility, and success—anywhere in the world.
            </p>
          </div>
        </motion.section>
        
        {/* Testimonials Section */}
        <section className="testimonials-section">
          <motion.h2
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={{ scale: 1.05, color: 'rgba(0, 191, 255, 1)', textShadow: '0 2px 18px rgba(127, 83, 172, 1)' }}
            transition={{ duration: 0.8, type: 'spring', stiffness: 120 }}
            className="testimonials-title"
          >
            What Our Users Say
          </motion.h2>
          
          <div className="testimonials-grid">
            {testimonials.map((t, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05, boxShadow: '0 16px 48px rgba(0, 191, 255, 0.27)', borderColor: 'rgba(0, 191, 255, 0.4)' }}
                transition={{ type: 'spring', stiffness: 180 }}
                className="testimonial-card"
              >
                <motion.div
                  initial={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 1) 90%, rgba(0, 191, 255, 0.1) 100%)' }}
                  animate={{ 
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 1) 90%, rgba(0, 191, 255, 0.1) 100%)',
                    transition: { duration: 10, repeat: Infinity, repeatType: 'loop' }
                  }}
                  className="testimonial-bg"
                />
                <motion.img
                  src={`https://randomuser.me/api/portraits/${idx % 2 === 0 ? 'women' : 'men'}/${25 + idx}.jpg`}
                  alt={t.name}
                  className="testimonial-image"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 + idx * 0.1, type: 'spring', stiffness: 180 }}
                />
                <motion.span
                  whileHover={{ scale: 1.08, color: 'rgba(127, 83, 172, 1)', textShadow: '0 2px 18px rgba(0, 191, 255, 1)' }}
                  className="testimonial-name"
                >
                  {t.name}
                </motion.span>
                <span className="testimonial-text">{t.text}</span>
                <span className="testimonial-role">{t.role}</span>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
