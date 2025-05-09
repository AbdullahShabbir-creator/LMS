const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('./auth');
const Course = require('../models/Course');

// Add a lecture to a course
router.post('/:courseId/lectures', auth, requireRole('instructor'), async (req, res) => {
  try {
    const { title, isPreview, videoUrl, videoPublicId } = req.body;
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    course.curriculum.push({ title, isPreview, videoUrl, videoPublicId });
    await course.save();
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a lecture in a course
router.put('/:courseId/lectures/:lectureId', auth, requireRole('instructor'), async (req, res) => {
  try {
    const { title, isPreview, videoUrl, videoPublicId } = req.body;
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    const lecture = course.curriculum.id(req.params.lectureId);
    if (!lecture) return res.status(404).json({ message: 'Lecture not found' });
    lecture.title = title;
    lecture.isPreview = isPreview;
    lecture.videoUrl = videoUrl;
    lecture.videoPublicId = videoPublicId;
    await course.save();
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a lecture from a course
router.delete('/:courseId/lectures/:lectureId', auth, requireRole('instructor'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    const lecture = course.curriculum.id(req.params.lectureId);
    if (!lecture) return res.status(404).json({ message: 'Lecture not found' });
    lecture.remove();
    await course.save();
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
