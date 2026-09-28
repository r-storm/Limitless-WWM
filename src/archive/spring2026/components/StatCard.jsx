import { formatNumber } from '../../../utils/formatters';
import classNames from '../../../utils/classNames';

const accentMap = {
  blue: 'text-[var(--dossier-bone)]',
  violet: 'text-[var(--dossier-bone)]',
  purple: 'text-[var(--dossier-bone)]',
  amber: 'text-[var(--dossier-amber)]',
  red: 'text-[var(--dossier-crimson)]',
  green: 'text-[var(--dossier-sage)]',
};

export default function StatCard({ label, mobileLabel, value, numeric = true, icon: Icon, accent = 'blue' }) {
  const valueColor = accentMap[accent] || accentMap.blue;

  return (
    <div className="bg-[var(--dossier-ink-2)] border border-[var(--dossier-line)] rounded-sm p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
      {Icon && (
        <div className="flex h-9 w-9 items-center justify-center rounded-sm shrink-0 bg-[var(--dossier-ink)] border border-[var(--dossier-line)]">
          <Icon className="h-5 w-5 text-[var(--dossier-bone)]" />
        </div>
      )}
      <div className={Icon ? '' : 'w-full'}>
        {mobileLabel ? (
          <>
            <div className="sm:hidden text-[var(--dossier-bone-muted)] text-[10px] uppercase tracking-[0.18em] font-semibold mb-1">{mobileLabel}</div>
            <div className="hidden sm:block text-[var(--dossier-bone-muted)] text-[10px] uppercase tracking-[0.18em] font-semibold mb-1">{label}</div>
          </>
        ) : (
          <div className="text-[var(--dossier-bone-muted)] text-[10px] uppercase tracking-[0.18em] font-semibold mb-1">{label}</div>
        )}
        <div className={classNames(
          'text-xl sm:text-2xl font-bold tabular-nums leading-none',
          valueColor,
        )}>
          {numeric ? formatNumber(value) : value}
        </div>
      </div>
    </div>
  );
}
