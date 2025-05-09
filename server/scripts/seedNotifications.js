// Script to seed sample notifications for a user
const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const User = require('../models/User');
require('dotenv').config({ path: __dirname + '/../.env' });

async function seed() {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const user = await User.findOne(); // Use the first user for demo
  if (!user) {
    console.log('No user found. Please register a user first.');
    process.exit(1);
  }
  const notifications = [
    { user: user._id, message: 'Welcome to your dashboard!', date: new Date(), read: false, type: 'general' },
    { user: user._id, message: 'Your course progress has been updated.', date: new Date(Date.now() - 86400000), read: false, type: 'progress' },
    { user: user._id, message: 'New assignment available in React Basics.', date: new Date(Date.now() - 2*86400000), read: false, type: 'assignment', link: '/student/my-courses' }
  ];
  await Notification.insertMany(notifications);
  console.log('Seeded notifications for user:', user.email);
  process.exit(0);
}

seed();
