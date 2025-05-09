import React, { useRef, useEffect } from 'react';
import './AnimatedBallsBackground.css';

export default function AnimatedBallsBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let balls = [];
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    function randomColor() {
      // Vibrant, modern gradient-inspired palette
      const colors = [
        '#43cea2', // green-cyan
        '#185a9d', // deep blue
        '#00bfff', // bright blue
        '#ffd700', // gold
        '#fc466b', // pink-red
        '#3a8dde', // mid blue
        '#f7971e', // orange
        '#8fd3f4', // light blue
        '#fbc2eb', // pink
        '#fad0c4', // peach
        '#fff',    // white for contrast
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    }

    for (let i = 0; i < 18; i++) {
      balls.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 40 + Math.random() * 30,
        dx: 0.2 + Math.random() * 0.5,
        dy: 0.2 + Math.random() * 0.5,
        color: randomColor(),
        opacity: 0.19 + Math.random() * 0.16
      });
    }

    function animate() {
      // Modern diagonal gradient background
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#232526'); // deep dark
      grad.addColorStop(0.4, '#185a9d'); // blue
      grad.addColorStop(0.7, '#43cea2'); // green-cyan
      grad.addColorStop(1, '#fad0c4'); // soft peach
      ctx.globalAlpha = 1;
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
      balls.forEach(ball => {
        ctx.globalAlpha = ball.opacity;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.r, 0, 2 * Math.PI);
        ctx.fillStyle = ball.color;
        ctx.shadowColor = ball.color;
        ctx.shadowBlur = 38;
        ctx.fill();
        ball.x += ball.dx;
        ball.y += ball.dy;
        if (ball.x - ball.r > width) ball.x = -ball.r;
        if (ball.y - ball.r > height) ball.y = -ball.r;
      });
      requestAnimationFrame(animate);
    }
    animate();
    return () => { ctx.clearRect(0, 0, width, height); };
  }, []);

  return <canvas ref={canvasRef} className="animated-balls-bg"></canvas>;
}
