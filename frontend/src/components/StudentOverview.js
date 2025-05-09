import React from 'react';
import '../styles/dashboard.modern.css';

const students = [
  { name: 'Alice', progress: 85 },
  { name: 'Bob', progress: 72 },
  { name: 'Charlie', progress: 90 },
  { name: 'Diana', progress: 60 }
];

export default function StudentOverview() {
  return (
    <div className="dashboard-student-overview">
      <h3>Student Progress Overview</h3>
      <div className="student-list">
        {students.map((s) => (
          <div className="student-item" key={s.name}>
            <span>{s.name}</span>
            <div className="progress-bar">
              <div className="progress" style={{ width: `${s.progress}%` }} />
            </div>
            <span className="progress-label">{s.progress}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
