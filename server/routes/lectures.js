const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const Course = require('../models/Course');
const Progress=require('../models/Progress')

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

router.post('/progress/complete', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId, lessonId } = req.body;

    const progress = await Progress.findOne({ user: userId, courseId });

    if (!progress) {
      return res.status(404).json({ error: 'Progress not found' });
    }

    const lesson = progress.details.find(l => l.lessonId.toString() === lessonId);

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found in progress details' });
    }

    if (!lesson.completed) {
      lesson.completed = true;

      progress.completed = progress.details.filter(l => l.completed).length;
      progress.percent = Math.round((progress.completed / progress.total) * 100);
      progress.lastLesson = lesson.lessonTitle;
      progress.updatedAt = new Date();

      await progress.save();
    }

    res.json({ success: true, progress });

  } catch (err) {
    console.error('Error updating progress:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


// routes/progress.js or similar
router.get('/progress', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all progress documents for the user, including course details
    const progresses = await Progress.find({ user: userId })
      .populate('courseId', 'title  category curriculum  completed');
console.log(progresses)
    // Format the data to only send necessary info to frontend
    const formatted = progresses.map(progress => ({
      courseId: progress.courseId._id,
      title: progress.courseId.title,
      description: progress.courseId.description,
      totalLectures: progress.total,
      completed: progress.completed,
      percent: progress.percent || 0,
      category:progress.courseId.category
    }));

    res.json({ success: true, courses: formatted });
  } catch (err) {
    console.error('Error fetching progress:', err);
    res.status(500).json({ error: 'Server error' });
  }
});



module.exports = router;
