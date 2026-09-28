import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { getAllGameSummaries } from '../../data/dataUtils';
import { formatNumber } from '../../utils/formatters';

const BONE = '#97A1AD';
const BONE_MUTED = '#5C6571';
const LINE = '#1B232E';
const LINE_BRIGHT = '#2E3845';
const TITLE = '#E6EBF2';

export default function TopDamageChart() {
  const summaries = useMemo(() => getAllGameSummaries().slice(-10), []);

  const data = {
    labels: summaries.map(s => `${s.opponent} (${s.result === 'win' ? 'W' : 'L'})`),
    datasets: [
      {
        label: 'Damage',
        data: summaries.map(s => s.totalDamage),
        backgroundColor: 'rgba(248, 113, 113, 0.55)',
        borderColor: '#F87171',
        borderWidth: 1,
        borderRadius: { topLeft: 0, topRight: 0, bottomLeft: 4, bottomRight: 4 },
      },
      {
        label: 'Healing',
        data: summaries.map(s => s.totalHealing),
        backgroundColor: 'rgba(74, 222, 128, 0.5)',
        borderColor: '#4ADE80',
        borderWidth: 1,
      },
      {
        label: 'Tank',
        data: summaries.map(s => s.totalTank),
        backgroundColor: 'rgba(34, 211, 238, 0.55)',
        borderColor: '#22D3EE',
        borderWidth: 1,
      },
      {
        label: 'Siege',
        data: summaries.map(s => s.totalSiege),
        backgroundColor: 'rgba(148, 163, 184, 0.4)',
        borderColor: '#94A3B8',
        borderWidth: 1,
        borderRadius: { topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 },
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
          label: ctx => `${ctx.dataset.label}: ${formatNumber(ctx.raw)}`,
          afterBody: ctx => {
            const i = ctx[0].dataIndex;
            const total =
              summaries[i].totalDamage +
              summaries[i].totalHealing +
              summaries[i].totalSiege +
              summaries[i].totalTank;
            return `Total: ${formatNumber(total)}`;
          },
        },
      },
    },
    scales: {
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: {
          callback: v => formatNumber(v),
          color: BONE_MUTED,
          font: { family: "'Inter', system-ui, sans-serif", size: 10 },
        },
        grid: { display: false },
        border: { color: LINE },
      },
      x: {
        stacked: true,
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

  return <Bar data={data} options={options} />;
}
