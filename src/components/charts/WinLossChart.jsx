import { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { getOverallStats } from '../../data/dataUtils';

export default function WinLossChart() {
  const stats = useMemo(() => getOverallStats(), []);

  const data = {
    labels: ['Wins', 'Losses'],
    datasets: [
      {
        data: [stats.wins, stats.losses],
        backgroundColor: ['rgba(52, 211, 153, 0.7)', 'rgba(248, 113, 113, 0.7)'],
        borderColor: ['rgb(52, 211, 153)', 'rgb(248, 113, 113)'],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  const centerTextPlugin = {
    id: 'centerText',
    afterDraw(chart) {
      const { ctx, width, height } = chart;
      const text = `${stats.winRate}%`;
      ctx.save();
      ctx.font = 'bold 24px ui-sans-serif, system-ui, sans-serif';
      ctx.fillStyle = '#EEEEF0';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, width / 2, height / 2 - 10);
      ctx.font = '12px ui-sans-serif, system-ui, sans-serif';
      ctx.fillStyle = '#8B8B9E';
      ctx.fillText('Win Rate', width / 2, height / 2 + 14);
      ctx.restore();
    },
  };

  return (
    <div className="rounded-xl glass-adaptive border border-[var(--color-border)] p-5">
      <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-4">
        Win / Loss Record
      </h3>
      <div className="h-64">
        <Doughnut data={data} options={options} plugins={[centerTextPlugin]} />
      </div>
    </div>
  );
}
