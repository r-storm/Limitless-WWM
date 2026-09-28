import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { getFunCoinsTrend } from '../../data/dataUtils';
import { formatNumber } from '../../../../utils/formatters';

export default function FunCoinsTrendChart() {
  const { data, options } = useMemo(() => {
    const trend = getFunCoinsTrend();

    const chartData = {
      labels: trend.map(d => d.date.replace('2026/', '')),
      datasets: [
        {
          label: 'Ours',
          data: trend.map(d => d.ours),
          backgroundColor: 'rgba(52, 211, 153, 0.7)',
          borderRadius: 6,
        },
        {
          label: 'Enemy',
          data: trend.map(d => d.enemy),
          backgroundColor: 'rgba(248, 113, 113, 0.7)',
          borderRadius: 6,
        },
      ],
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: 'rgb(200, 200, 210)', usePointStyle: true, pointStyle: 'circle', padding: 16, font: { size: 13 } },
        },
        tooltip: {
          backgroundColor: 'rgba(10, 10, 15, 0.9)',
          titleColor: 'rgb(238, 238, 240)',
          bodyColor: 'rgb(139, 139, 158)',
          borderColor: 'rgba(30, 30, 42, 0.8)',
          borderWidth: 1,
          callbacks: {
            label: (item) => `${item.dataset.label}: ${formatNumber(item.raw)}`,
          },
        },
      },
      scales: {
        x: {
          ticks: { color: 'rgb(160, 160, 180)' },
          grid: { color: 'rgba(30, 30, 42, 0.5)' },
        },
        y: {
          ticks: { color: 'rgb(160, 160, 180)' },
          grid: { color: 'rgba(30, 30, 42, 0.5)' },
          beginAtZero: true,
        },
      },
    };

    return { data: chartData, options: chartOptions };
  }, []);

  return (
    <div className="rounded-xl glass-adaptive border border-[var(--color-border)] p-3 sm:p-5">
      <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-4">
        Fun Coins per War Day
      </h3>
      <div className="h-64">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
