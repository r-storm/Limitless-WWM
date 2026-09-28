import { useState, useMemo } from 'react';
import SortableTable from './SortableTable';
import Tooltip from './Tooltip';
import { getAllPlayersSorted, getPlayersSortedByDates, getWarDays, ARCHIVE_AS_OF } from '../data/dataUtils';
import { playerClasses } from '../data/gameDefinitions';
import classNames from '../../../utils/classNames';

const formatDecimal = (v) => v == null ? '—' : v.toFixed(1);

const columns = [
  { key: 'name', label: 'Player', align: 'left' },
  { key: 'games_played', label: 'Matches Played', mobileLabel: 'MP', align: 'left' },
  { key: 'avg_damage', label: 'DMG/Match', mobileLabel: 'DMG', align: 'left' },
  { key: 'kd', label: 'K/D', align: 'left', format: formatDecimal },
  { key: 'kda', label: 'KDA', align: 'left', format: formatDecimal },
  { key: 'avg_deaths', label: 'Deaths/Match', mobileLabel: 'D/M', align: 'left', format: formatDecimal },
  { key: 'avg_heal', label: 'Heal/Match', align: 'left', hideOnMobile: true },
  { key: 'avg_tank', label: 'Tank/Match', align: 'left', hideOnMobile: true },
  { key: 'avg_siege', label: 'Siege/Match', align: 'left', hideOnMobile: true },
];

const WINDOW_MIN_GAMES = { weekend: 2, '2w': 4, '4w': 8, lifetime: 20 };

const REQUIREMENT_NOTE = (min) => `Awarded to the leader from the current view. Requires at least ${min} matches in this window to qualify.`;

const SIMPLE_BADGES = [
  { id: 'damage', key: 'avg_damage', label: 'Damage Leader', tableLabel: 'DMG', bg: 'bg-cyan-500/15', text: 'text-cyan-400', glow: 'var(--glow-violet)', desc: 'Highest DMG/Match' },
  { id: 'kills', key: 'avg_defeats', label: 'Ruthless Killer', tableLabel: 'KILLS', bg: 'bg-red-500/15', text: 'text-red-400', glow: 'var(--glow-red)', desc: 'Most kills per match' },
  { id: 'assists', key: 'avg_assists', label: 'Highest Assists', tableLabel: 'AST', bg: 'bg-purple-500/15', text: 'text-purple-400', glow: 'var(--glow-purple)', desc: 'Most assists per match' },
  { id: 'heal', key: 'avg_heal', label: 'Greatest Lifesaver', tableLabel: 'HEAL', bg: 'bg-emerald-500/15', text: 'text-emerald-400', glow: 'var(--glow-green)', desc: 'Most healing per match' },
  { id: 'tank', key: 'avg_tank', label: 'Top Tank', tableLabel: 'TANK', bg: 'bg-blue-500/15', text: 'text-blue-400', glow: 'var(--glow-blue)', desc: 'Most damage mitigated per match' },
  { id: 'siege', key: 'avg_siege', label: 'Top Siege Master', tableLabel: 'SIEGE', bg: 'bg-amber-500/15', text: 'text-amber-400', glow: 'var(--glow-amber)', desc: 'Most siege damage per match (Goose and Bulwarks)' },
];

const KDA_BADGE = { id: 'kda', label: 'KDA King', tableLabel: 'KDA', bg: 'bg-cyan-500/15', text: 'text-cyan-400', glow: 'var(--glow-cyan)' };
const IRON_WALL_BADGE = { id: 'iron_wall', label: 'Iron Wall', tableLabel: 'WALL', bg: 'bg-teal-500/15', text: 'text-teal-400', glow: 'var(--glow-teal)' };
const WORKHORSE_BADGE = { id: 'workhorse', label: 'Workhorse', tableLabel: 'WORK', bg: 'bg-orange-500/15', text: 'text-orange-400', glow: 'var(--glow-amber)' };
const MOST_IMPROVED_BADGE = { id: 'most_improved', label: 'Most Improved', tableLabel: 'IMPRV', bg: 'bg-lime-500/15', text: 'text-lime-400', glow: 'var(--glow-green)' };
const MVP_BADGE = { id: 'mvp', label: 'MVP', tableLabel: 'MVP', bg: 'bg-fuchsia-500/15', text: 'text-fuchsia-400', glow: 'var(--glow-violet)' };

