import React, { useEffect, useState } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveLine } from '@nivo/line';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveCalendar } from '@nivo/calendar';
import { motion } from 'framer-motion';
import { FaChartLine, FaChartPie, FaDownload, FaUsers, FaBookOpen, FaMoneyBillWave } from 'react-icons/fa';
import InstructorHeader from '../components/InstructorHeader';
import InstructorFooter from '../components/InstructorFooter';
import '../styles/instructor.modern.css';
import '../styles/instructorAnalytics.css';

export default function InstructorAnalytics() {
  const [earnings, setEarnings] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [engagement, setEngagement] = useState([]);
  const [dailyActivity, setDailyActivity] = useState([]);
  const [overview, setOverview] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalEarnings: 0,
    avgEngagement: 0
  });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    setLoading(true);
    loadData();
  }, []);

  const loadData = async () => {
    // Get auth token from localStorage
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
    const token = user ? user.token : null;
    
    if (!token) {
      console.log('No authentication token found, using fallback data');
      setFallbackData();
      return;
    }

    try {
      // Fetch all analytics data
      const [earningsData, enrollmentsData, engagementData] = await Promise.all([
        // Fetch earnings data
        fetch('/api/instructor/earnings', {
          headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
          if (!res.ok) throw new Error('Failed to fetch earnings');
          return res.json();
        }),
        
        // Fetch enrollment data
        fetch('/api/instructor/enrollments', {
          headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
          if (!res.ok) throw new Error('Failed to fetch enrollments');
          return res.json();
        }),
        
        // Fetch engagement data
        fetch('/api/instructor/engagement', {
          headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
          if (!res.ok) throw new Error('Failed to fetch engagement');
          return res.json();
        })
      ]);
      
      // Process and set data
      setEarnings(earningsData);
      setEnrollments(enrollmentsData);
      setEngagement(engagementData);
      
      // Generate mock daily activity data for calendar heatmap
      const today = new Date();
      const oneYearAgo = new Date(today);
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      
      const mockDailyActivity = [];
      let currentDate = new Date(oneYearAgo);
      
      while (currentDate <= today) {
        if (Math.random() > 0.3) {  // 70% chance of having activity
          mockDailyActivity.push({
            day: currentDate.toISOString().split('T')[0],
            value: Math.floor(Math.random() * 10) + 1
          });
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      setDailyActivity(mockDailyActivity);
      
      // Calculate overview metrics
      const totalStudents = enrollmentsData.reduce((total, item) => total + (item.count || 0), 0);
      const totalEarnings = earningsData.reduce((total, item) => total + (item.amount || 0), 0);
      
      // Compute average engagement
      let engagementTotal = 0;
      
      if (engagementData && engagementData.length > 0) {
        const completed = engagementData.find(item => item.id === 'Completed')?.value || 0;
        const inProgress = engagementData.find(item => item.id === 'In Progress')?.value || 0;
        const total = completed + inProgress + (engagementData.find(item => item.id === 'Not Started')?.value || 0);
        
        if (total > 0) {
          engagementTotal = ((completed + (inProgress * 0.5)) / total) * 100;
        }
      }
      
      setOverview({
        totalStudents,
        totalCourses: Math.max(enrollmentsData.length, 1),
        totalEarnings,
        avgEngagement: engagementTotal
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      // In case of any error, use fallback data
      setFallbackData();
    }
  };

  // Set fallback data if API fails
  const setFallbackData = () => {
    const mockEarnings = [
      { month: 'Jan', amount: 1200 },
      { month: 'Feb', amount: 1800 },
      { month: 'Mar', amount: 1500 },
      { month: 'Apr', amount: 2200 },
      { month: 'May', amount: 2800 },
      { month: 'Jun', amount: 3200 },
    ];
    
    const mockEnrollments = [
      { month: 'Jan', count: 12 },
      { month: 'Feb', count: 18 },
      { month: 'Mar', count: 15 },
      { month: 'Apr', count: 22 },
      { month: 'May', count: 28 },
      { month: 'Jun', count: 32 },
    ];
    
    const mockEngagement = [
      { id: 'Completed', label: 'Completed', value: 45 },
      { id: 'In Progress', label: 'In Progress', value: 30 },
      { id: 'Not Started', label: 'Not Started', value: 25 }
    ];
    
    // Generate mock daily activity data
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    const mockDailyActivity = [];
    let currentDate = new Date(oneYearAgo);
    
    while (currentDate <= today) {
      if (Math.random() > 0.3) {  // 70% chance of having activity
        mockDailyActivity.push({
          day: currentDate.toISOString().split('T')[0],
          value: Math.floor(Math.random() * 10) + 1
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    setEarnings(mockEarnings);
    setEnrollments(mockEnrollments);
    setEngagement(mockEngagement);
    setDailyActivity(mockDailyActivity);
    
    setOverview({
      totalStudents: 145,
      totalCourses: 6,
      totalEarnings: 12700,
      avgEngagement: 72
    });
    
    setLoading(false);
  };

  // Prepare data for charts
  const earningsLineData = [
    {
      id: 'Earnings',
      color: 'hsl(259, 70%, 54%)',
      data: Array.isArray(earnings) && earnings.length > 0
        ? earnings.map(e => ({ x: e.month, y: e.amount }))
        : []
    }
  ];
  
  const enrollmentsBarData = Array.isArray(enrollments) && enrollments.length > 0
    ? enrollments.map(e => ({ month: e.month, Enrollments: e.count }))
    : [];
  
  // Export analytics data to CSV
  const exportAnalytics = () => {
    // Format earnings data
    const earningsCSV = earnings.map(e => `${e.month},${e.amount}`).join('\n');
    const earningsHeader = 'Month,Amount\n';
    const earningsData = earningsHeader + earningsCSV;
    
    // Create and download file
    const blob = new Blob([earningsData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'instructor_analytics.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderOverview = () => (
    <div className="analytics-overview">
      <div className="analytics-stats-grid">
        <motion.div 
          className="analytics-stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="stat-icon student-icon">
            <FaUsers />
          </div>
          <div className="stat-content">
            <h3>Total Students</h3>
            <p className="stat-value">{overview.totalStudents}</p>
          </div>
        </motion.div>

        <motion.div 
          className="analytics-stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="stat-icon course-icon">
            <FaBookOpen />
          </div>
          <div className="stat-content">
            <h3>Total Courses</h3>
            <p className="stat-value">{overview.totalCourses}</p>
          </div>
        </motion.div>

        <motion.div 
          className="analytics-stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="stat-icon earnings-icon">
            <FaMoneyBillWave />
          </div>
          <div className="stat-content">
            <h3>Total Earnings</h3>
            <p className="stat-value">PKR {overview.totalEarnings.toLocaleString()}</p>
          </div>
        </motion.div>

        <motion.div 
          className="analytics-stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="stat-icon engagement-icon">
            <FaChartPie />
          </div>
          <div className="stat-content">
            <h3>Avg. Engagement</h3>
            <p className="stat-value">{overview.avgEngagement.toFixed(1)}%</p>
          </div>
        </motion.div>
      </div>

      <div className="analytics-charts-grid">
        <motion.div 
          className="analytics-chart-card earnings-chart"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3>Earnings Overview</h3>
          <div className="chart-container">
            {loading ? (
              <div className="loading-spinner"></div>
            ) : (
              <ResponsiveLine
                data={earningsLineData}
                margin={{ top: 20, right: 30, bottom: 50, left: 60 }}
                xScale={{ type: 'point' }}
                yScale={{ 
                  type: 'linear', 
                  min: 'auto', 
                  max: 'auto', 
                  stacked: false, 
                  reverse: false 
                }}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: 'Month',
                  legendOffset: 36,
                  legendPosition: 'middle'
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: 'Amount (PKR)',
                  legendOffset: -50,
                  legendPosition: 'middle',
                  format: value => `PKR ${value}`
                }}
                colors={{ scheme: 'category10' }}
                pointSize={10}
                pointColor={{ theme: 'background' }}
                pointBorderWidth={2}
                pointBorderColor={{ from: 'serieColor' }}
                pointLabelYOffset={-12}
                useMesh={true}
                enableArea={true}
                areaOpacity={0.15}
                curve="cardinal"
                theme={{
                  axis: { 
                    ticks: { text: { fill: '#e0e0e0' } }, 
                    legend: { text: { fill: '#e0e0e0' } } 
                  },
                  grid: { line: { stroke: '#444', strokeDasharray: '1 5' } },
                  legends: { text: { fill: '#e0e0e0' } },
                  tooltip: { container: { background: '#232526', color: '#fff' } },
                  crosshair: { line: { stroke: '#6c63ff', strokeWidth: 1, strokeOpacity: 0.75 } }
                }}
              />
            )}
          </div>
        </motion.div>

        <motion.div 
          className="analytics-chart-card enrollments-chart"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3>Student Enrollments</h3>
          <div className="chart-container">
            {loading ? (
              <div className="loading-spinner"></div>
            ) : (
              <ResponsiveBar
                data={enrollmentsBarData}
                keys={['Enrollments']}
                indexBy="month"
                margin={{ top: 20, right: 30, bottom: 50, left: 60 }}
                padding={0.3}
                colors={{ scheme: 'nivo' }}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: 'Month',
                  legendOffset: 36,
                  legendPosition: 'middle'
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: 'Students',
                  legendOffset: -40,
                  legendPosition: 'middle'
                }}
                labelSkipWidth={12}
                labelSkipHeight={12}
                labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                animate={true}
                motionStiffness={90}
                motionDamping={15}
                theme={{
                  axis: { 
                    ticks: { text: { fill: '#e0e0e0' } }, 
                    legend: { text: { fill: '#e0e0e0' } } 
                  },
                  grid: { line: { stroke: '#444', strokeDasharray: '1 5' } },
                  legends: { text: { fill: '#e0e0e0' } },
                  tooltip: { container: { background: '#232526', color: '#fff' } }
                }}
              />
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderEngagement = () => (
    <div className="analytics-engagement">
      <div className="analytics-charts-grid">
        <motion.div 
          className="analytics-chart-card engagement-chart"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3>Course Engagement</h3>
          <div className="chart-container" style={{ height: '300px' }}>
            {loading ? (
              <div className="loading-spinner"></div>
            ) : (
              <ResponsivePie
                data={engagement}
                margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                innerRadius={0.5}
                padAngle={0.7}
                cornerRadius={3}
                activeOuterRadiusOffset={8}
                colors={{ scheme: 'nivo' }}
                borderWidth={1}
                borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                arcLinkLabelsSkipAngle={10}
                arcLinkLabelsTextColor="#e0e0e0"
                arcLinkLabelsThickness={2}
                arcLinkLabelsColor={{ from: 'color' }}
                arcLabelsSkipAngle={10}
                arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
                legends={[
                  {
                    anchor: 'bottom',
                    direction: 'row',
                    justify: false,
                    translateX: 0,
                    translateY: 56,
                    itemsSpacing: 0,
                    itemWidth: 100,
                    itemHeight: 18,
                    itemTextColor: '#e0e0e0',
                    itemDirection: 'left-to-right',
                    itemOpacity: 1,
                    symbolSize: 18,
                    symbolShape: 'circle'
                  }
                ]}
                theme={{
                  tooltip: { container: { background: '#232526', color: '#fff' } }
                }}
                motionConfig="gentle"
              />
            )}
          </div>
        </motion.div>

        <motion.div 
          className="analytics-chart-card activity-chart"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3>Student Activity</h3>
          <div className="chart-container" style={{ height: '300px' }}>
            {loading ? (
              <div className="loading-spinner"></div>
            ) : (
              <ResponsiveCalendar
                data={dailyActivity}
                from={dailyActivity.length > 0 ? dailyActivity[0].day : '2023-01-01'}
                to={dailyActivity.length > 0 ? dailyActivity[dailyActivity.length - 1].day : '2023-12-31'}
                emptyColor="#2d3748"
                colors={[ '#61cdbb', '#97e3d5', '#e8c1a0', '#f47560' ]}
                margin={{ top: 20, right: 10, bottom: 0, left: 10 }}
                yearSpacing={40}
                monthBorderColor="#232526"
                dayBorderWidth={2}
                dayBorderColor="#232526"
                legends={[
                  {
                    anchor: 'bottom-right',
                    direction: 'row',
                    translateY: 36,
                    itemCount: 4,
                    itemWidth: 42,
                    itemHeight: 36,
                    itemsSpacing: 14,
                    itemDirection: 'right-to-left'
                  }
                ]}
                theme={{
                  textColor: '#e0e0e0',
                  tooltip: { container: { background: '#232526', color: '#fff' } }
                }}
              />
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );

  return (
    <div className="instructor-analytics-page">
      <InstructorHeader />
      <main className="analytics-main">
        <motion.div 
          className="analytics-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1>Analytics Dashboard</h1>
          <div className="analytics-actions">
            <div className="period-selector">
              <button 
                className={period === 'weekly' ? 'active' : ''} 
                onClick={() => setPeriod('weekly')}
              >
                Weekly
              </button>
              <button 
                className={period === 'monthly' ? 'active' : ''} 
                onClick={() => setPeriod('monthly')}
              >
                Monthly
              </button>
              <button 
                className={period === 'yearly' ? 'active' : ''} 
                onClick={() => setPeriod('yearly')}
              >
                Yearly
              </button>
            </div>
            <button className="export-btn" onClick={exportAnalytics}>
              <FaDownload /> Export Data
            </button>
          </div>
        </motion.div>

        <div className="analytics-tabs">
          <button 
            className={activeTab === 'overview' ? 'active' : ''} 
            onClick={() => setActiveTab('overview')}
          >
            <FaChartLine /> Overview
          </button>
          <button 
            className={activeTab === 'engagement' ? 'active' : ''} 
            onClick={() => setActiveTab('engagement')}
          >
            <FaChartPie /> Engagement
          </button>
        </div>

        <div className="analytics-content">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'engagement' && renderEngagement()}
        </div>
      </main>
      <InstructorFooter />
    </div>
  );
} 