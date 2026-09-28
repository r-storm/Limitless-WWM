import { useState, useMemo } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { XMarkIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import {
  getPlayerDetails,
  getPlayerPersonalBests,
  getPlayerTrendByDate,
  getPlayerWeeklyComparison,
  getPlayerVsBenchmark,
  getPlayerPrimaryRole,
  getPlayerRoles,
  getPlayerScopedReport,
  getPlayerNewness,
} from '../data/dataUtils';
import { gameDefinitions } from '../data/gameDefinitions';
import { getCoachingNotes, getStrengthNotes } from '../data/coachingNotes';
import { formatNumber } from '../utils/formatters';
import { PlayerSparkline } from './charts/PlayerDamageSparkline';
import classNames from '../utils/classNames';
import ClassIcon from './ClassIcon';

function StatGroup({ title, children, cols }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">{title}</h3>
      <div className={classNames('grid gap-3', cols || 'grid-cols-2 sm:grid-cols-3')}>
        {children}
      </div>
    </div>
  );
}

function StatCell({ label, value, highlight, info }) {
  return (
    <div className="relative bg-[var(--color-bg-card)] rounded-xl p-4 text-center group/cell">
      {info && (
        <div className="absolute top-2 right-2 group/info">
          <InformationCircleIcon className="h-3.5 w-3.5 text-[var(--color-text-muted)] opacity-40 group-hover/cell:opacity-100 transition-opacity cursor-help" />
          <div className="absolute bottom-full right-0 mb-1.5 px-2.5 py-1.5 text-xs text-[var(--color-text-primary)] bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg shadow-lg whitespace-normal w-48 text-left opacity-0 pointer-events-none group-hover/info:opacity-100 group-hover/info:pointer-events-auto transition-opacity z-10">
            {info}
          </div>
        </div>
      )}
      <div className="text-[var(--color-text-muted)] text-xs uppercase tracking-wider mb-1.5">{label}</div>
      <div className={`font-mono font-bold text-lg ${highlight ? 'text-cyan-400' : 'text-[var(--color-text-primary)]'}`}>
        {value}
      </div>
    </div>
  );
}

const GRADE_DOT = {
  A: 'bg-emerald-400',
  B: 'bg-blue-400',
  C: 'bg-amber-400',
  D: 'bg-red-400',
};

