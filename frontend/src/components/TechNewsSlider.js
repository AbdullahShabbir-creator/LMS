import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Autoplay } from 'swiper/modules';
import { motion } from 'framer-motion';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import '../styles/technews-slider.css';

const news = [
  {
    title: "AI Revolutionizes Education",
    desc: "Artificial intelligence is transforming the way students and teachers interact with educational content.",
    link: "https://techcrunch.com/ai-education"
  },
  {
    title: "Quantum Computing Breakthrough",
    desc: "Researchers achieve a new milestone in quantum computing, opening doors for secure communications.",
    link: "https://thenextweb.com/quantum-computing"
  },
  {
    title: "5G Networks Expand Globally",
    desc: "The rollout of 5G technology accelerates, promising faster and more reliable internet for all.",
    link: "https://wired.com/5g-expansion"
  },
  {
    title: "Virtual Reality in Classrooms",
    desc: "VR technology brings immersive experiences to students, making learning more engaging.",
    link: "https://edtechmagazine.com/vr-classrooms"
  },
  {
    title: "Blockchain Secures Online Learning",
    desc: "Blockchain is being used to verify credentials and secure online coursework.",
    link: "https://coindesk.com/blockchain-education"
  },
];

export default function TechNewsSlider() {
  const swiperRef = useRef(null);
  return (
    <section className="technews-slider-section">
      <Swiper
        ref={swiperRef}
        effect={"coverflow"}
        grabCursor={true}
        centeredSlides={true}
        slidesPerView={1.15}
        loop={true}
        autoplay={{ delay: 2800, disableOnInteraction: false }}
        coverflowEffect={{
          rotate: 30,
          stretch: 0,
          depth: 120,
          modifier: 1.8,
          slideShadows: true,
        }}
        modules={[EffectCoverflow, Autoplay]}
        className="technews-swiper"
        breakpoints={{
          600: { slidesPerView: 1.5 },
          900: { slidesPerView: 2.1 },
        }}
      >
        {news.map((item, idx) => (
          <SwiperSlide key={idx}>
            <motion.div
              className="technews-slide-card"
              whileHover={{ scale: 1.06, rotateY: 8, boxShadow: '0 8px 32px #6c63ff44' }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            >
              <h4 className="technews-title">{item.title}</h4>
              <p className="technews-desc">{item.desc}</p>
              <a href={item.link} className="technews-link" target="_blank" rel="noopener noreferrer">Read more</a>
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
