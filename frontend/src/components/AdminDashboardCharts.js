import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const userGrowthData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  datasets: [
    {
      label: 'Users',
      data: [120, 210, 320, 480, 600, 800, 1000],
      borderColor: '#a18cd1',
      backgroundColor: 'rgba(161,140,209,0.15)',
      tension: 0.4,
      fill: true,
    },
  ],
};

const courseGrowthData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  datasets: [
    {
      label: 'Courses',
      data: [2, 6, 12, 18, 28, 43, 74],
      backgroundColor: '#fbc2eb',
      borderRadius: 8,
    },
  ],
};

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    title: { display: false },
  },
  scales: {
    x: { grid: { display: false } },
    y: { grid: { color: '#f3e6fa' } },
  },
};

export default function AdminDashboardCharts() {
  return (
    <motion.div className="dashboard-charts-row" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
      <div className="chart-card glass">
        <h3>User Growth (Monthly)</h3>
        <Line data={userGrowthData} options={chartOptions} />
      </div>
      <div className="chart-card glass">
        <h3>Course Growth (Monthly)</h3>
        <Bar data={courseGrowthData} options={chartOptions} />
      </div>
    </motion.div>
  );
}
