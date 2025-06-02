import React from 'react';
import { motion } from 'framer-motion';
import './CourseCard.css'; // CSS specific to CourseCard

const CourseCard = ({ course, isUnlocked, onCardClick, onViewClick, onBuyClick, index }) => {
  const {
    title,
    category,
    instructor,
    image,
    students,
    price,
    enrolled,
    rating,
    isFree,
    preview
  } = course;

  const animation = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: index * 0.1 }
  };

  return (
    <motion.div
      className="course-card"
      {...animation}
      whileHover={{ scale: 1.02 }}
    >
 
      <div className="course-card-content">
        <h3 className="course-card-title">{title}</h3>
        <p className="course-card-category">{category}</p>
        <p className="course-card-instructor">By {instructor?.name || 'Unknown'}</p>
        <p className="course-card-rating">⭐ {rating || 4.0}</p>
        <p className="course-card-students">{students} students</p>
        <p className="course-card-preview">{preview}</p>

        <div className="course-card-actions">
          {enrolled || isUnlocked ? (
            <button className="view-button" onClick={() => onViewClick(course)}>
              View Course
            </button>
          ) : isFree ? (
            <button className="enroll-button" onClick={() => onBuyClick(course)}>
              Enroll Free
            </button>
          ) : (
            <button className="buy-button" onClick={() => onBuyClick(course)}>
              Buy for ${price}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard;
