import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import AdminProfile from './pages/AdminProfile';
import InstructorDashboard from './pages/InstructorDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Leactures from './pages/Leactures'; 
import InstructorHome from './pages/InstructorHome'; 
import InstructorSettings from './pages/InstructorSettings';
import CourseManager from './pages/CourseManager';
import InstructorAnalytics from './pages/InstructorAnalytics';
import InstructorReport from './pages/InstructorReport';
import InstructorNotifications from './pages/InstructorNotifications';
import InstructorUpload from './pages/InstructorUpload';
import InstructorStudents from './pages/InstructorStudents';
import StudentSmartQuiz from './pages/StudentSmartQuiz';
import StudentMyCourses from './pages/StudentMyCourses';
import StudentExploreCourses from './pages/StudentExploreCourses';
import StudentProgress from './pages/StudentProgress';
import StudentNotifications from './pages/StudentNotifications';
import StudentProfile from './pages/StudentProfile';
import StudentSettings from './pages/StudentSettings';
import StudentDetail from './pages/StudentDetail';
import StudentCourseView from './pages/StudentCourseView';
import LoginTest from './pages/LoginTest';
import ServerTest from './pages/ServerTest';
import AuthTest from './pages/AuthTest';
import ErrorBoundary from './utils/ErrorBoundary';
import { getUser, generateTestToken } from './utils/auth';

function ProtectedRoute({ element, role }) {
  // Try direct approach to get user from localStorage
  let user;
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      user = JSON.parse(userStr);
    }
  } catch (e) {
    // Silent error handling
  }
  
  // Fallback to utility function if direct method fails
  if (!user) {
    user = getUser();
  }
  
  // In development environment, allow access by creating a new user if none exists
  if (!user && process.env.NODE_ENV === 'development') {
    const token = generateTestToken(role);
    if (token) {
      // Try to get the newly created user
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          user = JSON.parse(userStr);
        } catch (e) {
          // Silent error handling
        }
      }
    }
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (role && user.role !== role) {
    // In development mode, create a user with the correct role
    if (process.env.NODE_ENV === 'development') {
      const token = generateTestToken(role);
      if (token) {
        // Return the element directly as the token generation will update localStorage
        return element;
      }
    }
    
    return <Navigate to="/login" replace />;
  }
  
  return element;
}

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/admin" element={<ProtectedRoute element={<AdminDashboard />} role="admin" />} />
          <Route path="/admin/students" element={<ProtectedRoute element={<AdminDashboard activeTab={1} />} role="admin" />} />
          <Route path="/admin/instructors" element={<ProtectedRoute element={<AdminDashboard activeTab={2} />} role="admin" />} />
          <Route path="/admin/courses" element={<ProtectedRoute element={<AdminDashboard activeTab={3} />} role="admin" />} />
          <Route path="/admin/categories" element={<ProtectedRoute element={<AdminDashboard activeTab={4} />} role="admin" />} />
          <Route path="/admin/reviews" element={<ProtectedRoute element={<AdminDashboard activeTab={5} />} role="admin" />} />
          <Route path="/admin/payments" element={<ProtectedRoute element={<AdminDashboard activeTab={6} />} role="admin" />} />
          <Route path="/admin/settings" element={<ProtectedRoute element={<AdminDashboard activeTab={7} />} role="admin" />} />
          <Route path="/admin/profile" element={<ProtectedRoute element={<AdminProfile />} role="admin" />} />
          <Route path="/instructor" element={<ProtectedRoute element={<Navigate to="/instructor/dashboard" replace />} role="instructor" />} />
          <Route path="/instructor/dashboard" element={<ProtectedRoute element={<InstructorDashboard />} role="instructor" />} />
          <Route path="/instructor/home" element={<ProtectedRoute element={<InstructorHome />} role="instructor" />} />
          <Route path="/instructor/leactures" element={<ProtectedRoute element={<Leactures />} role="instructor" />} /> 
          <Route path="/instructor/settings" element={<ProtectedRoute element={<InstructorSettings />} role="instructor" />} />
          <Route path="/instructor/courses" element={<ProtectedRoute element={<CourseManager />} role="instructor" />} />
          <Route path="/instructor/analytics" element={<ProtectedRoute element={<InstructorAnalytics />} role="instructor" />} />
          <Route path="/instructor/report" element={<ProtectedRoute element={<InstructorReport />} role="instructor" />} />
          <Route path="/instructor/notifications" element={<ProtectedRoute element={<InstructorNotifications />} role="instructor" />} />
          <Route path="/instructor/upload" element={<ProtectedRoute element={<InstructorUpload />} role="instructor" />} />
          <Route path="/instructor/students" element={<ProtectedRoute element={<InstructorStudents />} role="instructor" />} />
          <Route path="/instructor/students/:studentId" element={<ProtectedRoute element={<StudentDetail />} role="instructor" />} />
          <Route path="/student" element={<ProtectedRoute element={<StudentDashboard />} role="student" />} />
          <Route path="/student/smart-quiz" element={<ProtectedRoute element={<StudentSmartQuiz />} role="student" />} />
          <Route path="/student/my-courses" element={<ProtectedRoute element={<StudentMyCourses />} role="student" />} />
          <Route path="/student/explore" element={<ProtectedRoute element={<StudentExploreCourses />} role="student" />} />
          <Route path="/student/progress" element={<ProtectedRoute element={<StudentProgress />} role="student" />} />
          <Route path="/student/notifications" element={<ProtectedRoute element={<StudentNotifications />} role="student" />} />
          <Route path="/student/profile" element={<ProtectedRoute element={<StudentProfile />} role="student" />} />
          <Route path="/student/settings" element={<ProtectedRoute element={<StudentSettings />} role="student" />} />
          <Route path="/student/detail" element={<ProtectedRoute element={<StudentDetail />} role="student" />} />
          <Route path="/student/course/:courseId" element={<ProtectedRoute element={<StudentCourseView />} role="student" />} />
          <Route path="/login-test" element={<LoginTest />} />
          <Route path="/server-test" element={<ServerTest />} />
          <Route path="/auth-test" element={<AuthTest />} />
        </Routes>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
