import React from 'react';
import InstructorHeader from '../components/InstructorHeader';
import TechNewsSlider from '../components/TechNewsSlider';
import InstructorQuickActions from '../components/InstructorQuickActions';
import InstructorTestimonials from '../components/InstructorTestimonials';
import InstructorFooter from '../components/InstructorFooter';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/instructor.modern.css';
import '../styles/animatedBalls.css';

export default function InstructorHome() {
  return (
    <div className="instructor-home-root" style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      {/* Animated 3D balls background */}
      <div className="animated-balls-bg">
        <div className="animated-ball ball1"></div>
        <div className="animated-ball ball2"></div>
        <div className="animated-ball ball3"></div>
        <div className="animated-ball ball4"></div>
        <div className="animated-ball ball5"></div>
      </div>
      <InstructorHeader />
      <main className="instructor-home-main">
        <TechNewsSlider />
        <InstructorQuickActions />
        <InstructorTestimonials />
      </main>
      <InstructorFooter />
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar newestOnTop />
    </div>
  );
}
