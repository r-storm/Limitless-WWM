import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { getPointsProgression } from '../../data/dataUtils';

export default function PointsProgressionChart() {
  const { data, options } = useMemo(() => {
    const league = getPointsProgression('league').filter(g => g.gameNum >= 80);
    const ranked = getPointsProgression('ranked').filter(g => g.gameNum >= 80);

    const combined = [...league, ...ranked].sort((a, b) => a.gameNum - b.gameNum);

    const formatDate = (d) => {
      const [datePart] = d.split(' ');
      const [, month, day] = datePart.split('/');
      return `${parseInt(month)}/${parseInt(day)}`;
    };

    const chartData = {
      labels: combined.map(g => formatDate(g.date)),
      datasets: [
        {
          label: 'League',
          data: combined.map(g => {
            const match = league.find(l => l.gameNum === g.gameNum);
            return match ? match.points_after : null;
          }),
          borderColor: 'rgb(96, 165, 250)',
          backgroundColor: 'rgba(96, 165, 250, 0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 5,
          pointBackgroundColor: combined.map(g => {
            const match = league.find(l => l.gameNum === g.gameNum);
            if (!match) return 'transparent';
            return match.result === 'win' ? 'rgb(52, 211, 153)' : 'rgb(248, 113, 113)';
          }),
          spanGaps: true,
          pointBorderWidth: 0,
        },
        {
          label: 'Ranked',
          data: combined.map(g => {
            const match = ranked.find(r => r.gameNum === g.gameNum);
            return match ? match.points_after : null;
          }),
          borderColor: 'rgb(251, 191, 36)',
          backgroundColor: 'rgba(251, 191, 36, 0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 5,
          pointBackgroundColor: combined.map(g => {
            const match = ranked.find(r => r.gameNum === g.gameNum);
            if (!match) return 'transparent';
            return match.result === 'win' ? 'rgb(52, 211, 153)' : 'rgb(248, 113, 113)';
          }),
          spanGaps: true,
          pointBorderWidth: 0,
        },
      ],
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          labels: {
            color: 'rgb(200, 200, 210)',
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 16,
            font: { size: 13 },
            generateLabels: (chart) => chart.data.datasets.map((ds, i) => ({
              text: ds.label,
              fontColor: 'rgb(200, 200, 210)',
              fillStyle: ds.borderColor,
              strokeStyle: ds.borderColor,
              pointStyle: 'circle',
              hidden: !chart.isDatasetVisible(i),
              datasetIndex: i,
            })),
          },
        },
        tooltip: {
          backgroundColor: 'rgba(10, 10, 15, 0.9)',
          titleColor: 'rgb(238, 238, 240)',
          bodyColor: 'rgb(139, 139, 158)',
          borderColor: 'rgba(30, 30, 42, 0.8)',
          borderWidth: 1,
          callbacks: {
            title: (items) => {
              const idx = items[0].dataIndex;
              const g = combined[idx];
              return `${formatDate(g.date)} - vs ${g.opponent}`;
            },
            label: (item) => {
              if (item.raw == null) return null;
              return `${item.dataset.label}: ${item.raw} pts`;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: { color: 'rgb(160, 160, 180)', maxRotation: 45 },
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
        Points Progression
      </h3>
      <div className="h-64">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
