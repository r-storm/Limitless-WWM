import { useMemo, useState } from 'react';
import SortableTable from '../SortableTable';
import classNames from '../../../../utils/classNames';
import { getMatchesByOpponent } from '../../data/dataUtils';

function WinRateCell(v) {
  return (
    <span className={`tabular-nums font-semibold ${v >= 50 ? 'text-[var(--dossier-sage)]' : 'text-[var(--dossier-crimson)]'}`}>
      {v}%
    </span>
  );
}

function LastResultCell(v) {
  const isWin = v === 'win';
  return (
    <span className={`inline-block px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider border ${
      isWin
        ? 'border-[var(--dossier-sage)] text-[var(--dossier-sage)] bg-[rgba(74,222,128,0.08)]'
        : 'border-[var(--dossier-crimson)] text-[var(--dossier-crimson)] bg-[rgba(248,113,113,0.08)]'
    }`}>
      {v}
    </span>
  );
}

function KillDiffCell(v) {
  if (v === 0) {
    return <span className="text-[var(--dossier-bone-muted)] tabular-nums">0</span>;
  }
  return (
    <span className={`tabular-nums font-semibold ${v > 0 ? 'text-[var(--dossier-sage)]' : 'text-[var(--dossier-crimson)]'}`}>
      {v > 0 ? `+${v}` : v}
    </span>
  );
}

const columns = [
  { key: 'opponent', label: 'Opponent', align: 'left' },
  { key: 'games', label: 'Matches', align: 'right' },
  { key: 'record', label: 'Record', align: 'right' },
  { key: 'winRate', label: 'Win %', align: 'right', format: WinRateCell },
  { key: 'lastPlayed', label: 'Last Played', align: 'left', hideOnMobile: true },
  { key: 'lastResult', label: 'Last Result', mobileLabel: 'Last', align: 'right', format: LastResultCell },
  { key: 'totalOurKills', label: 'Our Kills', mobileLabel: 'Kills', align: 'right' },
  { key: 'totalEnemyKills', label: 'Enemy Kills', mobileLabel: 'Enemy', align: 'right', hideOnMobile: true },
  { key: 'totalKillDiff', label: 'Kill Diff', mobileLabel: 'Diff', align: 'right', format: KillDiffCell },
  { key: 'avgOurCoins', label: 'Avg Coins', align: 'right', hideOnMobile: true },
];

const resultFilters = [
  { key: 'all', label: 'All' },
  { key: 'wins', label: 'Wins Only' },
  { key: 'losses', label: 'Losses Only' },
];

const modeFilters = [
  { key: 'all', label: 'All Modes' },
  { key: 'league', label: 'League' },
  { key: 'ranked', label: 'Ranked' },
];

export default function OpponentHistoryPage() {
  const [resultFilter, setResultFilter] = useState('all');
  const [modeFilter, setModeFilter] = useState('all');

  const allRows = useMemo(() =>
    getMatchesByOpponent().sort((a, b) => b.games - a.games),
  []);

  const rows = useMemo(() => {
    return allRows.filter(r => {
      if (modeFilter !== 'all' && r.type !== modeFilter) return false;
      if (resultFilter === 'wins' && r.wins === 0) return false;
      if (resultFilter === 'losses' && r.losses === 0) return false;
      return true;
    });
  }, [allRows, resultFilter, modeFilter]);

  const totalGames = rows.reduce((s, r) => s + r.games, 0);
  const totalWins = rows.reduce((s, r) => s + r.wins, 0);
  const overallWinRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;

  const pillBase = 'px-3 py-1.5 text-xs font-semibold uppercase tracking-wider border transition-colors';
  const pillActive = 'bg-[var(--dossier-bone)] text-[var(--dossier-ink)] border-[var(--dossier-bone)]';
  const pillIdle = 'bg-[var(--dossier-ink-2)] text-[var(--dossier-bone-muted)] border-[var(--dossier-line)] hover:text-[var(--dossier-bone)] cursor-pointer';

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--dossier-bone)] tracking-tight">All opponents</h2>
        <div className="text-xs text-[var(--dossier-bone-muted)] tabular-nums">
          {rows.length} {rows.length === 1 ? 'opponent' : 'opponents'}
          <span className="mx-2">·</span>
          {totalGames} {totalGames === 1 ? 'match' : 'matches'}
          <span className="mx-2">·</span>
          <span className={overallWinRate >= 50 ? 'text-[var(--dossier-sage)] font-semibold' : 'text-[var(--dossier-crimson)] font-semibold'}>
            {overallWinRate}% overall
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <FilterRow label="Mode">
          {modeFilters.map(f => (
            <button
              key={f.key}
              onClick={() => setModeFilter(f.key)}
              className={classNames(pillBase, modeFilter === f.key ? pillActive : pillIdle)}
            >
              {f.label}
            </button>
          ))}
        </FilterRow>
        <FilterRow label="Result">
          {resultFilters.map(f => (
            <button
              key={f.key}
              onClick={() => setResultFilter(f.key)}
              className={classNames(pillBase, resultFilter === f.key ? pillActive : pillIdle)}
            >
              {f.label}
            </button>
          ))}
        </FilterRow>
      </div>

      <SortableTable columns={columns} data={rows.map(r => ({ ...r, name: r.opponent }))} />
    </div>
  );
}

function FilterRow({ label, children }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[var(--dossier-bone-muted)] w-16 shrink-0">
        {label}
      </span>
      {children}
    </div>
  );
}
