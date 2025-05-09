import React from 'react';
import Particles from '@tsparticles/react';
import { loadFull } from 'tsparticles';

export default function AnimatedBackground() {
  const particlesInit = async (main) => {
    await loadFull(main);
  };
  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        background: { color: 'linear-gradient(135deg, #0f2027, #2c5364 100%)' },
        fpsLimit: 60,
        particles: {
          number: { value: 60 },
          color: { value: ['#00bfff', '#ff6f61', '#7f53ac', '#43cea2', '#ffe53b'] },
          shape: { type: 'circle' },
          opacity: { value: 0.7, random: true },
          size: { value: 20, random: { enable: true, minimumValue: 8 } },
          move: {
            enable: true,
            speed: 0.5,
            direction: 'none',
            random: true,
            straight: false,
            outModes: { default: 'out' },
          },
          shadow: {
            enable: true,
            color: '#000',
            blur: 8,
          },
        },
        detectRetina: true,
      }}
      style={{ position: 'fixed', zIndex: 0, width: '100vw', height: '100vh', top: 0, left: 0 }}
    />
  );
}
