import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

const ballsConfig = [
  {
    color: 'linear-gradient(135deg, #00bfff 40%, #7f53ac 100%)',
    size: 160,
    initial: { x: -180, y: -100 },
    animate: { x: 60, y: 60 },
    duration: 16,
    delay: 0,
  },
  {
    color: 'linear-gradient(135deg, #ffe53b 40%, #ff6f61 100%)',
    size: 110,
    initial: { x: 200, y: 120 },
    animate: { x: -90, y: -60 },
    duration: 20,
    delay: 3,
  },
  {
    color: 'linear-gradient(135deg, #43cea2 40%, #185a9d 100%)',
    size: 230,
    initial: { x: 0, y: 180 },
    animate: { x: 120, y: -90 },
    duration: 23,
    delay: 1.5,
  },
  {
    color: 'linear-gradient(135deg, #ff6f61 40%, #00bfff 100%)',
    size: 90,
    initial: { x: -120, y: 130 },
    animate: { x: 80, y: -40 },
    duration: 18,
    delay: 2.5,
  },
];

export default function BallsBackground() {
  // Move useAnimation hooks outside of any callback, one per ball
  const controlsArr = [useAnimation(), useAnimation(), useAnimation(), useAnimation()];

  useEffect(() => {
    ballsConfig.forEach((ball, i) => {
      controlsArr[i].start({
        ...ball.animate,
        transition: {
          yoyo: Infinity,
          repeatType: 'reverse',
          duration: ball.duration,
          delay: ball.delay,
          ease: 'easeInOut',
        },
      });
    });
  }, [controlsArr]);

  return (
    <div
      style={{
        position: 'fixed',
        zIndex: 0,
        width: '100vw',
        height: '100vh',
        top: 0,
        left: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        background: 'linear-gradient(135deg, #0f2027 0%, #2c5364 100%)',
      }}
    >
      {ballsConfig.map((ball, i) => (
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
            filter: 'blur(2px) drop-shadow(0 8px 32px rgba(0, 0, 0, 0.5))',
            boxShadow: '0 12px 48px 0 rgba(0, 0, 0, 0.4), 0 0 60px 0 rgba(255, 255, 255, 0.1) inset',
            opacity: 0.7,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%) scale(1)'
          }}
        />
      ))}
    </div>
  );
}
