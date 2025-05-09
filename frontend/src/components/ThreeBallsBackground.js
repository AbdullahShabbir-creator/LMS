import React, { useRef, useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';

const ballsConfig = [
  {
    color: 'linear-gradient(135deg, #00bfff 40%, #7f53ac 100%)',
    size: 180,
    initial: { x: -200, y: -120 },
    animate: { x: 80, y: 80 },
    duration: 14,
  },
  {
    color: 'linear-gradient(135deg, #ffe53b 40%, #ff6f61 100%)',
    size: 120,
    initial: { x: 220, y: 100 },
    animate: { x: -100, y: -60 },
    duration: 18,
  },
  {
    color: 'linear-gradient(135deg, #43cea2 40%, #185a9d 100%)',
    size: 260,
    initial: { x: 0, y: 200 },
    animate: { x: 140, y: -100 },
    duration: 22,
  },
  {
    color: 'linear-gradient(135deg, #5f72bd 40%, #9b23ea 100%)',
    size: 100,
    initial: { x: 300, y: -150 },
    animate: { x: -80, y: 120 },
    duration: 16,
  },
  {
    color: 'linear-gradient(135deg, #ff758c 40%, #ff7eb3 100%)',
    size: 150,
    initial: { x: -250, y: 180 },
    animate: { x: 180, y: -40 },
    duration: 20,
  },
];

// Pre-generate stars for consistent rendering
const starsData = Array(100).fill(0).map(() => ({
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  opacity: Math.random() * 0.5 + 0.3,
  width: `${Math.random() * 3 + 1}px`,
  height: `${Math.random() * 3 + 1}px`,
  animationDelay: `${Math.random() * 10}s`,
  animationDuration: `${Math.random() * 5 + 5}s`
}));

export default function ThreeBallsBackground() {
  // Create animation controls at the top level, one for each ball
  const control1 = useAnimation();
  const control2 = useAnimation();
  const control3 = useAnimation();
  const control4 = useAnimation();
  const control5 = useAnimation();
  
  // Store all controls in an array for easy access
  const controlsArr = [control1, control2, control3, control4, control5];
  
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Track mouse position for parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth - 0.5) * 2;
      const y = (clientY / window.innerHeight - 0.5) * 2;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Animate balls
  useEffect(() => {
    // Start the main position animations
    ballsConfig.forEach((ball, i) => {
      controlsArr[i].start({
        x: ball.animate.x,
        y: ball.animate.y,
        transition: {
          yoyo: Infinity,
          repeatType: 'reverse',
          duration: ball.duration,
          ease: 'easeInOut',
        },
      });
    });
  }, [controlsArr]);

  // Add a small parallax effect to the background based on mouse position
  const backgroundStyle = {
    position: 'fixed',
    zIndex: 0,
    width: '100vw',
    height: '100vh',
    top: 0,
    left: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
    background: `linear-gradient(
      ${135 + mousePosition.x * 5}deg, 
      #0f2027 ${0 + mousePosition.y * 5}%, 
      #2c5364 ${100 + mousePosition.x * 5}%
    )`,
    transition: 'background 0.3s ease',
  };

  return (
    <div style={backgroundStyle}>
      <div className="stars">
        {starsData.map((star, i) => (
          <div 
            key={`star-${i}`} 
            className="star"
            style={star}
          />
        ))}
      </div>
      
      {ballsConfig.map((ball, i) => {
        // Calculate rotation values based on mouse position
        const rotateX = mousePosition.y * 10 * (i % 2 ? 1 : -1);
        const rotateY = mousePosition.x * 10 * (i % 2 ? -1 : 1);
        
        return (
          <motion.div
            key={i}
            initial={ball.initial}
            animate={controlsArr[i]}
            style={{
              position: 'absolute',
              width: ball.size,
              height: ball.size,
              borderRadius: '50%',
              background: ball.color,
              filter: 'blur(4px) drop-shadow(0 8px 32px rgba(0, 0, 0, 0.5))',
              boxShadow: '0 12px 48px 0 rgba(0, 0, 0, 0.4), 0 0 60px 0 rgba(255, 255, 255, 0.3) inset',
              opacity: 0.75,
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -50%) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
            }}
            whileHover={{ 
              scale: 1.1, 
              opacity: 0.9,
              filter: 'blur(3px) drop-shadow(0 16px 48px rgba(0, 0, 0, 0.5))'
            }}
          />
        );
      })}
      
      {/* Add lens flare effect */}
      <div 
        className="lens-flare"
        style={{
          position: 'absolute',
          top: '20%',
          right: '15%',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)',
          filter: 'blur(8px)',
          opacity: 0.4,
          transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`,
          transition: 'transform 0.3s ease'
        }}
      />
      
      <style jsx="true">{`
        .stars {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
        }
        
        .star {
          position: absolute;
          border-radius: 50%;
          background: white;
          animation: twinkle ease-in-out infinite;
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
