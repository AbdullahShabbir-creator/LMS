import React from 'react';
import { motion } from 'framer-motion';

const roleColors = {
  admin: 'linear-gradient(90deg,#ff512f,#dd2476)',
  instructor: 'linear-gradient(90deg,#43cea2,#185a9d)',
  student: 'linear-gradient(90deg,#7f53ac,#43cea2)'
};

export default function AuthRoleSelector({ value, onChange }) {
  const roles = [
    { label: 'Admin', value: 'admin' },
    { label: 'Instructor', value: 'instructor' },
    { label: 'Student', value: 'student' }
  ];
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 18, margin: '18px 0 15px 0' }}>
      {roles.map(role => (
        <motion.button
          key={role.value}
          whileHover={{ scale: 1.13, boxShadow: '0 6px 32px 0 #43cea244', rotateY: 12 }}
          whileTap={{ scale: 0.97, rotateY: -6 }}
          animate={value === role.value ? { scale: 1.11, boxShadow: '0 8px 32px 0 #43cea277', rotateY: 0 } : { scale: 1, boxShadow: '0 2px 12px 0 #e3e6f3', rotateY: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 18 }}
          onClick={() => onChange(role.value)}
          style={{
            background: roleColors[role.value],
            color: '#fff',
            border: value === role.value ? '2.5px solid #fff' : '2px solid #e3e6f3',
            borderRadius: 16,
            fontWeight: 700,
            fontSize: 13,
            padding: '7px 16px',
            cursor: 'pointer',
            outline: 'none',
            boxShadow: value === role.value ? '0 8px 32px 0 #43cea277' : '0 2px 12px 0 #e3e6f3',
            transformStyle: 'preserve-3d',
            transition: 'box-shadow 0.25s, border 0.25s',
            letterSpacing: 1
          }}
        >
          {role.label}
        </motion.button>
      ))}
    </div>
  );
}
