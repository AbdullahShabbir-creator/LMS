import React, { useRef, useEffect } from 'react';

export default function AnimatedStarsBackground({ numStars = 60, style = {} }) {
  const canvasRef = useRef();
  const stars = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    function randomStar() {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.5,
        speed: Math.random() * 0.15 + 0.05,
        opacity: Math.random() * 0.7 + 0.3
      };
    }
    stars.current = Array.from({ length: numStars }, randomStar);

    function animate() {
      ctx.clearRect(0, 0, width, height);
      for (let star of stars.current) {
        ctx.save();
        ctx.globalAlpha = star.opacity;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, 2 * Math.PI);
        ctx.fillStyle = '#fff9';
        ctx.shadowColor = '#fff';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
        star.x += star.speed;
        if (star.x > width + 5) {
          star.x = -5;
          star.y = Math.random() * height;
        }
      }
      requestAnimationFrame(animate);
    }
    animate();
    function handleResize() {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
      stars.current = Array.from({ length: numStars }, randomStar);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [numStars]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0, left: 0, width: '100%', height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        ...style
      }}
    />
  );
}
