import React, { useRef, useEffect, useState } from 'react';
import StudentHeader from './StudentHeader';

export default function HideOnScrollHeader(props) {
  const [show, setShow] = useState(true);
  const lastScroll = useRef(window.scrollY);

  useEffect(() => {
    const onScroll = () => {
      const curr = window.scrollY;
      if (curr < 40) {
        setShow(true);
      } else if (curr > lastScroll.current) {
        setShow(false); // Scrolling down
      } else {
        setShow(true); // Scrolling up
      }
      lastScroll.current = curr;
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      transition: 'transform 0.32s cubic-bezier(.5,1.7,.45,.8)',
      transform: show ? 'translateY(0)' : 'translateY(-120%)',
      willChange: 'transform',
    }}>
      <StudentHeader {...props} />
    </div>
  );
}
