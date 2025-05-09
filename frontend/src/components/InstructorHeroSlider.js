import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-fade';
import { EffectFade, Autoplay, Pagination } from 'swiper/modules';
import { useEffect, useRef } from 'react';
import * as VANTA from 'vanta/dist/vanta.waves.min';
import '../styles/instructor.modern.css';

export default function InstructorHeroSlider() {
  const navigate = useNavigate();
  const vantaRef = useRef();
  const vantaEffect = useRef(null);

  useEffect(() => {
    if (!vantaEffect.current && vantaRef.current) {
      vantaEffect.current = VANTA.default({
        el: vantaRef.current,
        mouseControls: true,
        touchControls: true,
        minHeight: 320.0,
        minWidth: 200.0,
        scale: 1.0,
        color: 0x6c63ff,
        shininess: 35.0,
        waveHeight: 18.0,
        waveSpeed: 0.55,
        zoom: 0.95,
        backgroundColor: 0x232526,
      });
    }
    return () => { if (vantaEffect.current) { vantaEffect.current.destroy(); vantaEffect.current = null; } };
  }, []);

  const slides = [
    {
      title: 'Welcome Back, Instructor!',
      sub: 'Manage your courses, inspire students, and grow your teaching business with YourLMS.',
      cta: 'Go to Dashboard',
      ctaLink: '/instructor/dashboard',
    },
    {
      title: 'Inspire Students Worldwide',
      sub: 'Create engaging courses, upload lectures, and reach a global audience.',
      cta: 'Manage Courses',
      ctaLink: '/instructor/courses',
    },
    {
      title: 'Track Your Success',
      sub: 'View analytics, earnings, and student progress in real time.',
      cta: 'View Analytics',
      ctaLink: '/instructor/analytics',
    },
  ];

  return (
    <section className="instructor-hero-slider">
      <div className="hero-bg-3d" ref={vantaRef} />
      <Swiper
        effect="fade"
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop
        className="hero-swiper"
      >
        {slides.map((slide, i) => (
          <SwiperSlide key={i}>
            <motion.div
              className="hero-slider-content"
              initial={{ x: -80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <motion.h1 className="hero-title" initial={{ y: -40 }} animate={{ y: 0 }} transition={{ delay: 0.2 }}>
                {slide.title}
              </motion.h1>
              <motion.p className="hero-subtext" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                {slide.sub}
              </motion.p>
              <motion.button
                className="hero-cta-btn"
                whileHover={{ scale: 1.07 }}
                onClick={() => navigate(slide.ctaLink)}
              >
                {slide.cta}
              </motion.button>
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
