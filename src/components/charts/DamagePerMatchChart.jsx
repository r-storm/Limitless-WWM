import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { getAllGameSummaries } from '../../data/dataUtils';
import { formatNumber } from '../../utils/formatters';

export default function DamagePerMatchChart() {
  const summaries = useMemo(() => getAllGameSummaries().slice(-5), []);

  const data = {
    labels: summaries.map(s => s.date.slice(5)),
    datasets: [
      {
        label: 'Damage',
        data: summaries.map(s => s.totalDamage),
        backgroundColor: 'rgba(248, 113, 113, 0.6)',
        borderColor: 'rgb(248, 113, 113)',
        borderWidth: 1,
        borderRadius: 6,
      },
      {
        label: 'Healing',
        data: summaries.map(s => s.totalHealing),
        backgroundColor: 'rgba(52, 211, 153, 0.6)',
        borderColor: 'rgb(52, 211, 153)',
        borderWidth: 1,
        borderRadius: 6,
      },
      {
        label: 'Siege',
        data: summaries.map(s => s.totalSiege),
        backgroundColor: 'rgba(148, 163, 184, 0.6)',
        borderColor: 'rgb(148, 163, 184)',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          title: ctx => `Match ${summaries[ctx[0].dataIndex].gameNum} (${summaries[ctx[0].dataIndex].result === 'win' ? 'W' : 'L'}) — ${ctx[0].label}`,
          label: ctx => `${ctx.dataset.label}: ${formatNumber(ctx.raw)}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: v => formatNumber(v) },
        grid: { display: false },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  return (
    <div className="rounded-xl glass-adaptive border border-[var(--color-border)] p-5">
      <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-4">
        Damage, Healing & Siege (Last 5 Matches)
      </h3>
      <div className="h-64">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