const MVP_CATEGORIES = ['avg_damage', 'avg_heal', 'avg_tank', 'avg_siege', 'avg_defeats', 'avg_assists', 'kd', 'kda'];
const KDA_MIN_DEATHS = 10;

const windowFilters = [
  { key: 'weekend', label: 'Most Recent Weekend', description: 'Averages from the most recent weekend\'s matches.' },
  { key: '2w', label: 'Past 2 Weeks', description: 'Averages from matches played in the past 14 days.' },
  { key: '4w', label: 'Past 4 Weeks', description: 'Averages from matches played in the past 28 days.' },
  { key: 'lifetime', label: 'Lifetime', description: 'Career averages across every match the player has played.' },
];

const classFilters = [
  { key: 'all', label: 'All Classes', description: 'Show every player regardless of class.' },
  { key: 'DPS', label: 'DPS', description: 'Show players assigned a DPS role.' },
  { key: 'Tank', label: 'Tank', description: 'Show players assigned a Tank role.' },
  { key: 'Heal', label: 'Healer', description: 'Show players assigned a Healer role.' },
];

const activityFilters = [
  { key: 'all', label: 'All', description: 'Show every player regardless of recent activity.' },
  { key: 'active', label: 'Active', description: 'Only players who played at least one match in the last 2 weeks.' },
  { key: 'inactive', label: 'Inactive', description: 'Only players with no matches in the last 2 weeks.' },
];

const ACTIVITY_TOOLTIP = 'Active = played at least one match in the last 2 weeks. Inactive = no matches in the last 2 weeks.';
const ACTIVITY_DISABLED_TOOLTIP = 'Activity filter is only available for windows wider than 2 weeks (Past 4 Weeks or Lifetime).';

function getWindowDates(key, warDays) {
  if (key === 'lifetime' || warDays.length === 0) return null;
  if (key === 'weekend') {
    const last = warDays[warDays.length - 1];
    const lastDate = new Date(...last.split('/').map((v, i) => i === 1 ? +v - 1 : +v));
    const cutoff = new Date(lastDate);
    cutoff.setDate(lastDate.getDate() - 1);
    return warDays.filter(d => {
      const [y, m, day] = d.split('/').map(Number);
      return new Date(y, m - 1, day) >= cutoff;
    });
  }
  const days = key === '2w' ? 14 : 28;
  const today = new Date(ARCHIVE_AS_OF);
  today.setHours(0, 0, 0, 0);
  const cutoff = new Date(today);
  cutoff.setDate(today.getDate() - days);
  return warDays.filter(d => {
    const [y, m, day] = d.split('/').map(Number);
    return new Date(y, m - 1, day) >= cutoff;
  });
}

