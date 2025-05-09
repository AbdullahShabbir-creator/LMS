import React from 'react';
import '../styles/dashboard.modern.css';

const courses = [
  { title: 'React Basics', enrolled: 34 },
  { title: 'Advanced JS', enrolled: 21 },
  { title: 'UI/UX Design', enrolled: 17 }
];

export default function CoursesQuickView() {
  return (
    <div className="dashboard-courses-quickview">
      <h3>Courses Quick View</h3>
      <ul>
        {courses.map((c) => (
          <li key={c.title}>
            <span className="course-title">{c.title}</span>
            <span className="course-enrolled">{c.enrolled} enrolled</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
