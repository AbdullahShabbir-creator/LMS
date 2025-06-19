import React from 'react';
import { motion } from 'framer-motion';
import './CourseCard.css'; // Style as you like

const CourseCard = ({ course, onCardClick, index, buttonText }) => {
  const {
    title,
    category,
    instructor,
    image,
    students,
    rating,
    preview,
    price
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
      onClick={() => onCardClick(course)}
    >
     
      
      <div className="course-card-content">
        <h3 className="course-card-title">{title}</h3>
        <p className="course-card-category">{category}</p>
        <p className="course-card-instructor">By {instructor?.name || 'Unknown'}</p>
        <p className="course-card-rating">⭐ {rating || 4.0}</p>
        <p className="course-card-students">{students?.length || 0} students</p>

        {preview && <p className="course-card-preview">{preview}</p>}

        <div className="course-card-actions">
          <button className={`course-button ${buttonText === 'Pay Now' ? 'buy-button' : 'view-button'}`}>
            {buttonText === 'Pay Now' && price ? `${buttonText} (${price})` : buttonText}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard;
