import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { getGuildTrendByDate } from '../../data/dataUtils';

const BONE = '#97A1AD';
const BONE_MUTED = '#5C6571';
const LINE = '#1B232E';
const LINE_BRIGHT = '#2E3845';
const TITLE = '#E6EBF2';

export default function GuildTrendChart() {
  const trend = useMemo(() => getGuildTrendByDate().slice(-10), []);

  const data = {
    labels: trend.map(t => t.date),
    datasets: [
      {
        label: 'Avg Team Damage',
        data: trend.map(t => t.avgTeamDamage),
        borderColor: '#F87171',
        backgroundColor: 'rgba(248, 113, 113, 0.12)',
        fill: true,
        tension: 0.3,
        pointRadius: 5,
        pointBackgroundColor: '#F87171',
        pointBorderColor: '#06080A',
        pointBorderWidth: 1.5,
        yAxisID: 'y',
      },
      {
        label: 'Avg Team Healing',
        data: trend.map(t => t.avgTeamHealing),
        borderColor: '#4ADE80',
        backgroundColor: 'rgba(74, 222, 128, 0.12)',
        fill: true,
        tension: 0.3,
        pointRadius: 5,
        pointBackgroundColor: '#4ADE80',
        pointBorderColor: '#06080A',
        pointBorderWidth: 1.5,
        yAxisID: 'y',
      },
      {
        label: 'Win Rate %',
        data: trend.map(t => t.winRate),
        borderColor: '#22D3EE',
        backgroundColor: 'rgba(34, 211, 238, 0.12)',
        fill: true,
        tension: 0.3,
        pointRadius: 5,
        pointBackgroundColor: '#22D3EE',
        pointBorderColor: '#06080A',
        pointBorderWidth: 1.5,
        yAxisID: 'y1',
        borderDash: [4, 3],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: BONE,
          font: { family: "'Inter', system-ui, sans-serif", size: 10, weight: '700' },
          boxWidth: 10,
          boxHeight: 10,
          padding: 14,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(6, 8, 10, 0.96)',
        borderColor: LINE_BRIGHT,
        borderWidth: 1,
        titleColor: TITLE,
        bodyColor: BONE,
        titleFont: { family: "'Inter', system-ui, sans-serif", size: 11, weight: '700' },
        bodyFont: { family: "'Inter', system-ui, sans-serif", size: 11 },
        padding: 10,
      },
    },
    scales: {
      y: {
        type: 'linear',
        position: 'left',
        beginAtZero: true,
        grid: { display: false },
        border: { color: LINE },
        ticks: {
          color: BONE_MUTED,
          font: { family: "'Inter', system-ui, sans-serif", size: 10 },
        },
        title: { display: false },
      },
      y1: {
        type: 'linear',
        position: 'right',
        beginAtZero: true,
        max: 100,
        grid: { display: false },
        border: { color: LINE },
        ticks: {
          color: '#22D3EE',
          font: { family: "'Inter', system-ui, sans-serif", size: 10 },
          callback: v => `${v}%`,
        },
        title: { display: false },
      },
      x: {
        grid: { display: false },
        border: { color: LINE },
        ticks: {
          color: BONE_MUTED,
          autoSkip: false,
          maxRotation: 0,
          minRotation: 0,
          font: { family: "'Inter', system-ui, sans-serif", size: 10, weight: '700' },
          callback: function (_value, index) {
            const date = trend[index]?.date;
            if (!date) return '';
            const parts = date.split('-');
            if (parts.length < 3) return date;
            return `${parseInt(parts[1], 10)}/${parseInt(parts[2], 10)}`;
          },
        },
      },
    },
  };

  return <Line data={data} options={options} />;
}
