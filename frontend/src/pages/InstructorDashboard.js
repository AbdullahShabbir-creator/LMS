import React from 'react';
import { motion } from 'framer-motion';
import InstructorHeader from '../components/InstructorHeader';
import InstructorFooter from '../components/InstructorFooter';
import InstructorAnalytics from '../components/InstructorAnalytics';
import DashboardMetrics from '../components/DashboardMetrics';
import EarningsChart from '../components/EarningsChart';
import StudentOverview from '../components/StudentOverview';
import CoursesQuickView from '../components/CoursesQuickView';
import DashboardNotifications from '../components/DashboardNotifications';
import DashboardActions from '../components/DashboardActions';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/instructor.modern.css';
import '../styles/dashboard.modern.css';

export default function InstructorDashboard() {
  return (
    <div className="instructor-dashboard-root">
      <InstructorHeader />
      <main className="dashboard-main">
        <motion.div
          className="dashboard-welcome-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
        >
          <motion.h1
            className="dashboard-title"
            whileHover={{ scale: 1.07, color: '#ffd700', textShadow: '0 2px 16px #fff8' }}
            style={{
              color: '#fff',
              fontFamily: 'Poppins, Urbanist, DM Sans, sans-serif',
              fontWeight: 800,
              textAlign: 'center',
              fontSize: '2.1rem',
              marginBottom: '0.5rem',
              letterSpacing: '0.04em',
              lineHeight: 1.1,
              background: 'linear-gradient(90deg, #6c63ff 0%, #232526 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              cursor: 'pointer',
              transition: 'color 0.3s'
            }}
          >
            Instructor Dashboard
          </motion.h1>
          <motion.p
            className="dashboard-subtext"
            whileHover={{ scale: 1.04, color: '#a18cd1' }}
            style={{
              color: '#fff',
              fontFamily: 'Urbanist, DM Sans, sans-serif',
              fontWeight: 500,
              textAlign: 'center',
              fontSize: '1.08rem',
              marginBottom: '1.5rem',
              letterSpacing: '0.01em',
              lineHeight: 1.4,
              cursor: 'pointer',
              transition: 'color 0.3s'
            }}
          >
            Welcome, Instructor! Here you can manage your courses, assignments, and students.
          </motion.p>
        </motion.div>
        <DashboardActions />
        <DashboardMetrics />
        <EarningsChart />
        <StudentOverview />
        <CoursesQuickView />
        <DashboardNotifications />
        <InstructorAnalytics />
      </main>
      <InstructorFooter />
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar newestOnTop />
    </div>
  );
}