function GradeCard({ label, grade, value, info, percentile, nextHint }) {
  const gradeColor = grade === 'A' ? 'text-emerald-400' :
    grade === 'B' ? 'text-blue-400' :
    grade === 'C' ? 'text-amber-400' : 'text-red-400';
  const gradeBg = grade === 'A' ? 'bg-emerald-500/10 border-emerald-500/30' :
    grade === 'B' ? 'bg-blue-500/10 border-blue-500/30' :
    grade === 'C' ? 'bg-amber-500/10 border-amber-500/30' :
    grade === 'D' ? 'bg-red-500/10 border-red-500/30' :
    'bg-[var(--color-bg-elevated)] border-[var(--color-border)]';
  const barColor = grade === 'A' ? 'bg-emerald-400' :
    grade === 'B' ? 'bg-blue-400' :
    grade === 'C' ? 'bg-amber-400' : 'bg-red-400';

  const isStructuredInfo = info && typeof info === 'object';

  return (
    <div className="relative bg-[var(--color-bg-card)] rounded-xl p-4 group/cell flex items-stretch gap-4">
      {/* Grade chip on the left */}
      <div className={classNames(
        'shrink-0 w-16 h-16 rounded-xl border flex items-center justify-center self-center',
        gradeBg,
      )}>
        {grade ? (
          <span className={`font-mono font-bold text-3xl leading-none ${gradeColor}`}>{grade}</span>
        ) : (
          <span className="text-[var(--color-text-muted)] text-[10px] uppercase tracking-wider text-center px-1 leading-tight">N/A</span>
        )}
      </div>

      {/* Detail on the right */}
      <div className="min-w-0 flex-1 flex flex-col justify-center">
        <div className="flex items-start justify-between gap-2">
          <div className="text-[var(--color-text-secondary)] text-xs uppercase tracking-wider font-semibold">{label}</div>
          {info && (
            <div className="relative shrink-0 group/info">
              <InformationCircleIcon className="h-4 w-4 text-[var(--color-text-muted)] opacity-50 group-hover/cell:opacity-100 transition-opacity cursor-help" />
              <div className="absolute top-full right-0 mt-1.5 text-xs text-[var(--color-text-primary)] bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg shadow-lg whitespace-normal w-72 text-left opacity-0 pointer-events-none group-hover/info:opacity-100 group-hover/info:pointer-events-auto transition-opacity z-20">
                {isStructuredInfo ? (
                  <div className="p-3 space-y-2.5">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider font-semibold text-[var(--color-text-muted)] mb-1">Description</div>
                      <div className="text-[var(--color-text-secondary)] leading-snug">{info.description}</div>
                    </div>
                    {info.grades && info.grades.length > 0 && (
                      <div>
                        <div className="text-[10px] uppercase tracking-wider font-semibold text-[var(--color-text-muted)] mb-1.5">Grade Thresholds</div>
                        <ul className="space-y-1">
                          {info.grades.map(g => (
                            <li key={g.grade} className="flex items-baseline gap-2">
                              <span className={classNames(
                                'inline-flex shrink-0 w-4 h-4 rounded-sm items-center justify-center font-mono font-bold text-[10px] leading-none self-center',
                                GRADE_DOT[g.grade] || 'bg-[var(--color-bg-elevated)]',
                                g.grade === 'C' || g.grade === 'D' ? 'text-black' : 'text-black',
                              )}>
                                {g.grade}
                              </span>
                              <span className="text-[var(--color-text-secondary)] tabular-nums">{g.threshold}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {info.note && (
                      <div className="text-[11px] text-[var(--color-text-muted)] leading-snug pt-1 border-t border-[var(--color-border)]">
                        {info.note}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="px-2.5 py-1.5">{info}</div>
                )}
              </div>
            </div>
          )}
        </div>
        {grade ? (
          <>
            <div className="font-mono font-bold text-base text-[var(--color-text-primary)] mt-0.5">{value}</div>
            {percentile != null && (
              <div className="mt-2">
                <div className="h-1.5 rounded-full bg-[var(--color-bg-elevated)] overflow-hidden">
                  <div className={`h-full ${barColor}`} style={{ width: `${Math.max(percentile, 4)}%` }} />
                </div>
                <div className="text-[11px] text-[var(--color-text-muted)] mt-0.5">Top {Math.max(100 - percentile, 1)}% of role</div>
              </div>
            )}
            {nextHint && (
              <div className="text-[11px] text-[var(--color-text-secondary)] mt-1.5 leading-snug">
                {nextHint}
              </div>
            )}
          </>
        ) : (
          <div className="text-[var(--color-text-muted)] text-xs mt-1">Needs more matches in window</div>
        )}
      </div>
    </div>
  );
}

function FilterBar({ resultFilter, setResultFilter, dateFilter, setDateFilter, dates, totalCount, filteredCount }) {
  const resultOptions = [
    { key: 'all', label: 'All' },
    { key: 'win', label: 'Wins' },
    { key: 'loss', label: 'Losses' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <div className="flex items-center gap-1.5">
        {resultOptions.map(opt => (
          <button
            key={opt.key}
            onClick={() => setResultFilter(opt.key)}
            className={classNames(
              'px-3 py-1.5 rounded-lg text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer',
              resultFilter === opt.key
                ? 'bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <select
        value={dateFilter}
        onChange={e => setDateFilter(e.target.value)}
        className="px-3 py-1.5 rounded-lg text-xs uppercase tracking-wider font-semibold bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] border border-[var(--color-border)] cursor-pointer"
      >
        <option value="all">All War Days</option>
        {dates.map(d => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>
      <span className="text-xs text-[var(--color-text-muted)] ml-auto">
        Showing {filteredCount} of {totalCount} matches
      </span>
    </div>
  );
}

const TREND_TABS = [
  { key: 'damage', label: 'Damage', stat: 'damage', color: '34, 211, 238', always: true },
  { key: 'heal', label: 'Healing', stat: 'heal', color: '52, 211, 153', totalKey: 'total_heal' },
  { key: 'tank', label: 'Tank', stat: 'tank', color: '59, 130, 246', totalKey: 'total_tank' },
  { key: 'siege', label: 'Siege', stat: 'siege_damage', color: '251, 191, 36', totalKey: 'total_siege' },
];

function TrendTabs({ games }) {
  const sortedGames = useMemo(
    () => [...(games || [])].sort((a, b) => a.game_num - b.game_num),
    [games],
  );
  const totals = useMemo(() => {
    const t = { heal: 0, tank: 0, siege: 0 };
    for (const g of sortedGames) { t.heal += g.heal || 0; t.tank += g.tank || 0; t.siege += g.siege_damage || 0; }
    return t;
  }, [sortedGames]);
  const availableTabs = useMemo(
    () => TREND_TABS.filter(t => {
      if (t.always) return true;
      if (t.key === 'heal') return totals.heal > 0;
      if (t.key === 'tank') return totals.tank > 0;
      if (t.key === 'siege') return totals.siege > 0;
      return false;
    }),
    [totals],
  );
  const [activeTab, setActiveTab] = useState('damage');
  const current = availableTabs.find(t => t.key === activeTab) || availableTabs[0];
  const values = useMemo(
    () => current ? sortedGames.map(g => g[current.stat] || 0) : [],
    [sortedGames, current],
  );

  if (sortedGames.length < 2) {
    return (
      <div className="rounded-xl bg-[var(--color-bg-card)] p-6 text-center text-xs text-[var(--color-text-muted)]">
        Need at least 2 matches in this window to show a trend.
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-[var(--color-bg-card)] p-4">
      <div className="flex items-center gap-1.5 mb-4 overflow-x-auto scrollbar-none">
        {availableTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={classNames(
              'px-3 sm:px-4 py-1.5 rounded-lg text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0',
              tab.key === current.key
                ? 'bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <PlayerSparkline values={values} color={current.color} showAverage />
      <p className="mt-2 text-[10px] text-[var(--color-text-muted)] text-center">Dashed line shows your match-by-match average</p>
    </div>
  );
}

function ComparisonTab({ playerName, player }) {
  const [axis, setAxis] = useState('week');
  const weekly = useMemo(() => getPlayerWeeklyComparison(playerName), [playerName]);
  const vsGuild = useMemo(() => getPlayerVsBenchmark(playerName, 'guild'), [playerName]);
  const vsRole = useMemo(() => getPlayerVsBenchmark(playerName, 'role'), [playerName]);

  const axisOptions = [
    { key: 'week', label: 'Week vs Week', available: !!weekly },
    { key: 'guild', label: 'vs Guild Avg', available: !!vsGuild },
    { key: 'role', label: 'vs Same Role', available: !!vsRole },
  ];

  const hasHealing = player.total_heal > 0;
  const hasTank = player.total_tank > 0;
  const hasSiege = player.total_siege > 0;

  let rows = [];
  let leftLabel = '';
  let rightLabel = '';

  if (axis === 'week' && weekly) {
    const { current, previous, deltas } = weekly;
    leftLabel = previous.weekLabel;
    rightLabel = current.weekLabel;
    rows = [
      { label: 'Games Played', left: previous.games, right: current.games, delta: deltas.games, fmt: v => v },
      { label: 'Win Rate', left: `${previous.winRate.toFixed(0)}%`, right: `${current.winRate.toFixed(0)}%`, delta: deltas.winRate, fmt: null, suffix: 'pp' },
      { label: 'Avg Damage', left: previous.avgDamage, right: current.avgDamage, delta: deltas.avgDamage, fmt: formatNumber },
      { label: 'Avg Kills', left: previous.avgKills, right: current.avgKills, delta: deltas.avgKills, fmt: v => v },
      { label: 'Avg Assists', left: previous.avgAssists, right: current.avgAssists, delta: deltas.avgAssists, fmt: v => v },
      { label: 'Avg Deaths', left: previous.avgDeaths, right: current.avgDeaths, delta: deltas.avgDeaths, fmt: v => v, invert: true },
      { label: 'KDA', left: previous.kda, right: current.kda, delta: deltas.kda, fmt: v => v },
      ...(hasHealing ? [{ label: 'Avg Healing', left: previous.avgHeal, right: current.avgHeal, delta: deltas.avgHeal, fmt: formatNumber }] : []),
      ...(hasTank ? [{ label: 'Avg Tank', left: previous.avgTank, right: current.avgTank, delta: deltas.avgTank, fmt: formatNumber }] : []),
      ...(hasSiege ? [{ label: 'Avg Siege', left: previous.avgSiege, right: current.avgSiege, delta: deltas.avgSiege, fmt: formatNumber }] : []),
    ];
  } else if ((axis === 'guild' || axis === 'role')) {
    const data = axis === 'role' ? vsRole : vsGuild;
    if (!data) {
      return (
        <div className="text-center py-12">
          <p className="text-[var(--color-text-muted)] text-sm">Not enough data for this comparison.</p>
        </div>
      );
    }
    const { player: pl, benchmark, deltas } = data;
    leftLabel = axis === 'role' ? `${data.role} avg (n=${benchmark.sampleSize})` : `Guild avg (n=${benchmark.sampleSize})`;
    rightLabel = playerName;
    rows = [
      { label: 'Win Rate', left: `${benchmark.winRate}%`, right: `${pl.winRate}%`, delta: deltas.winRate, fmt: null, suffix: 'pp' },
      { label: 'Avg Damage', left: benchmark.avgDamage, right: pl.avgDamage, delta: deltas.avgDamage, fmt: formatNumber },
      { label: 'Avg Kills', left: benchmark.avgKills, right: pl.avgKills, delta: deltas.avgKills, fmt: v => v },
      { label: 'Avg Assists', left: benchmark.avgAssists, right: pl.avgAssists, delta: deltas.avgAssists, fmt: v => v },
      { label: 'Avg Deaths', left: benchmark.avgDeaths, right: pl.avgDeaths, delta: deltas.avgDeaths, fmt: v => v, invert: true },
      { label: 'KDA', left: benchmark.kda, right: pl.kda, delta: deltas.kda, fmt: v => v },
      ...(hasHealing ? [{ label: 'Avg Healing', left: benchmark.avgHeal, right: pl.avgHeal, delta: deltas.avgHeal, fmt: formatNumber }] : []),
      ...(hasTank ? [{ label: 'Avg Tank', left: benchmark.avgTank, right: pl.avgTank, delta: deltas.avgTank, fmt: formatNumber }] : []),
      ...(hasSiege ? [{ label: 'Avg Siege', left: benchmark.avgSiege, right: pl.avgSiege, delta: deltas.avgSiege, fmt: formatNumber }] : []),
    ];
  } else {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--color-text-muted)] text-sm">Not enough data to compare weeks.</p>
        <p className="text-[var(--color-text-muted)] text-xs mt-1">This player needs at least 2 weekends of match history.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-1.5">
        {axisOptions.map(opt => (
          <button
            key={opt.key}
            onClick={() => opt.available && setAxis(opt.key)}
            disabled={!opt.available}
            className={classNames(
              'px-3 py-1.5 rounded-lg text-xs uppercase tracking-wider font-semibold transition-colors',
              !opt.available && 'opacity-40 cursor-not-allowed',
              opt.available && 'cursor-pointer',
              axis === opt.key
                ? 'bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="text-center">
        <span className="text-sm text-[var(--color-text-muted)]">{leftLabel}</span>
        <span className="mx-2 text-[var(--color-text-muted)]">&rarr;</span>
        <span className="text-sm font-semibold text-[var(--color-text-primary)]">{rightLabel}</span>
      </div>

      <div className="relative rounded-xl border border-[var(--color-border)]">
        <div className="overflow-x-auto">
          <table className="w-full text-base">
            <thead>
              <tr className="bg-[var(--color-bg-elevated)] border-b border-[var(--color-border)]">
                <th className="px-4 py-3 text-left text-[var(--color-text-muted)] text-sm uppercase tracking-wider">Stat</th>
                <th className="px-4 py-3 text-right text-[var(--color-text-muted)] text-sm uppercase tracking-wider">{axis === 'week' ? 'Previous' : 'Benchmark'}</th>
                <th className="px-4 py-3 text-right text-[var(--color-text-muted)] text-sm uppercase tracking-wider">{axis === 'week' ? 'Current' : 'Player'}</th>
                <th className="px-4 py-3 text-right text-[var(--color-text-muted)] text-sm uppercase tracking-wider">Change</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => {
                const delta = row.delta;
                const isPositive = row.invert ? delta < 0 : delta > 0;
                const isNegative = row.invert ? delta > 0 : delta < 0;
                const isNeutral = delta === 0;

                return (
                  <tr key={row.label} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-card-hover)] transition-colors">
                    <td className="px-4 py-3 text-[var(--color-text-secondary)] text-sm font-medium">{row.label}</td>
                    <td className="px-4 py-3 text-right font-mono text-[var(--color-text-muted)]">
                      {row.fmt ? row.fmt(row.left) : row.left}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-[var(--color-text-primary)]">
                      {row.fmt ? row.fmt(row.right) : row.right}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isNeutral ? (
                        <span className="text-[var(--color-text-muted)] text-xs font-mono">-</span>
                      ) : (
                        <span className={classNames(
                          'inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold font-mono',
                          isPositive && 'bg-emerald-500/15 text-emerald-400',
                          isNegative && 'bg-red-500/15 text-red-400',
                        )}>
                          {isPositive ? '↑' : '↓'}
                          {row.suffix
                            ? `${Math.abs(delta).toFixed(0)}${row.suffix}`
                            : `${Math.abs(delta).toFixed(1)}%`
                          }
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const SCOPE_OPTIONS = [
  { key: '4w', label: 'Last 4 weeks', scope: { type: 'weeks', value: 4 } },
  { key: '2w', label: 'Last 2 weeks', scope: { type: 'weeks', value: 2 } },
];

function ScopeSelector({ scopeKey, setScopeKey }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] mr-1">Filter:</span>
      {SCOPE_OPTIONS.map(opt => (
        <button
          key={opt.key}
          onClick={() => setScopeKey(opt.key)}
          className={classNames(
            'px-3 py-1 rounded-lg text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer',
            scopeKey === opt.key
              ? 'bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)]'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function PlayerModal({ playerName, onClose }) {
  const player = getPlayerDetails(playerName);
  const [activeTab, setActiveTab] = useState('report');
  const [resultFilter, setResultFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [scopeKey, setScopeKey] = useState('4w');

  // Map gameNum -> match type/opponent for breakdown enrichment
  const gameTypeMap = useMemo(() => {
    const m = new Map();
    for (const g of gameDefinitions) m.set(g.gameNum, { type: g.type, opponent: g.opponent });
    return m;
  }, []);

  // For each war day, list the match types the player participated in
  const dayTypeMap = useMemo(() => {
    const m = new Map();
    if (!player) return m;
    for (const g of player.games) {
      const date = g.date.split(' ')[0];
      const meta = gameTypeMap.get(g.game_num);
      if (!meta?.type) continue;
      if (!m.has(date)) m.set(date, new Set());
      m.get(date).add(meta.type);
    }
    return m;
  }, [player, gameTypeMap]);

  const scopeOption = SCOPE_OPTIONS.find(o => o.key === scopeKey) || SCOPE_OPTIONS[1];
  const report = useMemo(() => player ? getPlayerScopedReport(playerName, scopeOption.scope) : null, [player, playerName, scopeOption]);
  const primaryRole = useMemo(() => player ? getPlayerPrimaryRole(playerName) : 'DPS', [player, playerName]);
  const coachingNotes = useMemo(
    () => report ? getCoachingNotes(report, primaryRole, 3) : [],
    [report, primaryRole],
  );
  const strengthNotes = useMemo(
    () => report ? getStrengthNotes(report, primaryRole, 2) : [],
    [report, primaryRole],
  );

  if (!player) return null;

  const personalBests = getPlayerPersonalBests(playerName);
  const playerTrend = getPlayerTrendByDate(playerName).reverse();
  const playerRoles = getPlayerRoles(playerName);
  const newness = getPlayerNewness(playerName);

  const nextHints = report?.nextHints;
  const weakestGrade = report?.weakestGrade;

  const avgDamage = report?.avgDamage || 0;

  const hasHealing = (report?.totalHeal || 0) > 0;
  const hasTank = (report?.totalTank || 0) > 0;
  const avgHeal = report?.avgHeal || 0;
  const avgTank = report?.avgTank || 0;

  // Hero stat picked by role: healers/tanks shouldn't lead with damage
  const heroStat = primaryRole === 'Heal' && hasHealing
    ? { label: 'Avg Healing', value: formatNumber(avgHeal) }
    : primaryRole === 'Tank' && hasTank
    ? { label: 'Avg Tank', value: formatNumber(avgTank) }
    : { label: 'Avg Damage', value: formatNumber(avgDamage) };

  const sortedGames = [...player.games].sort((a, b) => b.date.localeCompare(a.date));
  const latestDateStr = sortedGames.length > 0 ? sortedGames[0].date.split(' ')[0] : null;
  const latestWeekendDates = new Set();
  if (latestDateStr) {
    const isoStr = latestDateStr.replace(/\//g, '-');
    const d = new Date(isoStr + 'T00:00:00');
    const day = d.getDay(); // 0=Sun, 6=Sat
    latestWeekendDates.add(latestDateStr);
    if (day === 6) { // Saturday — also include Sunday
      const sun = new Date(d);
      sun.setDate(sun.getDate() + 1);
      latestWeekendDates.add(sun.toISOString().split('T')[0].replace(/-/g, '/'));
    } else if (day === 0) { // Sunday — also include Saturday
      const sat = new Date(d);
      sat.setDate(sat.getDate() - 1);
      latestWeekendDates.add(sat.toISOString().split('T')[0].replace(/-/g, '/'));
    }
  }

  const uniqueDates = [...new Set(player.games.map(g => g.date.split(' ')[0]))].sort().reverse();

  const filteredGames = sortedGames.filter(g => {
    if (resultFilter !== 'all' && g.result !== resultFilter) return false;
    if (dateFilter !== 'all' && !g.date.startsWith(dateFilter)) return false;
    return true;
  });

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[enter]:ease-out data-[leave]:duration-200 data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
          <DialogPanel
            transition
            className="relative w-full max-w-6xl transform overflow-hidden rounded-xl sm:rounded-2xl glass-strong border border-[var(--color-border)] shadow-2xl transition-all data-[closed]:opacity-0 data-[closed]:scale-95 data-[enter]:duration-300 data-[enter]:ease-out data-[leave]:duration-200 data-[leave]:ease-in"
          >
            <div className="sticky top-0 z-10 bg-[var(--color-bg-card)] border-b border-[var(--color-border)] px-4 sm:px-8 pt-4 sm:pt-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-2 flex-wrap">
                  <ClassIcon playerName={playerName} size={22} />
                  <span>{playerName}</span>
                  {playerRoles.length > 0 && (
                    <span className="ml-1 inline-flex gap-1">
                      {playerRoles.map(r => (
                        <span key={r} className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded border border-[var(--color-border)] text-[var(--color-text-secondary)] bg-[var(--color-bg-elevated)]">
                          {r}
                        </span>
                      ))}
                    </span>
                  )}
                  {newness && (
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded border border-sky-500/40 text-sky-400 bg-sky-500/10">
                      New
                    </span>
                  )}
                </DialogTitle>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[var(--color-text-muted)]">
                  <span><span className="text-[var(--color-text-secondary)] font-mono">{report.gamesPlayed}</span> matches</span>
                  {weakestGrade && (
                    <>
                      <span className="opacity-40">•</span>
                      <span>Focus area: <span className="text-[var(--color-text-secondary)] font-semibold">{weakestGrade.label}</span> ({weakestGrade.grade})</span>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="shrink-0 rounded-md p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Tab Bar inside sticky header */}
            <div className="mt-4 -mx-4 sm:-mx-8 px-4 sm:px-8 overflow-x-auto scrollbar-none">
              <div className="flex items-center gap-1 min-w-max border-b border-transparent">
                {[
                  { key: 'report', label: 'Report Card' },
                  { key: 'totals', label: 'Totals' },
                  { key: 'comparison', label: 'Comparison' },
                  { key: 'wardays', label: 'War Days' },
                  { key: 'matches', label: 'Match History' },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={classNames(
                      'relative px-3 sm:px-4 py-2.5 text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer whitespace-nowrap',
                      activeTab === tab.key
                        ? 'text-[var(--color-text-primary)]'
                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]',
                    )}
                  >
                    {tab.label}
                    {activeTab === tab.key && (
                      <span className="absolute left-2 right-2 -bottom-px h-0.5 bg-cyan-400 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            </div>

            <div className="p-4 sm:p-8 max-h-[calc(90vh-9rem)] overflow-y-auto space-y-6 sm:space-y-8">
              {activeTab === 'comparison' && (
                <ComparisonTab playerName={playerName} player={player} />
              )}

              {activeTab === 'report' && (<>
              {/* Window selector */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <ScopeSelector scopeKey={scopeKey} setScopeKey={setScopeKey} />
                {report.gamesPlayed === 0 && (
                  <span className="text-xs text-amber-400">No matches in this window. Try the 4-week filter.</span>
                )}
              </div>

              {/* New-player disclaimer */}
              {newness && (
                <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-3 sm:p-4 text-sm text-[var(--color-text-primary)] leading-snug">
                  <span className="inline-block px-1.5 py-0.5 mr-2 text-[10px] font-bold uppercase tracking-wider rounded bg-sky-500/20 text-sky-400">New</span>
                  Welcome to the guild! First match was on {newness.firstMatchDate}, which is within the last 4 weeks. Grades and notes here will be noisy with such a fresh sample, so treat them as a baseline rather than a verdict. Keep showing up and the report card stabilises.
                </div>
              )}

              {/* Hero stats bar */}
              <div className="flex flex-wrap gap-3">
                {[
                  { label: 'Matches', value: report.gamesPlayed, info: `Matches played within the selected window (${report.label}).` },
                  { label: 'KDA', value: report.kda, info: '(Kills + Assists) / Deaths within window. Personal combat efficiency.' },
                  {
                    label: 'Kill Part.',
                    value: report.killParticipation > 0 ? `${report.killParticipation}%` : '-',
                    info: 'Share of team kills you contributed to (kills + assists / team kills). Volume contribution to wins.',
                  },
                  { label: heroStat.label, value: heroStat.value, info: `Average ${heroStat.label.toLowerCase().replace('avg ', '')} per match in window.`, highlight: true },
                ].map(s => (
                  <div key={s.label} className="relative flex-1 min-w-[calc(50%-0.375rem)] sm:min-w-0 bg-[var(--color-bg-card)] rounded-xl p-3 sm:p-4 text-center group/cell">
                    {s.info && (
                      <div className="absolute top-2 right-2 group/info">
                        <InformationCircleIcon className="h-3.5 w-3.5 text-[var(--color-text-muted)] opacity-40 group-hover/cell:opacity-100 transition-opacity cursor-help" />
                        <div className="absolute bottom-full right-0 mb-1.5 px-2.5 py-1.5 text-xs text-[var(--color-text-primary)] bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg shadow-lg whitespace-normal w-48 text-left opacity-0 pointer-events-none group-hover/info:opacity-100 group-hover/info:pointer-events-auto transition-opacity z-10">
                          {s.info}
                        </div>
                      </div>
                    )}
                    <div className="text-[var(--color-text-muted)] text-xs uppercase tracking-wider mb-1">{s.label}</div>
                    <div className={`font-mono font-bold text-lg ${s.highlight ? 'text-cyan-400' : 'text-[var(--color-text-primary)]'}`}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Strengths — top high grades, role-aware */}
              {strengthNotes.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span>Strengths</span>
                    <span className="text-[10px] normal-case font-normal opacity-70">{primaryRole} · {report.label}</span>
                  </h3>
                  <ul className="space-y-2">
                    {strengthNotes.map((note) => (
                      <li
                        key={note.metric}
                        className={classNames(
                          'flex items-start gap-3 rounded-xl border p-3 sm:p-4 text-sm leading-snug',
                          note.grade === 'A'
                            ? 'border-emerald-500/30 bg-emerald-500/5 text-[var(--color-text-primary)]'
                            : 'border-blue-500/30 bg-blue-500/5 text-[var(--color-text-primary)]',
                        )}
                      >
                        <span
                          className={classNames(
                            'shrink-0 mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider',
                            note.grade === 'A' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400',
                          )}
                        >
                          {note.grade}
                        </span>
                        <span>{note.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Coaching Notes — top weak grades, role-aware */}
              {coachingNotes.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span>Coaching Notes</span>
                    <span className="text-[10px] normal-case font-normal opacity-70">{primaryRole} · {report.label}</span>
                  </h3>
                  <ul className="space-y-2">
                    {coachingNotes.map((note) => (
                      <li
                        key={note.metric}
                        className={classNames(
                          'flex items-start gap-3 rounded-xl border p-3 sm:p-4 text-sm leading-snug',
                          note.grade === 'D'
                            ? 'border-red-500/30 bg-red-500/5 text-[var(--color-text-primary)]'
                            : 'border-amber-500/30 bg-amber-500/5 text-[var(--color-text-primary)]',
                        )}
                      >
                        <span
                          className={classNames(
                            'shrink-0 mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider',
                            note.grade === 'D' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400',
                          )}
                        >
                          {note.grade}
                        </span>
                        <span>{note.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Report Card grid (full width) — primary grades */}
              <div>
                <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span>Report Card</span>
                  <span className="text-[10px] normal-case font-normal opacity-70">vs {primaryRole} peers · {report.label}</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <GradeCard
                    label="KDA"
                    grade={report.grades.kda.grade}
                    value={report.grades.kda.value}
                    info={{
                      description: '(Kills + Assists) / Deaths within the selected window. Personal combat efficiency.',
                      grades: [
                        { grade: 'A', threshold: '≥ 9' },
                        { grade: 'B', threshold: '≥ 6' },
                        { grade: 'C', threshold: '≥ 4' },
                        { grade: 'D', threshold: '< 4' },
                      ],
                      note: `Requires ${report.minForGrade}+ matches in this window.`,
                    }}
                    nextHint={nextHints?.kda ? `+${(nextHints.kda.target - nextHints.kda.current).toFixed(2)} KDA for ${nextHints.kda.letter}` : null}
                  />
                  <GradeCard
                    label="Kill Participation"
                    grade={report.grades.killParticipation.grade}
                    value={report.grades.killParticipation.value ? `${report.grades.killParticipation.value}%` : null}
                    info={{
                      description: 'Share of your team\'s kills you contributed to (kills + assists). Measures how involved you are in fights.',
                      grades: [
                        { grade: 'A', threshold: '≥ 45%' },
                        { grade: 'B', threshold: '≥ 35%' },
                        { grade: 'C', threshold: '≥ 22%' },
                        { grade: 'D', threshold: '< 22%' },
                      ],
                      note: `Requires ${report.minForGrade}+ matches in this window.`,
                    }}
                    nextHint={nextHints?.killParticipation ? `+${nextHints.killParticipation.target - nextHints.killParticipation.current}% Kill Participation for ${nextHints.killParticipation.letter}` : null}
                  />
                  <GradeCard
                    label="Survival"
                    grade={report.grades.survivability.grade}
                    value={report.grades.survivability.value ? `${report.grades.survivability.value} avg deaths` : null}
                    info={{
                      description: 'Average deaths per match. Lower is better - staying alive keeps your team\'s pressure on.',
                      grades: [
                        { grade: 'A', threshold: '≤ 3 deaths' },
                        { grade: 'B', threshold: '≤ 5 deaths' },
                        { grade: 'C', threshold: '≤ 7 deaths' },
                        { grade: 'D', threshold: '> 7 deaths' },
                      ],
                      note: `Requires ${report.minForGrade}+ matches in this window.`,
                    }}
                    nextHint={nextHints?.survival ? `Drop deaths ${nextHints.survival.current} to ${nextHints.survival.target} for ${nextHints.survival.letter}` : null}
                  />
                </div>
              </div>

              {/* Contribution + reliability grades */}
              <div>
                <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Contribution</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <GradeCard
                    label="Damage Share"
                    grade={report.grades.damageShare.grade}
                    value={report.grades.damageShare.value ? `${report.grades.damageShare.value}%` : null}
                    info={{
                      description: 'Average share of your team\'s total damage you delivered per match. An even split across 30 players is 3.3%.',
                      grades: [
                        { grade: 'A', threshold: '≥ 5%' },
                        { grade: 'B', threshold: '≥ 3.5%' },
                        { grade: 'C', threshold: '≥ 2%' },
                        { grade: 'D', threshold: '< 2%' },
                      ],
                      note: `Requires ${report.minForGrade}+ matches in this window.`,
                    }}
                    nextHint={nextHints?.damageShare ? `+${(nextHints.damageShare.target - nextHints.damageShare.current).toFixed(1)}% Damage Share for ${nextHints.damageShare.letter}` : null}
                  />
                  {report.grades.healShare.grade && (
                    <GradeCard
                      label="Heal Share"
                      grade={report.grades.healShare.grade}
                      value={`${report.grades.healShare.value}%`}
                      info={{
                        description: 'Average share of your team\'s total healing you delivered per match. Only graded for players who do meaningful healing.',
                        grades: [
                          { grade: 'A', threshold: '≥ 14%' },
                          { grade: 'B', threshold: '≥ 10%' },
                          { grade: 'C', threshold: '≥ 6%' },
                          { grade: 'D', threshold: '< 6%' },
                        ],
                      }}
                      nextHint={nextHints?.healShare ? `+${(nextHints.healShare.target - nextHints.healShare.current).toFixed(1)}% Heal Share for ${nextHints.healShare.letter}` : null}
                    />
                  )}
                  {report.grades.siegeShare.grade && (
                    <GradeCard
                      label="Siege Share"
                      grade={report.grades.siegeShare.grade}
                      value={`${report.grades.siegeShare.value}%`}
                      info={{
                        description: 'Average share of your team\'s siege damage (Goose, Bulwarks) you delivered per match. Goose and Bulwarks decide most matches. Only graded for players who do meaningful siege.',
                        grades: [
                          { grade: 'A', threshold: '≥ 7%' },
                          { grade: 'B', threshold: '≥ 4%' },
                          { grade: 'C', threshold: '≥ 1.5%' },
                          { grade: 'D', threshold: '< 1.5%' },
                        ],
                      }}
                      nextHint={nextHints?.siegeShare ? `+${(nextHints.siegeShare.target - nextHints.siegeShare.current).toFixed(1)}% Siege Share for ${nextHints.siegeShare.letter}` : null}
                    />
                  )}
                  <GradeCard
                    label="Activity"
                    grade={report.grades.activity.grade}
                    value={report.grades.activity.value ? `${report.grades.activity.value}%` : null}
                    info={{
                      description: `Percentage of guild matches in this window you actually played in (${report.activity.gamesPlayed} of ${report.activity.guildMatches}). Measures reliability as a teammate, separate from in-game performance.`,
                      grades: [
                        { grade: 'A', threshold: '≥ 75%' },
                        { grade: 'B', threshold: '≥ 50%' },
                        { grade: 'C', threshold: '≥ 25%' },
                        { grade: 'D', threshold: '< 25%' },
                      ],
                    }}
                    nextHint={nextHints?.activity ? `+${nextHints.activity.target - nextHints.activity.current}% attendance for ${nextHints.activity.letter}` : null}
                  />
                  <GradeCard
                    label="Carry"
                    grade={report.grades.carry.grade}
                    value={report.grades.carry.value || null}
                    info={{
                      description: 'Composite "are you carrying matches" score: KDA x Kill Participation / 10. Captures both efficiency (KDA) and contribution (KP) in one number.',
                      grades: [
                        { grade: 'A', threshold: '≥ 60' },
                        { grade: 'B', threshold: '≥ 30' },
                        { grade: 'C', threshold: '≥ 12' },
                        { grade: 'D', threshold: '< 12' },
                      ],
                    }}
                    nextHint={nextHints?.carry ? `+${nextHints.carry.target - nextHints.carry.current} Carry score for ${nextHints.carry.letter}` : null}
                  />
                </div>
              </div>

              {/* Per-death efficiency grades */}
              {report.gamesPlayed > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Efficiency <span className="text-[10px] normal-case font-normal opacity-70 ml-1">output per life lost</span></h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <GradeCard
                      label="Damage / Death"
                      grade={report.perDeath.damage.grade}
                      value={formatNumber(report.perDeath.damage.value)}
                      info={{
                        description: 'Total damage dealt per death within window. Higher means more value extracted per life lost.',
                        grades: [
                          { grade: 'A', threshold: '≥ 800k' },
                          { grade: 'B', threshold: '≥ 450k' },
                          { grade: 'C', threshold: '≥ 220k' },
                          { grade: 'D', threshold: '< 220k' },
                        ],
                      }}
                      nextHint={nextHints?.dmgPerDeath ? `+${formatNumber(nextHints.dmgPerDeath.target - nextHints.dmgPerDeath.current)} damage/death for ${nextHints.dmgPerDeath.letter}` : null}
                    />
                    {report.perDeath.damageTaken.grade && (
                      <GradeCard
                        label="Damage Taken / Death"
                        grade={report.perDeath.damageTaken.grade}
                        value={formatNumber(report.perDeath.damageTaken.value)}
                        info={{
                          description: 'Damage absorbed (mitigated/tanked) per death. A tank metric - only graded for players with meaningful tanking history.',
                          grades: [
                            { grade: 'A', threshold: '≥ 1M' },
                            { grade: 'B', threshold: '≥ 700k' },
                            { grade: 'C', threshold: '≥ 400k' },
                            { grade: 'D', threshold: '< 400k' },
                          ],
                        }}
                        nextHint={nextHints?.dmgTakenPerDeath ? `+${formatNumber(nextHints.dmgTakenPerDeath.target - nextHints.dmgTakenPerDeath.current)} damage taken/death for ${nextHints.dmgTakenPerDeath.letter}` : null}
                      />
                    )}
                    {report.perDeath.healing.grade && (
                      <GradeCard
                        label="Heal / Death"
                        grade={report.perDeath.healing.grade}
                        value={formatNumber(report.perDeath.healing.value)}
                        info={{
                          description: 'Healing done per death within window. A healer metric - only graded for players who heal.',
                          grades: [
                            { grade: 'A', threshold: '≥ 3.5M' },
                            { grade: 'B', threshold: '≥ 2M' },
                            { grade: 'C', threshold: '≥ 1M' },
                            { grade: 'D', threshold: '< 1M' },
                          ],
                        }}
                        nextHint={nextHints?.healPerDeath ? `+${formatNumber(nextHints.healPerDeath.target - nextHints.healPerDeath.current)} heal/death for ${nextHints.healPerDeath.letter}` : null}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Trends sparkline (full match history, all-time) */}
              <div>
                <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Trends <span className="text-[10px] normal-case font-normal opacity-70 ml-1">{report.label}</span></h3>
                <TrendTabs games={report.games} />
              </div>

              </>)}

              {activeTab === 'totals' && (<>
                <div className="text-xs text-[var(--color-text-muted)]">
                  Lifetime totals across all {player.games_played} matches.
                </div>

                {/* Lifetime stat groups: 2-col on desktop, stacked mobile */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <StatGroup title="Output" cols="grid-cols-2">
                      <StatCell label="Total Damage" value={formatNumber(player.total_damage)} highlight info="Sum of all damage dealt across every match." />
                      <StatCell label="Destruction" value={formatNumber(player.total_damage + player.total_siege)} highlight info="Total damage + siege damage combined." />
                      <StatCell label="Avg Destruction" value={formatNumber(Math.round((player.total_damage + player.total_siege) / Math.max(player.games_played, 1)))} info="Average damage + siege damage per match (lifetime)." />
                      <StatCell label="Dmg/Death" value={formatNumber(Math.round(player.total_damage / Math.max(player.total_deaths, 1)))} info="Lifetime damage dealt per death." />
                    </StatGroup>

                    <StatGroup title="Combat" cols="grid-cols-2">
                      <StatCell label="Kills" value={player.total_defeats} info="Total enemy players killed." />
                      <StatCell label="Avg Kills" value={(player.total_defeats / Math.max(player.games_played, 1)).toFixed(1)} info="Lifetime average kills per match." />
                      <StatCell label="Assists" value={player.total_assists} info="Total kill assists earned." />
                      <StatCell label="Avg Assists" value={(player.total_assists / Math.max(player.games_played, 1)).toFixed(1)} info="Lifetime average assists per match." />
                      <StatCell label="Deaths" value={player.total_deaths} info="Total times defeated in battle." />
                      <StatCell label="Avg Deaths" value={(player.total_deaths / Math.max(player.games_played, 1)).toFixed(1)} info="Lifetime average deaths per match." />
                    </StatGroup>

                    {(player.total_heal > 0 || player.total_tank > 0 || player.total_siege > 0) && (
                      <StatGroup title="Support" cols="grid-cols-2">
                        {player.total_heal > 0 && <StatCell label="Healing" value={formatNumber(player.total_heal)} info="Total healing done to allies." />}
                        {player.total_heal > 0 && <StatCell label="Avg Healing" value={formatNumber(Math.round(player.total_heal / Math.max(player.games_played, 1)))} info="Lifetime average healing per match." />}
                        {player.total_tank > 0 && <StatCell label="Tank" value={formatNumber(player.total_tank)} info="Total damage mitigated while tanking." />}
                        {player.total_tank > 0 && <StatCell label="Avg Tank" value={formatNumber(Math.round(player.total_tank / Math.max(player.games_played, 1)))} info="Lifetime average damage mitigated per match." />}
                        {player.total_siege > 0 && <StatCell label="Siege" value={formatNumber(player.total_siege)} info="Total siege damage dealt to structures." />}
                        {player.total_siege > 0 && <StatCell label="Avg Siege" value={formatNumber(Math.round(player.total_siege / Math.max(player.games_played, 1)))} info="Lifetime average siege damage per match." />}
                      </StatGroup>
                    )}
                  </div>

                  <div className="space-y-6">
                    {Object.keys(personalBests).length > 0 && (
                      <div>
                        <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Personal Bests</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {Object.entries(personalBests).map(([stat, best]) => {
                            const isNew = latestWeekendDates.has(best.date);
                            const statKeyMap = {
                              Damage: 'total_damage', Kills: 'total_defeats', Assists: 'total_assists',
                              Healing: 'total_heal', Tank: 'total_tank', Siege: 'total_siege',
                            };
                            const totalKey = statKeyMap[stat];
                            const playerAvg = totalKey && player.games_played > 0 ? player[totalKey] / player.games_played : 0;
                            const mult = playerAvg > 0 ? best.value / playerAvg : null;
                            return (
                              <div key={stat} className="bg-[var(--color-bg-card)] rounded-xl p-4 text-center relative">
                                {isNew && (
                                  <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                                    New
                                  </span>
                                )}
                                <div className="text-[var(--color-text-muted)] text-xs uppercase tracking-wider mb-1.5">{stat}</div>
                                <div className="font-mono font-bold text-lg text-amber-400">{formatNumber(best.value)}</div>
                                {mult != null && mult >= 1.05 && (
                                  <div className="text-[10px] text-[var(--color-text-secondary)] font-mono mt-0.5">{mult.toFixed(1)}x your avg</div>
                                )}
                                <div className="text-[var(--color-text-muted)] text-xs mt-1">{best.date}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>)}

              {activeTab === 'wardays' && (
              <>
              {/* War Day Breakdown */}
              {playerTrend.length > 0 ? (
                <div>
                  <h3 className="text-base font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-4">War Day Breakdown</h3>
                  <div className="relative rounded-xl border border-[var(--color-border)]">
                    <div className="overflow-x-auto">
                      <table className="w-full text-base">
                        <thead>
                          <tr className="bg-[var(--color-bg-elevated)] border-b border-[var(--color-border)]">
                            <th className="px-2 py-2.5 sm:px-4 sm:py-3 text-left text-[var(--color-text-muted)] text-sm uppercase tracking-wider">War Day</th>
                            <th className="px-2 py-2.5 sm:px-4 sm:py-3 text-center text-[var(--color-text-muted)] text-sm uppercase tracking-wider hidden sm:table-cell">Type</th>
                            <th className="px-2 py-2.5 sm:px-4 sm:py-3 text-right text-[var(--color-text-muted)] text-sm uppercase tracking-wider hidden sm:table-cell">Games</th>
                            <th className="px-2 py-2.5 sm:px-4 sm:py-3 text-right text-[var(--color-text-muted)] text-sm uppercase tracking-wider"><span className="sm:hidden">DMG</span><span className="hidden sm:inline">Avg Damage</span></th>
                            <th className="px-2 py-2.5 sm:px-4 sm:py-3 text-right text-[var(--color-text-muted)] text-sm uppercase tracking-wider"><span className="sm:hidden">Kills</span><span className="hidden sm:inline">Avg Kills</span></th>
                            <th className="px-2 py-2.5 sm:px-4 sm:py-3 text-right text-[var(--color-text-muted)] text-sm uppercase tracking-wider hidden sm:table-cell">Avg Deaths</th>
                            <th className="px-2 py-2.5 sm:px-4 sm:py-3 text-right text-[var(--color-text-muted)] text-sm uppercase tracking-wider">KDA</th>
                            <th className="px-2 py-2.5 sm:px-4 sm:py-3 text-right text-[var(--color-text-muted)] text-sm uppercase tracking-wider">Record</th>
                          </tr>
                        </thead>
                        <tbody>
                          {playerTrend.map((row, i) => {
                            const prev = i > 0 ? playerTrend[i - 1] : null;
                            const arrow = (curr, prevVal, invert) => {
                              if (!prev) return null;
                              if (curr === prevVal) return null;
                              const up = invert ? curr < prevVal : curr > prevVal;
                              return <span className={up ? 'text-emerald-400 ml-1' : 'text-red-400 ml-1'}>{up ? '\u2191' : '\u2193'}</span>;
                            };
                            const types = [...(dayTypeMap.get(row.date) || [])];
                            const losses = row.games - row.wins;
                            return (
                              <tr key={row.date} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-card-hover)] transition-colors">
                                <td className="px-2 py-2.5 sm:px-4 sm:py-3 text-[var(--color-text-secondary)] text-sm">
                                  {row.date}
                                  {latestWeekendDates.has(row.date) && <span className="ml-1.5 inline-block px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-cyan-500/20 text-cyan-400">Latest</span>}
                                </td>
                                <td className="px-2 py-2.5 sm:px-4 sm:py-3 text-center hidden sm:table-cell">
                                  <span className="inline-flex gap-1">
                                    {types.map(t => (
                                      <span key={t} className={classNames(
                                        'px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded border',
                                        t === 'League'
                                          ? 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10'
                                          : 'border-amber-500/30 text-amber-400 bg-amber-500/10',
                                      )}>
                                        {t === 'League' ? 'L' : 'R'}
                                      </span>
                                    ))}
                                  </span>
                                </td>
                                <td className="px-2 py-2.5 sm:px-4 sm:py-3 text-right font-mono hidden sm:table-cell">{row.games}</td>
                                <td className="px-2 py-2.5 sm:px-4 sm:py-3 text-right font-mono text-cyan-400">
                                  {formatNumber(row.avgDamage)}{arrow(row.avgDamage, prev?.avgDamage)}
                                </td>
                                <td className="px-2 py-2.5 sm:px-4 sm:py-3 text-right font-mono">
                                  {row.avgKills}{arrow(row.avgKills, prev?.avgKills)}
                                </td>
                                <td className="px-2 py-2.5 sm:px-4 sm:py-3 text-right font-mono hidden sm:table-cell">
                                  {row.avgDeaths}{arrow(row.avgDeaths, prev?.avgDeaths, true)}
                                </td>
                                <td className="px-2 py-2.5 sm:px-4 sm:py-3 text-right font-mono">
                                  {row.kda}{arrow(row.kda, prev?.kda)}
                                </td>
                                <td className="px-2 py-2.5 sm:px-4 sm:py-3 text-right font-mono">
                                  <span className="text-emerald-400">{row.wins}</span>
                                  <span className="text-[var(--color-text-muted)]">-</span>
                                  <span className="text-red-400">{losses}</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-[var(--color-text-muted)] text-sm">No war day data yet.</p>
                </div>
              )}
              </>
              )}

              {activeTab === 'matches' && (
              <>
              {/* Match History */}
              <div>
                <h3 className="text-base font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-4">Match History</h3>
                <FilterBar
                  resultFilter={resultFilter}
                  setResultFilter={setResultFilter}
                  dateFilter={dateFilter}
                  setDateFilter={setDateFilter}
                  dates={uniqueDates}
                  totalCount={sortedGames.length}
                  filteredCount={filteredGames.length}
                />
                <div className="relative rounded-xl border border-[var(--color-border)]">
                  <div className="overflow-x-auto">
                    <table className="w-full text-base">
                      <thead>
                        <tr className="bg-[var(--color-bg-elevated)] border-b border-[var(--color-border)]">
                          <th className="px-2 py-2.5 sm:px-4 sm:py-3 text-left text-[var(--color-text-muted)] text-sm uppercase tracking-wider">Match</th>
                          <th className="px-2 py-2.5 sm:px-4 sm:py-3 text-center text-[var(--color-text-muted)] text-sm uppercase tracking-wider">Result</th>
                          <th className="px-2 py-2.5 sm:px-4 sm:py-3 text-right text-[var(--color-text-muted)] text-sm uppercase tracking-wider">Kills</th>
                          <th className="px-2 py-2.5 sm:px-4 sm:py-3 text-right text-[var(--color-text-muted)] text-sm uppercase tracking-wider hidden sm:table-cell">Assists</th>
                          <th className="px-2 py-2.5 sm:px-4 sm:py-3 text-right text-[var(--color-text-muted)] text-sm uppercase tracking-wider">Deaths</th>
                          <th className="px-2 py-2.5 sm:px-4 sm:py-3 text-right text-[var(--color-text-muted)] text-sm uppercase tracking-wider"><span className="sm:hidden">DMG</span><span className="hidden sm:inline">Damage</span></th>
                          <th className="px-2 py-2.5 sm:px-4 sm:py-3 text-right text-[var(--color-text-muted)] text-sm uppercase tracking-wider hidden sm:table-cell">Healing</th>
                          <th className="px-2 py-2.5 sm:px-4 sm:py-3 text-right text-[var(--color-text-muted)] text-sm uppercase tracking-wider hidden sm:table-cell">Tank</th>
                          <th className="px-2 py-2.5 sm:px-4 sm:py-3 text-right text-[var(--color-text-muted)] text-sm uppercase tracking-wider hidden sm:table-cell">Siege</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredGames.map(g => (
                          <tr key={g.game_num} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-card-hover)] transition-colors">
                            <td className="px-2 py-2.5 sm:px-4 sm:py-3 text-[var(--color-text-secondary)] text-sm">
                              {g.date}
                              {latestWeekendDates.has(g.date.split(' ')[0]) && <span className="ml-1.5 inline-block px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-cyan-500/20 text-cyan-400">Latest</span>}
                            </td>
                            <td className="px-2 py-2.5 sm:px-4 sm:py-3 text-center">
                              <span className={`font-bold text-sm uppercase ${g.result === 'win' ? 'text-emerald-400' : 'text-red-400'}`}>
                                {g.result}
                              </span>
                            </td>
                            <td className="px-2 py-2.5 sm:px-4 sm:py-3 text-right font-mono">{g.defeated}</td>
                            <td className="px-2 py-2.5 sm:px-4 sm:py-3 text-right font-mono hidden sm:table-cell">{g.assist}</td>
                            <td className="px-2 py-2.5 sm:px-4 sm:py-3 text-right font-mono">{g.deaths}</td>
                            <td className="px-2 py-2.5 sm:px-4 sm:py-3 text-right font-mono text-cyan-400">{formatNumber(g.damage)}</td>
                            <td className="px-2 py-2.5 sm:px-4 sm:py-3 text-right font-mono hidden sm:table-cell">{formatNumber(g.heal)}</td>
                            <td className="px-2 py-2.5 sm:px-4 sm:py-3 text-right font-mono hidden sm:table-cell">{formatNumber(g.tank)}</td>
                            <td className="px-2 py-2.5 sm:px-4 sm:py-3 text-right font-mono hidden sm:table-cell">{formatNumber(g.siege_damage)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[var(--color-bg-primary)] to-transparent pointer-events-none sm:hidden rounded-r-xl" />
                </div>
              </div>
              </>
              )}
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
