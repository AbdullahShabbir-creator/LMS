import React, { useEffect, useState, useRef } from 'react';
import InstructorHeader from '../components/InstructorHeader';
import InstructorFooter from '../components/InstructorFooter';
import { CoursesTrendChart, EarningsBarChart, StudentsPieChart } from '../components/ReportCharts';
import { exportReportToCSV, exportReportToPDF } from '../utils/exportReport';
import { motion } from 'framer-motion';
import '../styles/dashboard.modern.css';

export default function InstructorReport() {
  const [stats, setStats] = useState({ courses: 0, students: 0, earnings: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const coursesChartRef = useRef();
  const earningsChartRef = useRef();
  const studentsChartRef = useRef();

  useEffect(() => {
    async function fetchReport() {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('lms_token');
        const res = await fetch('/api/reports/instructor', {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        } else if (res.status === 401 || res.status === 403) {
          setError('You are not authorized to view this page. Please log in as an instructor.');
        } else {
          setError('Failed to fetch analytics. Please try again later.');
        }
      } catch (err) {
        setError('Network error: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, []);

  function handleExportCSV() {
    try {
      exportReportToCSV(stats);
    } catch (err) {
      alert('Failed to export CSV: ' + err.message);
    }
  }

  function handleExportPDF() {
    try {
      exportReportToPDF(stats, [coursesChartRef, earningsChartRef, studentsChartRef]);
    } catch (err) {
      alert('Failed to export PDF: ' + err.message);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f6f7fb 0%, #e3e6f3 100%)', display: 'flex', flexDirection: 'column' }}>
      <InstructorHeader />
      <main style={{ flex: 1, maxWidth: 1200, margin: '0 auto', padding: '32px 16px', width: '100%' }}>
        <motion.h2
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 110 }}
          style={{ marginBottom: 24, textAlign: 'center', fontWeight: 700, letterSpacing: 0.5, fontSize: '2.2rem', color: '#185a9d', textShadow: '0 4px 24px #185a9d22' }}
        >
          Instructor Report
        </motion.h2>
        {error && (
          <div style={{ color: '#e74c3c', background: '#fff4f4', padding: 16, borderRadius: 10, textAlign: 'center', marginBottom: 24, fontWeight: 600, fontSize: 18 }}>
            {error}
          </div>
        )}
        {loading ? (
          <div style={{ textAlign: 'center', marginTop: 60 }}>
            <span className="loader" style={{ display: 'inline-block', width: 40, height: 40, border: '4px solid #185a9d33', borderTop: '4px solid #185a9d', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: 18 }}></span>
            <div>Loading analytics...</div>
          </div>
        ) : !error && (
          <>
            {/* Analytics Cards */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 40 }}>
              {[{
                title: 'Courses',
                value: stats.courses,
                color: '#185a9d',
                icon: '📚'
              }, {
                title: 'Students',
                value: stats.students,
                color: '#43cea2',
                icon: '👨‍🎓'
              }, {
                title: 'Earnings',
                value: `$${stats.earnings}`,
                color: '#ffd700',
                icon: '💰'
              }].map((card, idx) => (
                <motion.div
                  key={card.title}
                  whileHover={{ scale: 1.08, rotateY: 8, boxShadow: `0 8px 32px ${card.color}55` }}
                  transition={{ type: 'spring', stiffness: 200, damping: 16 }}
                  style={{
                    background: '#fff',
                    borderRadius: 18,
                    padding: 28,
                    minWidth: 180,
                    textAlign: 'center',
                    boxShadow: `0 2px 16px ${card.color}22, 0 4px 28px #2325260a`,
                    flex: '1 1 220px',
                    maxWidth: 260,
                    cursor: 'pointer',
                    perspective: 800,
                    transformStyle: 'preserve-3d',
                    willChange: 'transform',
                    marginBottom: 0
                  }}
                >
                  <span style={{ fontSize: 38, display: 'block', marginBottom: 8 }}>{card.icon}</span>
                  <h3 style={{ fontWeight: 700, color: card.color, marginBottom: 10 }}>{card.title}</h3>
                  <div style={{ fontSize: 34, fontWeight: 800 }}>{card.value}</div>
                </motion.div>
              ))}
            </div>
            {/* Charts */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'center', alignItems: 'stretch', marginBottom: 40 }}>
              {[{
                title: 'Courses Trend',
                Chart: CoursesTrendChart,
                ref: coursesChartRef
              }, {
                title: 'Earnings (Last 5 Months)',
                Chart: EarningsBarChart,
                ref: earningsChartRef
              }, {
                title: 'Students Distribution',
                Chart: StudentsPieChart,
                ref: studentsChartRef
              }].map((chartCard, idx) => (
                <motion.div
                  key={chartCard.title}
                  whileHover={{ scale: 1.04, rotateY: -8, boxShadow: '0 12px 36px #43cea255' }}
                  transition={{ type: 'spring', stiffness: 170, damping: 14 }}
                  style={{
                    background: '#fff',
                    borderRadius: 18,
                    padding: 18,
                    flex: '1 1 320px',
                    minWidth: 260,
                    maxWidth: 400,
                    boxShadow: '0 2px 16px #2325260a, 0 4px 28px #43cea222',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    perspective: 800,
                    transformStyle: 'preserve-3d',
                    willChange: 'transform',
                    marginBottom: 0
                  }}
                >
                  <h4 style={{ marginBottom: 10, fontWeight: 700, color: '#185a9d', letterSpacing: 0.3 }}>{chartCard.title}</h4>
                  <div style={{ width: '100%', minHeight: 220 }}>
                    {idx === 0 && <CoursesTrendChart data={{ labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'], values: [1, 2, 3, 4, stats.courses] }} ref={coursesChartRef} />}
                    {idx === 1 && <EarningsBarChart data={{ labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'], values: [500, 800, 1200, 1500, stats.earnings] }} ref={earningsChartRef} />}
                    {idx === 2 && <StudentsPieChart data={{ labels: ['React', 'JS', 'CSS'], values: [Math.floor(stats.students/2), Math.floor(stats.students/3), stats.students-Math.floor(stats.students/2)-Math.floor(stats.students/3)] }} ref={studentsChartRef} />}
                  </div>
                </motion.div>
              ))}
            </div>
            {/* Export Buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginBottom: 32 }}>
              <button onClick={handleExportCSV} style={{ background: '#185a9d', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>Export CSV</button>
              <button onClick={handleExportPDF} style={{ background: '#ffd700', color: '#222', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>Export PDF</button>
            </div>
          </>
        )}
      </main>
      <InstructorFooter />
    </div>
  );
}