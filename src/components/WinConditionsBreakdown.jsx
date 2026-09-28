import { useMemo } from 'react';
import { getWinConditionBreakdown, getRecordByType } from '../data/dataUtils';
import { gameDefinitions } from '../data/gameDefinitions';

const WIN_CONDITION_LABELS = {
  tree_delivered: 'Tree Delivered',
  tree_distance: 'Tree Distance',
  goose_hp: 'Goose HP',
  bulwark: 'Bulwark',
  unknown: 'Unknown',
};

function StatCard({ label, wins, losses, footer }) {
  const total = wins + losses;
  return (
    <div className="glass-adaptive border border-[var(--color-border)] rounded-xl p-4">
      <p className="text-xs text-[var(--color-text-muted)] mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-bold font-mono text-emerald-400">{wins}W</span>
        <span className="text-lg font-bold font-mono text-red-400">{losses}L</span>
      </div>
      <p className="text-xs text-[var(--color-text-muted)] mt-1">
        {footer ?? `${total} match${total !== 1 ? 'es' : ''}`}
      </p>
    </div>
  );
}

function ModeCard({ league, ranked }) {
  return (
    <div className="glass-adaptive border border-[var(--color-border)] rounded-xl p-4">
      <p className="text-xs text-[var(--color-text-muted)] mb-1">Mode</p>
      <div className="flex flex-col gap-0.5">
        <div className="flex items-baseline gap-1.5">
          <span className="text-xs text-[var(--color-text-secondary)] w-12">League</span>
          <span className="text-sm font-bold font-mono text-emerald-400">{league.wins}W</span>
          <span className="text-sm font-bold font-mono text-red-400">{league.losses}L</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xs text-[var(--color-text-secondary)] w-12">Ranked</span>
          <span className="text-sm font-bold font-mono text-emerald-400">{ranked.wins}W</span>
          <span className="text-sm font-bold font-mono text-red-400">{ranked.losses}L</span>
        </div>
      </div>
    </div>
  );
}

export default function WinConditionsBreakdown() {
  const winConditions = useMemo(() => getWinConditionBreakdown(), []);
  const leagueRecord = useMemo(() => getRecordByType('league'), []);
  const rankedRecord = useMemo(() => getRecordByType('ranked'), []);
  const recentForm = useMemo(() => {
    const recent = [...gameDefinitions]
      .filter(g => g.opponent && g.result)
      .sort((a, b) => b.gameNum - a.gameNum)
      .slice(0, 5);
    const wins = recent.filter(g => g.result === 'win').length;
    return { wins, losses: recent.length - wins };
  }, []);

  if (!winConditions) return null;

  return (
    <div>
      <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">
        Win Conditions
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Object.entries(WIN_CONDITION_LABELS).filter(([key]) => key !== 'unknown').map(([key, label]) => {
          const wins = winConditions.wins[key] || 0;
          const losses = winConditions.losses[key] || 0;
          if (wins + losses === 0) return null;
          return <StatCard key={key} label={label} wins={wins} losses={losses} />;
        })}
        <ModeCard league={leagueRecord} ranked={rankedRecord} />
        <StatCard label="Last 5" wins={recentForm.wins} losses={recentForm.losses} footer="recent form" />
      </div>
    </div>
  );
}