export default function AllPlayersTable({ onPlayerClick }) {
  const [windowKey, setWindowKey] = useState('weekend');
  const [activeClass, setActiveClass] = useState('all');
  const [activity, setActivity] = useState('all');

  const warDays = useMemo(() => getWarDays(), []);

  const activityDisabled = windowKey === 'weekend' || windowKey === '2w';
  const effectiveActivity = activityDisabled ? 'all' : activity;

  const data = useMemo(() => {
    const dates = getWindowDates(windowKey, warDays);
    const rows = dates === null ? getAllPlayersSorted('games_played') : getPlayersSortedByDates(dates, 'games_played');
    return rows.filter(p => {
      if (activeClass !== 'all' && !playerClasses[p.name]?.includes(activeClass)) return false;
      if (effectiveActivity === 'active' && p.recent_2wk_games === 0) return false;
      if (effectiveActivity === 'inactive' && p.recent_2wk_games > 0) return false;
      return true;
    });
  }, [windowKey, warDays, activeClass, effectiveActivity]);

  const badges = useMemo(() => {
    const minGames = WINDOW_MIN_GAMES[windowKey] ?? 1;
    const requirementNote = REQUIREMENT_NOTE(minGames);
    const eligible = data.filter(p => p.games_played >= minGames);
    const map = {};

    function award(player, badge, desc) {
      if (!player) return;
      if (!map[player.name]) map[player.name] = [];
      map[player.name].push({
        label: badge.label,
        shortLabel: badge.tableLabel,
        bg: badge.bg,
        text: badge.text,
        glow: badge.glow,
        description: desc,
      });
    }

    function bestBy(pool, fn, ascending = false) {
      let best = null;
      let bestVal = null;
      for (const p of pool) {
        const v = fn(p);
        if (v == null || isNaN(v)) continue;
        if (best === null || (ascending ? v < bestVal : v > bestVal)) {
          best = p;
          bestVal = v;
        }
      }
      return { best, bestVal };
    }

    for (const cat of SIMPLE_BADGES) {
      const { best, bestVal } = bestBy(eligible, p => p[cat.key]);
      if (best && bestVal > 0) award(best, cat, `${cat.desc}. ${requirementNote}`);
    }

    {
      const candidates = eligible.filter(p => p.total_deaths >= KDA_MIN_DEATHS);
      const { best, bestVal } = bestBy(candidates, p => p.kda);
      if (best && bestVal > 0) {
        award(best, KDA_BADGE, `Highest KDA, calculated as (kills + assists) / deaths. Requires at least ${KDA_MIN_DEATHS} total deaths in this window so a single death-free match cannot win.`);
      }
    }

    {
      const sortedDmg = [...eligible].map(p => p.avg_damage).sort((a, b) => a - b);
      const sortedHeal = [...eligible].map(p => p.avg_heal).sort((a, b) => a - b);
      const dmgMedian = sortedDmg[Math.floor(sortedDmg.length / 2)] ?? 0;
      const healMedian = sortedHeal[Math.floor(sortedHeal.length / 2)] ?? 0;
      const candidates = eligible.filter(p => p.avg_damage >= dmgMedian || p.avg_heal >= healMedian);
      const { best, bestVal } = bestBy(candidates, p => p.avg_deaths, true);
      if (best && bestVal != null) {
        award(best, IRON_WALL_BADGE, `Fewest deaths per match. Player must also be in the top half of avg damage or healing in this view, so AFK players cannot claim it. ${requirementNote}`);
      }
    }

    {
      const { best, bestVal } = bestBy(eligible, p => p.avg_damage + p.avg_heal + p.avg_tank + p.avg_siege);
      if (best && bestVal > 0) {
        award(best, WORKHORSE_BADGE, `Highest combined contribution per match (damage + healing + tank + siege). Rewards well-rounded output regardless of role. ${requirementNote}`);
      }
    }

    {
      const candidates = eligible.filter(p =>
        p.recent_2wk_games >= 2 && p.recent_2wk_avg_damage != null && p.lifetime_avg_damage > 0,
      );
      const { best, bestVal } = bestBy(candidates, p => p.recent_2wk_avg_damage / p.lifetime_avg_damage);
      if (best && bestVal > 1) {
        const pct = Math.round((bestVal - 1) * 100);
        award(best, MOST_IMPROVED_BADGE, `Biggest jump from lifetime avg damage to last 2 weeks avg damage (currently +${pct}%). Requires at least 2 matches in the last 2 weeks.`);
      }
    }

    {
      const top3 = {};
      for (const key of MVP_CATEGORIES) {
        const sorted = [...eligible].sort((a, b) => (b[key] ?? 0) - (a[key] ?? 0));
        top3[key] = new Set(sorted.slice(0, 3).filter(p => (p[key] ?? 0) > 0).map(p => p.name));
      }
      const counts = {};
      for (const key of MVP_CATEGORIES) {
        for (const name of top3[key]) counts[name] = (counts[name] || 0) + 1;
      }
      const qualifying = Object.entries(counts).filter(([, n]) => n >= 2);
      qualifying.sort((a, b) => b[1] - a[1]);
      const mvpEntry = qualifying[0];
      if (mvpEntry) {
        const mvp = eligible.find(p => p.name === mvpEntry[0]);
        if (mvp) {
          award(mvp, MVP_BADGE, `Top-3 in ${mvpEntry[1]} different stat categories in this view. Awarded to the most well-rounded contributor. ${requirementNote}`);
        }
      }
    }

    return map;
  }, [data, windowKey]);

  const pillBase = 'px-3 py-1.5 text-xs font-semibold uppercase tracking-wider border transition-colors';
  const pillActive = 'bg-[var(--dossier-bone)] text-[var(--dossier-ink)] border-[var(--dossier-bone)]';
  const pillIdle = 'bg-[var(--dossier-ink-2)] text-[var(--dossier-bone-muted)] border-[var(--dossier-line)] hover:text-[var(--dossier-bone)] cursor-pointer';
  const pillDisabled = 'bg-[var(--dossier-ink-2)] text-[var(--dossier-bone-muted)] border-[var(--dossier-line)] opacity-50 cursor-not-allowed';

  return (
    <div>
      <div className="flex items-end justify-between gap-4 mb-4 flex-wrap">
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--dossier-bone)] tracking-tight">All players</h2>
        <div className="text-xs text-[var(--dossier-bone-muted)]">
          {data.length} {data.length === 1 ? 'player' : 'players'}
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <FilterRow label="Window">
          {windowFilters.map(f => (
            <Tooltip key={f.key} content={f.description}>
              <button
                onClick={() => setWindowKey(f.key)}
                className={classNames(pillBase, windowKey === f.key ? pillActive : pillIdle)}
              >
                {f.label}
              </button>
            </Tooltip>
          ))}
        </FilterRow>

        <FilterRow label="Class">
          {classFilters.map(f => (
            <Tooltip key={f.key} content={f.description}>
              <button
                onClick={() => setActiveClass(f.key)}
                className={classNames(pillBase, activeClass === f.key ? pillActive : pillIdle)}
              >
                {f.label}
              </button>
            </Tooltip>
          ))}
        </FilterRow>

        <FilterRow
          label="Activity"
          aside={
            <Tooltip content={activityDisabled ? ACTIVITY_DISABLED_TOOLTIP : ACTIVITY_TOOLTIP}>
              <span
                className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-[var(--dossier-line)] text-[10px] text-[var(--dossier-bone-muted)] cursor-help select-none"
                aria-label={activityDisabled ? ACTIVITY_DISABLED_TOOLTIP : ACTIVITY_TOOLTIP}
                tabIndex={0}
              >
                i
              </span>
            </Tooltip>
          }
        >
          {activityFilters.map(f => (
            <Tooltip key={f.key} content={activityDisabled ? ACTIVITY_DISABLED_TOOLTIP : f.description}>
              <button
                onClick={() => { if (!activityDisabled) setActivity(f.key); }}
                disabled={activityDisabled}
                className={classNames(
                  pillBase,
                  activityDisabled
                    ? pillDisabled
                    : effectiveActivity === f.key ? pillActive : pillIdle,
                )}
              >
                {f.label}
              </button>
            </Tooltip>
          ))}
        </FilterRow>
      </div>

      <SortableTable
        columns={columns}
        data={data}
        onPlayerClick={onPlayerClick}
        badges={badges}
      />
    </div>
  );
}

function FilterRow({ label, aside, children }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[var(--dossier-bone-muted)] w-16 shrink-0">
        {label}
      </span>
      {children}
      {aside}
    </div>
  );
}
