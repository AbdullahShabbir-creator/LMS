require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());

// MongoDB Connection with fallback
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lms';
console.log('Attempting to connect to MongoDB at:', MONGO_URI);

// Add connection options to avoid deprecation warnings and improve connection stability
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  family: 4
})
.then(() => {
  console.log('MongoDB connected successfully');
  // Add a check to ensure the connection is actually usable
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit if connection fails
  });
})
.catch((err) => {
  console.error('Failed to connect to MongoDB:', err);
  console.error('Please ensure MongoDB is running and accessible at:', MONGO_URI);
  process.exit(1); // Exit if connection fails
});

// Add a DB connection status route for troubleshooting
app.get('/api/status', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    status: 'up',
    db: dbStatus,
    timestamp: new Date(),
    mongo_uri: MONGO_URI.replace(/mongodb:\/\/([^:]+):([^@]+)@/, 'mongodb://[hidden]:[hidden]@')
  });
});

const { router: authRoutes } = require('./routes/auth');
const studentRoutes = require('./routes/students');
const instructorRoutes = require('./routes/instructors');
const courseRoutes = require('./routes/courses');
const categoryRoutes = require('./routes/categories');
const notificationRoutes = require('./routes/notifications');
const reportRoutes = require('./routes/reports');
const quizRoutes = require('./routes/quiz');
const mfaRoutes = require('./routes/mfa');
const uploadRoute = require('./routes/upload');
const lecturesRoute = require('./routes/lectures');
const reviewRoutes = require('./routes/reviews');
const paymentRoutes = require('./routes/payments');
const adminRoutes = require('./routes/admin');
const lectureRoutes = require('./routes/lectureRoutes');
app.use('/api/lectures', lectureRoutes);

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Basic route
app.get('/', (req, res) => {
    res.send('API is running');
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/instructor', instructorRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/mfa', mfaRoutes);
app.use('/api/upload', uploadRoute);
app.use('/api/lectures', lecturesRoute);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Test route to check API functionality
app.get('/api/test', (req, res) => {
    res.json({ success: true, message: 'API is working properly' });
});

const PORT = process.env.PORT || 5000;
// Listen on all interfaces (0.0.0.0) to ensure proper connectivity
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/`);
    console.log(`Health check endpoint: http://localhost:${PORT}/api/status`);
});