import React from 'react';

export default function StudentProfileCard({ student, onEdit }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
      <img src={student.avatar} alt="avatar" style={{ width: 80, height: 80, borderRadius: '50%', border: '3px solid #43cea2', background: '#e3e6f3' }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 22, color: '#185a9d' }}>{student.name}</div>
        <div style={{ color: '#888', fontSize: 15 }}>{student.email}</div>
        <div style={{ color: '#43cea2', fontSize: 14, marginTop: 6 }}>Enrollment #: {student.enrollment}</div>
        <div style={{ color: '#888', fontSize: 14 }}>{student.program}, Semester {student.semester}</div>
      </div>
      <button onClick={onEdit} style={{ background: 'linear-gradient(90deg, #43cea2 0%, #00bfff 100%)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}>
        Edit Profile
      </button>
    </div>
  );
}
