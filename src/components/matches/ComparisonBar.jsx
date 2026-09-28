import { formatNumber } from '../../utils/formatters';

export default function ComparisonBar({ label, ourValue, enemyValue, format, inverted }) {
  const fmt = format || formatNumber;
  const total = ourValue + enemyValue;
  const ourPct = total > 0 ? (ourValue / total) * 100 : 50;
  const enemyPct = total > 0 ? (enemyValue / total) * 100 : 50;
  const ourWins = inverted ? ourValue < enemyValue : ourValue > enemyValue;
  const tied = ourValue === enemyValue;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs tabular-nums">
        <span className={ourWins && !tied ? 'text-[var(--dossier-sage)] font-semibold' : 'text-[var(--dossier-bone-soft)]'}>
          {fmt(ourValue)}
        </span>
        <span className="text-[var(--dossier-bone-muted)] uppercase tracking-[0.18em] font-semibold text-[10px]">
          {label}
        </span>
        <span className={!ourWins && !tied ? 'text-[var(--dossier-crimson)] font-semibold' : 'text-[var(--dossier-bone-soft)]'}>
          {fmt(enemyValue)}
        </span>
      </div>
      <div className="flex h-2 overflow-hidden bg-[var(--dossier-ink)] border border-[var(--dossier-line)] rounded-sm gap-px">
        <div
          className="transition-all duration-500 bg-[rgba(74,222,128,0.5)]"
          style={{ width: `${ourPct}%` }}
        />
        <div
          className="transition-all duration-500 bg-[rgba(248,113,113,0.5)]"
          style={{ width: `${enemyPct}%` }}
        />
      </div>
    </div>
  );
}
