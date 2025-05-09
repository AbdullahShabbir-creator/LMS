import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import '../styles/dashboard.modern.css';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const data = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Earnings',
      data: [400, 800, 650, 1200, 900, 1350],
      fill: false,
      backgroundColor: '#6a11cb',
      borderColor: '#6a11cb',
      tension: 0.4
    }
  ]
};

const options = {
  responsive: true,
  plugins: {
    legend: { display: false },
    title: { display: true, text: 'Earnings (Last 6 Months)', color: '#fff', font: { size: 18 } }
  },
  scales: {
    x: { ticks: { color: '#fff' }, grid: { color: '#444' } },
    y: { ticks: { color: '#fff' }, grid: { color: '#444' } }
  }
};

export default function EarningsChart() {
  return (
    <div className="dashboard-earnings-chart">
      <Line data={data} options={options} />
    </div>
  );
}
