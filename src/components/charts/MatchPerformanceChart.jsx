import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { getAllGameSummaries } from '../../data/dataUtils';

const BONE = '#97A1AD';
const BONE_MUTED = '#5C6571';
const LINE = '#1B232E';
const LINE_BRIGHT = '#2E3845';
const TITLE = '#E6EBF2';

export default function MatchPerformanceChart() {
  const summaries = useMemo(() => getAllGameSummaries().slice(-10), []);

  const data = {
    labels: summaries.map(s => `${s.opponent} (${s.result === 'win' ? 'W' : 'L'})`),
    datasets: [
      {
        label: 'Kills',
        data: summaries.map(s => s.totalKills),
        borderColor: '#22D3EE',
        backgroundColor: 'rgba(34, 211, 238, 0.14)',
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: '#22D3EE',
        pointBorderColor: '#06080A',
        pointBorderWidth: 1.5,
      },
      {
        label: 'Deaths',
        data: summaries.map(s => s.totalDeaths),
        borderColor: '#F87171',
        backgroundColor: 'rgba(248, 113, 113, 0.12)',
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: '#F87171',
        pointBorderColor: '#06080A',
        pointBorderWidth: 1.5,
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
        callbacks: {
          title: ctx =>
            `Match ${summaries[ctx[0].dataIndex].gameNum} (${summaries[ctx[0].dataIndex].result === 'win' ? 'W' : 'L'}) — ${ctx[0].label}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { display: false },
        border: { color: LINE },
        ticks: {
          color: BONE_MUTED,
          font: { family: "'Inter', system-ui, sans-serif", size: 10 },
        },
      },
      x: {
        grid: { display: false },
        border: { color: LINE },
        ticks: {
          color: summaries.map(s => (s.result === 'win' ? '#4ADE80' : '#F87171')),
          autoSkip: false,
          maxRotation: 0,
          minRotation: 0,
          font: { family: "'Inter', system-ui, sans-serif", size: 10, weight: '700' },
          callback: function (_value, index) {
            const s = summaries[index];
            if (!s) return '';
            const name = s.opponent || '';
            const result = s.result === 'win' ? 'W' : 'L';
            const short = name.length > 6 ? name.slice(0, 6) + '…' : name;
            return `${short} ${result}`;
          },
        },
      },
    },
  };

  return <Line data={data} options={options} />;
}
