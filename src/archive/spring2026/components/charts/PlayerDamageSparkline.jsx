import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { getPlayerGameDamage, getPlayerGameStat } from '../../data/dataUtils';

export default function PlayerDamageSparkline({ playerName }) {
  const damages = useMemo(() => getPlayerGameDamage(playerName), [playerName]);

  if (damages.length < 2) return null;

  return <PlayerSparkline values={damages} color="139, 92, 246" />;
}

export function PlayerSparkline({ values, color = '139, 92, 246', showAverage = false }) {
  if (!values || values.length < 2) return null;

  const datasets = [
    {
      data: values,
      borderColor: `rgb(${color})`,
      backgroundColor: `rgba(${color}, 0.1)`,
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      borderWidth: 2,
    },
  ];

  let avg = null;
  if (showAverage) {
    const sum = values.reduce((s, v) => s + (v || 0), 0);
    avg = sum / values.length;
    datasets.push({
      data: values.map(() => avg),
      borderColor: 'rgba(148, 163, 184, 0.55)',
      borderWidth: 1,
      borderDash: [4, 4],
      pointRadius: 0,
      fill: false,
      tension: 0,
    });
  }

  const data = {
    labels: values.map((_, i) => i + 1),
    datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    scales: {
      x: { display: false },
      y: { display: false },
    },
    elements: {
      line: { borderCapStyle: 'round' },
    },
  };

  return (
    <div className="relative h-24">
      <Line data={data} options={options} />
      {showAverage && avg != null && (
        <span className="absolute top-0.5 right-1 text-[10px] font-mono uppercase tracking-wider text-[var(--color-text-muted)]">
          avg
        </span>
      )}
    </div>
  );
}

export function PlayerStatSparkline({ playerName, stat, color, showAverage = false }) {
  const values = useMemo(() => getPlayerGameStat(playerName, stat), [playerName, stat]);
  return <PlayerSparkline values={values} color={color} showAverage={showAverage} />;
}
