import React from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend);

export function CoursesTrendChart({ data }) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Courses Created',
        data: data.values,
        fill: false,
        borderColor: '#185a9d',
        backgroundColor: '#185a9d',
        tension: 0.3,
      },
    ],
  };
  return <Line data={chartData} options={{ responsive: true, plugins: { legend: { display: true } } }} />;
}

export function EarningsBarChart({ data }) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Earnings ($)',
        data: data.values,
        backgroundColor: '#43cea2',
      },
    ],
  };
  return <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: true } } }} />;
}

export function StudentsPieChart({ data }) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: '# Students',
        data: data.values,
        backgroundColor: ['#43cea2', '#185a9d', '#ffd700'],
      },
    ],
  };
  return <Pie data={chartData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />;
}
