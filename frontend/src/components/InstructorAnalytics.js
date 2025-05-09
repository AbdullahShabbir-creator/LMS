import React, { useEffect, useState } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveLine } from '@nivo/line';
import { ResponsivePie } from '@nivo/pie';
import { motion } from 'framer-motion';
import '../styles/instructor.modern.css';
import '../styles/animatedBalls.css';

export default function InstructorAnalytics() {
  const [earnings, setEarnings] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [engagement, setEngagement] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem('lms_token');
    if (!token) {
      setLoading(false);
      return;
    }
    Promise.all([
      fetch('/api/instructor/earnings', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => res.ok ? res.json() : []),
      fetch('/api/instructor/enrollments', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => res.ok ? res.json() : []),
      fetch('/api/instructor/engagement', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => res.ok ? res.json() : [])
    ]).then(([earningsData, enrollmentsData, engagementData]) => {
      setEarnings(earningsData);
      setEnrollments(enrollmentsData);
      setEngagement(engagementData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Prepare Nivo data
  const earningsLineData = [
    {
      id: 'Earnings',
      color: 'hsl(259, 70%, 54%)',
      data: Array.isArray(earnings) && earnings.length > 0 && earnings[0].month && earnings[0].amount
        ? earnings.map(e => ({ x: e.month, y: e.amount }))
        : []
    }
  ];
  const enrollmentsBarData = Array.isArray(enrollments) && enrollments.length > 0 && enrollments[0].month && enrollments[0].count
    ? enrollments.map(e => ({ month: e.month, Enrollments: e.count }))
    : [];
  // Use real engagement data if available, else fallback
  const engagementPieData = Array.isArray(engagement) && engagement.length > 0 && engagement[0].id && engagement[0].value
    ? engagement
    : [
      { id: 'Completed', label: 'Completed', value: 45, color: '#ffd700' },
      { id: 'In Progress', label: 'In Progress', value: 30, color: '#6c63ff' },
      { id: 'Not Started', label: 'Not Started', value: 25, color: '#232526' }
    ];

  return (
    <section className="instructor-analytics-section" style={{
      width: '100%',
      display: 'flex',
      flexDirection: 'row',
      gap: '2.5rem',
      justifyContent: 'center',
      alignItems: 'center',
      flexWrap: 'wrap',
      margin: '2.5rem 0',
    }}>
      <div className="analytics-chart-card" style={{
        flex: '0 1 340px',
        maxWidth: 360,
        minWidth: 260,
        background: 'rgba(44,44,84,0.93)',
        borderRadius: 22,
        padding: '1.4rem 1rem 1.7rem 1rem',
        boxShadow: '0 2px 24px #23252655',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transition: 'transform 0.2s',
        cursor: 'pointer',
        margin: '0 0.5rem',
      }}
        tabIndex={0}
        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.03)'}
        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <motion.h3 whileHover={{ color: '#ffd700' }} style={{ color: '#fff', fontWeight: 700, fontSize: '1.2rem', marginBottom: 16, textAlign: 'center', letterSpacing: '0.03em' }}>Your Analytics</motion.h3>
        {loading ? <div style={{ color: '#fff', textAlign: 'center' }}>Loading...</div> :
          <div style={{ width: '100%', height: 210 }}>
            <ResponsiveLine
              data={earningsLineData}
              margin={{ top: 16, right: 24, bottom: 40, left: 36 }}
              xScale={{ type: 'point' }}
              yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false, reverse: false }}
              axisBottom={{ tickSize: 5, tickPadding: 5, tickRotation: 0, legend: 'Month', legendOffset: 32, legendPosition: 'middle' }}
              axisLeft={{ tickSize: 5, tickPadding: 5, tickRotation: 0, legend: 'Earnings', legendOffset: -28, legendPosition: 'middle' }}
              colors={{ scheme: 'category10' }}
              pointSize={8}
              pointColor={{ theme: 'background' }}
              pointBorderWidth={2}
              pointBorderColor={{ from: 'serieColor' }}
              pointLabelYOffset={-12}
              useMesh={true}
              theme={{
                axis: { ticks: { text: { fill: '#fff' } }, legend: { text: { fill: '#fff' } } },
                legends: { text: { fill: '#fff' } },
                tooltip: { container: { background: '#232526', color: '#fff' } },
              }}
            />
          </div>}
      </div>
      <div className="analytics-chart-card" style={{
        flex: '0 1 340px',
        maxWidth: 360,
        minWidth: 260,
        background: 'rgba(44,44,84,0.93)',
        borderRadius: 22,
        padding: '1.4rem 1rem 1.7rem 1rem',
        boxShadow: '0 2px 24px #23252655',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transition: 'transform 0.2s',
        cursor: 'pointer',
        margin: '0 0.5rem',
      }}
        tabIndex={0}
        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.03)'}
        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <motion.h3 whileHover={{ color: '#ffd700' }} style={{ color: '#fff', fontWeight: 700, fontSize: '1.2rem', marginBottom: 16, textAlign: 'center', letterSpacing: '0.03em' }}>Student Enrollments</motion.h3>
        {loading ? <div style={{ color: '#fff', textAlign: 'center' }}>Loading...</div> :
          <div style={{ width: '100%', height: 210 }}>
            <ResponsiveBar
              data={enrollmentsBarData}
              keys={['Enrollments']}
              indexBy="month"
              margin={{ top: 16, right: 24, bottom: 40, left: 36 }}
              padding={0.3}
              colors={{ scheme: 'category10' }}
              axisBottom={{ tickSize: 5, tickPadding: 5, tickRotation: 0, legend: 'Month', legendOffset: 32, legendPosition: 'middle' }}
              axisLeft={{ tickSize: 5, tickPadding: 5, tickRotation: 0, legend: 'Enrollments', legendOffset: -28, legendPosition: 'middle' }}
              labelSkipWidth={12}
              labelSkipHeight={12}
              labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
              theme={{
                axis: { ticks: { text: { fill: '#fff' } }, legend: { text: { fill: '#fff' } } },
                legends: { text: { fill: '#fff' } },
                tooltip: { container: { background: '#232526', color: '#fff' } },
              }}
            />
          </div>}
      </div>
      <div className="analytics-chart-card" style={{
        flex: '0 1 340px',
        maxWidth: 360,
        minWidth: 260,
        background: 'rgba(44,44,84,0.93)',
        borderRadius: 22,
        padding: '1.4rem 1rem 1.7rem 1rem',
        boxShadow: '0 2px 24px #23252655',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transition: 'transform 0.2s',
        cursor: 'pointer',
        margin: '0 0.5rem',
      }}
        tabIndex={0}
        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.03)'}
        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <motion.h3 whileHover={{ color: '#ffd700' }} style={{ color: '#fff', fontWeight: 700, fontSize: '1.2rem', marginBottom: 16, textAlign: 'center', letterSpacing: '0.03em' }}>Course Engagement</motion.h3>
        <div style={{ width: '100%', height: 210 }}>
          <ResponsivePie
            data={engagementPieData}
            margin={{ top: 24, right: 24, bottom: 24, left: 24 }}
            innerRadius={0.6}
            padAngle={2}
            cornerRadius={3}
            activeOuterRadiusOffset={8}
            colors={{ scheme: 'category10' }}
            borderWidth={1}
            borderColor={{ from: 'color', modifiers: [['darker', 0.6]] }}
            arcLinkLabelsSkipAngle={10}
            arcLinkLabelsTextColor="#fff"
            arcLinkLabelsThickness={2}
            arcLinkLabelsColor={{ from: 'color' }}
            arcLabelsSkipAngle={10}
            arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
            theme={{
              axis: { ticks: { text: { fill: '#fff' } }, legend: { text: { fill: '#fff' } } },
              legends: { text: { fill: '#fff' } },
              tooltip: { container: { background: '#232526', color: '#fff' } },
            }}
          />
        </div>
      </div>
    </section>
  );
}
