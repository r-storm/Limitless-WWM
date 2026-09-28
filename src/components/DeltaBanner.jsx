import { getDeltaStats } from '../data/dataUtils';
import { formatNumber, formatDelta } from '../utils/formatters';

const metrics = [
  { key: 'avgTeamDamage', label: 'Avg Team Damage', mobileLabel: 'Avg Damage', format: v => formatNumber(v), invertDelta: false },
  { key: 'avgTeamHealing', label: 'Avg Team Healing', mobileLabel: 'Avg Healing', format: v => formatNumber(v), invertDelta: false },
  { key: 'winRate', label: 'Win Rate', mobileLabel: 'Win Rate', format: v => `${v.toFixed(0)}%`, invertDelta: false },
  { key: 'avgTeamKDA', label: 'Team KDA', mobileLabel: 'Team KDA', format: v => v.toFixed(2), invertDelta: false },
  { key: 'avgTeamDeaths', label: 'Avg Deaths', mobileLabel: 'Avg Deaths', format: v => v, invertDelta: true },
];

export default function DeltaBanner() {
  const delta = getDeltaStats();
  if (!delta) return null;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-3">
        <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
          Weekly Progress
        </h3>
        <span className="text-xs text-[var(--color-text-muted)]">
          {delta.currentDate} vs {delta.previousDate}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {metrics.map(m => {
          const data = delta[m.key];
          const isPositive = m.invertDelta ? data.delta < 0 : data.delta > 0;
          const isNeutral = Math.abs(data.delta) < 0.1;
          const actualUp = data.delta > 0;
          const arrow = isNeutral ? '\u2192' : actualUp ? '\u2191' : '\u2193';
          const color = isNeutral
            ? 'text-[var(--color-text-muted)]'
            : isPositive ? 'text-emerald-400' : 'text-red-400';

          return (
            <div key={m.key} className="glass-adaptive border border-[var(--color-border)] rounded-xl p-3 sm:p-4 min-w-0 text-center">
              <div className="sm:hidden text-[var(--color-text-muted)] text-xs uppercase tracking-wider mb-0.5 truncate">{m.mobileLabel}</div>
              <div className="hidden sm:block text-[var(--color-text-muted)] text-xs uppercase tracking-wider mb-0.5 truncate">{m.label}</div>
              <div className="font-mono font-bold text-lg text-[var(--color-text-primary)] truncate">{m.format(data.current)}</div>
              <div className={`text-sm font-semibold mt-1 ${color} truncate`}>
                {arrow} {formatDelta(data.delta)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
