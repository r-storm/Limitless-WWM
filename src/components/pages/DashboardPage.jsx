import { useMemo, useState } from 'react';
import {
  getLatestWeekend,
  getWeekendRecap,
  getWeekendMVPs,
  getRosterFormMovers,
  getRosterMostActive,
  getLastNWeekendsTrend,
  getWeekendRosterPulse,
  getOverallStats,
  getCurrentPoints,
} from '../../data/dataUtils';
import { formatNumber } from '../../utils/formatters';
import ClassIcon from '../ClassIcon';
import Tooltip from '../Tooltip';

const CONDITION_LABEL = {
  tree_delivered: 'Tree delivered',
  tree_distance: 'Tree distance',
  goose_hp: 'Goose HP',
  bulwark: 'Bulwark standing',
  unknown: 'Decided',
};

function SectionHeader({ title, hint }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-4 flex-wrap">
      <h2 className="text-xl sm:text-2xl font-bold text-[var(--dossier-bone)] tracking-tight">{title}</h2>
      {hint && <div className="text-xs text-[var(--dossier-bone-muted)]">{hint}</div>}
    </div>
  );
}

function ResultBadge({ result, size = 'sm' }) {
  const isWin = result === 'win';
  const dim = size === 'lg' ? 'w-10 h-10 text-base' : 'w-7 h-7 text-xs';
  return (
    <span
      className={`${dim} flex items-center justify-center font-bold rounded-sm border ${
        isWin
          ? 'border-[var(--dossier-sage)] text-[var(--dossier-sage)] bg-[rgba(74,222,128,0.08)]'
          : 'border-[var(--dossier-crimson)] text-[var(--dossier-crimson)] bg-[rgba(248,113,113,0.08)]'
      }`}
    >
      {isWin ? 'W' : 'L'}
    </span>
  );
}

function InfoButton({ text, accent }) {
  return (
    <Tooltip content={text}>
      <button
        type="button"
        aria-label="Eligibility info"
        className={`w-5 h-5 rounded-full border border-current ${accent} text-[10px] font-bold leading-none flex items-center justify-center hover:bg-current hover:text-[var(--dossier-ink)] transition-colors`}
      >
        i
      </button>
    </Tooltip>
  );
}

function PlayerNameButton({ name, onPlayerClick, className = '', children }) {
  if (!onPlayerClick) {
    return <span className={className} title={name}>{children ?? name}</span>;
  }
  return (
    <button
      type="button"
      onClick={() => onPlayerClick(name)}
      className={`${className} text-left bg-transparent border-0 p-0 cursor-pointer hover:text-[var(--dossier-amber)] hover:underline transition-colors`}
      title={name}
    >
      {children ?? name}
    </button>
  );
}

function MvpCard({ accent, category, primaryLabel, entries, formatValue, floorText, onPlayerClick }) {
  if (!entries || entries.length === 0) {
    return (
      <div className="bg-[var(--dossier-ink-2)] p-5 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className={`text-[10px] uppercase tracking-[0.18em] font-semibold ${accent}`}>{category}</div>
          {floorText && <InfoButton text={floorText} accent={accent} />}
        </div>
        <div className="text-sm text-[var(--dossier-bone-muted)] flex-1 flex items-center">No qualifying players</div>
      </div>
    );
  }
  const top = entries[0];
  const rest = entries.slice(1);
  return (
    <div className="bg-[var(--dossier-ink-2)] p-5 flex flex-col">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className={`text-[10px] uppercase tracking-[0.18em] font-semibold ${accent}`}>{category}</div>
        {floorText && <InfoButton text={floorText} accent={accent} />}
      </div>
      <div className="flex items-baseline gap-2 mb-1">
        <span className={`text-xs font-bold ${accent} tabular-nums`}>1</span>
        <PlayerNameButton
          name={top.name}
          onPlayerClick={onPlayerClick}
          className="text-lg sm:text-xl font-bold text-[var(--dossier-bone)] leading-tight truncate flex-1 min-w-0"
        />
      </div>
      <div className="text-2xl sm:text-3xl font-bold text-[var(--dossier-bone)] leading-none tabular-nums mt-2">
        {formatValue(top)}
      </div>
      <div className="mt-1 text-[11px] text-[var(--dossier-bone-muted)]">
        {primaryLabel} · {top.games} {top.games === 1 ? 'game' : 'games'}
      </div>
      {rest.length > 0 && (
        <div className="mt-4 pt-3 border-t border-[var(--dossier-line)] space-y-1.5">
          {rest.map((p, i) => (
            <div key={p.name} className="flex items-baseline justify-between gap-2 text-xs">
              <div className="flex items-baseline gap-2 min-w-0">
                <span className={`font-bold ${accent} tabular-nums w-3`}>{i + 2}</span>
                <PlayerNameButton
                  name={p.name}
                  onPlayerClick={onPlayerClick}
                  className="text-[var(--dossier-bone)] truncate"
                />
              </div>
              <span className="text-[var(--dossier-bone-soft)] font-semibold tabular-nums whitespace-nowrap">
                {formatValue(p)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MatchCard({ match }) {
  const margin = match.our_kills - match.enemy_kills;
  const marginStr = margin > 0 ? `+${margin}` : `${margin}`;
  const conditionWonByUs = match.conditionWinner === 'us';
  return (
    <div className="bg-[var(--dossier-ink-2)] p-4 sm:p-5 border border-[var(--dossier-line)] rounded-sm">
      <div className="flex items-center gap-3 mb-3">
        <ResultBadge result={match.result} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-[var(--dossier-bone)] truncate" title={match.opponent}>
            vs {match.opponent || 'Unknown'}
          </div>
          <div className="text-[11px] text-[var(--dossier-bone-muted)] uppercase tracking-wider">
            {match.type === 'league' ? 'League' : 'Ranked'}
            {match.points_gained != null && ` · +${match.points_gained} pts`}
          </div>
        </div>
        <div className="text-right">
          <div className="text-base font-bold text-[var(--dossier-bone)] tabular-nums">
            <span className="text-[var(--dossier-sage)]">{match.our_kills}</span>
            <span className="text-[var(--dossier-bone-muted)] mx-1">·</span>
            <span className="text-[var(--dossier-crimson)]">{match.enemy_kills}</span>
          </div>
          <div className={`text-[11px] tabular-nums ${margin >= 0 ? 'text-[var(--dossier-sage)]' : 'text-[var(--dossier-crimson)]'}`}>
            {marginStr} kills
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-3 border-t border-[var(--dossier-line)]">
        <div>
          <div className="text-[10px] text-[var(--dossier-bone-muted)] uppercase tracking-wider mb-1">Decided by</div>
          <div className={`font-semibold ${conditionWonByUs ? 'text-[var(--dossier-sage)]' : 'text-[var(--dossier-crimson)]'}`}>
            {CONDITION_LABEL[match.condition] || match.condition}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-[var(--dossier-bone-muted)] uppercase tracking-wider mb-1">Players</div>
          <div className="text-[var(--dossier-bone)] tabular-nums">
            {match.our_player_count}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-[var(--dossier-bone-muted)] uppercase tracking-wider mb-1">Tree (m)</div>
          <div className="text-[var(--dossier-bone)] tabular-nums">
            {match.our_tree_m} <span className="text-[var(--dossier-bone-muted)]">vs</span> {match.enemy_tree_m}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-[var(--dossier-bone-muted)] uppercase tracking-wider mb-1">Bulwark</div>
          <div className="text-[var(--dossier-bone)] tabular-nums">
            {match.our_bulwark} <span className="text-[var(--dossier-bone-muted)]">vs</span> {match.enemy_bulwark}
          </div>
        </div>
      </div>
    </div>
  );
}

function Sparkline({ values, color, height = 36 }) {
  if (!values || values.length === 0) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 100;
  const h = height;
  const step = values.length > 1 ? w / (values.length - 1) : 0;
  const pts = values.map((v, i) => {
    const x = i * step;
    const y = h - ((v - min) / range) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full" style={{ height: `${h}px` }}>
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {pts.map((p, i) => {
        const [x, y] = p.split(',');
        const isLast = i === pts.length - 1;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={isLast ? 2.2 : 1.2}
            fill={color}
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
    </svg>
  );
}

function TrendSpark({ label, values, current, deltaText, deltaPositive, color, format }) {
  return (
    <div className="bg-[var(--dossier-ink-2)] p-5 flex flex-col">
      <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--dossier-bone-muted)] font-semibold mb-2">{label}</div>
      <div className="text-2xl sm:text-3xl font-bold text-[var(--dossier-bone)] leading-none tabular-nums">
        {format(current)}
      </div>
      <div className={`mt-1 text-xs font-semibold tabular-nums ${
        deltaText == null
          ? 'text-[var(--dossier-bone-muted)]'
          : deltaPositive
            ? 'text-[var(--dossier-sage)]'
            : 'text-[var(--dossier-crimson)]'
      }`}>
        {deltaText ?? '—'}
      </div>
      <div className="mt-3">
        <Sparkline values={values} color={color} />
      </div>
    </div>
  );
}

function MoverRow({ mover, onPlayerClick }) {
  const statLabel = mover.stat === 'heal' ? 'heal' : mover.stat === 'tank' ? 'tank' : 'dmg';
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-[var(--dossier-line)]">
      <div className="min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex items-center gap-0.5 shrink-0">
            <ClassIcon playerName={mover.name} size={16} />
          </span>
          <PlayerNameButton
            name={mover.name}
            onPlayerClick={onPlayerClick}
            className="text-sm font-semibold text-[var(--dossier-bone)] truncate"
          />
        </div>
        <div className="text-[11px] text-[var(--dossier-bone-muted)] tabular-nums mt-0.5">
          {formatNumber(mover.priorAvg)} → {formatNumber(mover.recentAvg)} {statLabel}
        </div>
      </div>
      <div className="text-sm font-bold tabular-nums whitespace-nowrap text-[var(--dossier-sage)]">
        ▲ +{mover.deltaPct}%
      </div>
    </div>
  );
}

function ActiveRow({ player, onPlayerClick }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-[var(--dossier-line)]">
      <div className="flex items-center gap-2 min-w-0">
        <span className="flex items-center gap-0.5 shrink-0">
          <ClassIcon playerName={player.name} size={16} />
        </span>
        <PlayerNameButton
          name={player.name}
          onPlayerClick={onPlayerClick}
          className="text-sm font-semibold text-[var(--dossier-bone)] truncate"
        />
      </div>
      <div className="text-sm font-bold tabular-nums whitespace-nowrap text-[var(--dossier-amber)]">
        {player.recentGames} {player.recentGames === 1 ? 'game' : 'games'}
      </div>
    </div>
  );
}

function RoleToggle({ value, onChange }) {
  const options = [
    { key: 'DPS', label: 'DPS' },
    { key: 'Tank', label: 'Tanks' },
    { key: 'Heal', label: 'Healers' },
  ];
  return (
    <div className="inline-flex border border-[var(--dossier-line)] rounded-sm overflow-hidden">
      {options.map(opt => (
        <button
          key={opt.key}
          type="button"
          onClick={() => onChange(opt.key)}
          className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
            value === opt.key
              ? 'bg-[var(--dossier-bone)] text-[var(--dossier-ink)]'
              : 'bg-[var(--dossier-ink-2)] text-[var(--dossier-bone-muted)] hover:text-[var(--dossier-bone)]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}


export default function DashboardPage({ onPlayerClick }) {
  const weekend = useMemo(() => getLatestWeekend(), []);
  const recap = useMemo(() => weekend ? getWeekendRecap(weekend.dates) : null, [weekend]);
  const mvps = useMemo(() => weekend ? getWeekendMVPs(weekend.dates) : null, [weekend]);
  const [risingRole, setRisingRole] = useState('DPS');
  const movers = useMemo(() => getRosterFormMovers(5, risingRole), [risingRole]);
  const mostActive = useMemo(() => getRosterMostActive(21), []);
  const trend = useMemo(() => getLastNWeekendsTrend(4), []);
  const pulse = useMemo(() => weekend ? getWeekendRosterPulse(weekend.dates) : null, [weekend]);
  const overall = useMemo(() => getOverallStats(), []);
  const leaguePoints = useMemo(() => getCurrentPoints('league'), []);
  const rankedPoints = useMemo(() => getCurrentPoints('ranked'), []);

  const trendDelta = useMemo(() => {
    if (trend.length < 2) return null;
    const curr = trend[trend.length - 1];
    const prev = trend[trend.length - 2];
    return {
      winRate: curr.winRate - prev.winRate,
      avgTeamDamage: prev.avgTeamDamage > 0
        ? ((curr.avgTeamDamage - prev.avgTeamDamage) / prev.avgTeamDamage) * 100
        : null,
      avgTeamDeaths: +(curr.avgTeamDeaths - prev.avgTeamDeaths).toFixed(1),
    };
  }, [trend]);

  if (!weekend || !recap) {
    return (
      <div className="dossier-rise dossier-rise-1">
        <p className="text-sm text-[var(--dossier-bone-muted)]">No weekend match data available yet.</p>
      </div>
    );
  }

  const headlineColor = recap.wins > recap.losses
    ? 'text-[var(--dossier-sage)]'
    : recap.wins < recap.losses
      ? 'text-[var(--dossier-crimson)]'
      : 'text-[var(--dossier-amber)]';

  return (
    <div className="space-y-10">

      {/* THIS WEEKEND */}
      <section className="dossier-rise dossier-rise-2">
        <SectionHeader title={`This weekend (${weekend.label})`} hint={`${recap.matches.length} ${recap.matches.length === 1 ? 'match' : 'matches'}`} />
        <div className="bg-[var(--dossier-ink-2)] border border-[var(--dossier-line)] rounded-sm p-5 sm:p-6">
          <div className="flex items-center justify-between gap-6 flex-wrap">
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--dossier-bone-muted)] font-semibold mb-2">
                Record
              </div>
              <div className="text-5xl sm:text-6xl font-bold leading-none tabular-nums">
                <span className="text-[var(--dossier-sage)]">{recap.wins}</span>
                <span className="text-[var(--dossier-bone-muted)] mx-2 font-medium">-</span>
                <span className="text-[var(--dossier-crimson)]">{recap.losses}</span>
              </div>
              <div className="mt-3 text-xs text-[var(--dossier-bone-muted)] tabular-nums flex gap-3">
                <span>
                  League{' '}
                  <span className="text-[var(--dossier-bone)] font-semibold">{leaguePoints}</span>
                </span>
                <span>
                  Ranked{' '}
                  <span className="text-[var(--dossier-bone)] font-semibold">{rankedPoints}</span>
                </span>
              </div>
            </div>
            <div className={`text-lg sm:text-xl font-semibold ${headlineColor} flex-1 sm:text-right min-w-[200px]`}>
              {recap.headline}
            </div>
          </div>
          <div className="mt-5 pt-5 border-t border-[var(--dossier-line)]">
            <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--dossier-bone-muted)] font-semibold mb-3">
              Matches
            </div>
            <div className="flex flex-wrap gap-2">
              {recap.matches.map(m => (
                <div
                  key={m.gameNum}
                  className="flex items-center gap-2 px-3 py-2 bg-[var(--dossier-ink)] border border-[var(--dossier-line)] rounded-sm"
                  title={`${CONDITION_LABEL[m.condition]} · ${m.our_kills}-${m.enemy_kills}`}
                >
                  <ResultBadge result={m.result} />
                  <div className="text-xs">
                    <div className="font-semibold text-[var(--dossier-bone)] truncate max-w-[140px]" title={m.opponent}>
                      {m.opponent || 'Unknown'}
                    </div>
                    <div className="text-[10px] text-[var(--dossier-bone-muted)]">
                      {CONDITION_LABEL[m.condition] || m.condition}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MVPS */}
      {mvps && (
        <section className="dossier-rise dossier-rise-3">
          <SectionHeader
            title="Weekend MVPs"
            hint={`Top 5 · Min ${mvps.minGames} of ${mvps.totalMatches} ${mvps.totalMatches === 1 ? 'match' : 'matches'} · per-category volume floors applied`}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-px bg-[var(--dossier-line)] border border-[var(--dossier-line)] rounded-sm overflow-hidden">
            <MvpCard
              accent="text-[var(--dossier-crimson)]"
              category="Damage / Death"
              primaryLabel="Damage per death"
              entries={mvps.damagePerDeath}
              formatValue={p => formatNumber(p.damagePerDeath)}
              floorText={`Eligible: at least ${formatNumber(mvps.thresholds.damageTotal)} total damage and 1+ death this weekend.`}
              onPlayerClick={onPlayerClick}
            />
            <MvpCard
              accent="text-[#fbbf24]"
              category="Damage Taken / Death"
              primaryLabel="Damage taken per death"
              entries={mvps.tankPerDeath}
              formatValue={p => formatNumber(p.tankPerDeath)}
              floorText={`Eligible: at least ${formatNumber(mvps.thresholds.tankTotal)} total damage taken and 1+ death this weekend.`}
              onPlayerClick={onPlayerClick}
            />
            <MvpCard
              accent="text-[var(--dossier-sage)]"
              category="Heal / Death"
              primaryLabel="Healing per death"
              entries={mvps.healPerDeath}
              formatValue={p => formatNumber(p.healPerDeath)}
              floorText={`Eligible: at least ${formatNumber(mvps.thresholds.healTotal)} total healing and 1+ death this weekend.`}
              onPlayerClick={onPlayerClick}
            />
            <MvpCard
              accent="text-[#a78bfa]"
              category="Fewest Deaths"
              primaryLabel="Avg deaths per match"
              entries={mvps.fewestDeaths}
              formatValue={p => p.avgDeaths.toFixed(2)}
              floorText={`Eligible: at least ${formatNumber(mvps.thresholds.engagement)} total damage, healing, OR tank this weekend (any one counts, so DPS, healers and tanks all qualify).`}
              onPlayerClick={onPlayerClick}
            />
            <MvpCard
              accent="text-[#7dd3fc]"
              category="Best K / D"
              primaryLabel="Kills per death"
              entries={mvps.bestKD}
              formatValue={p => p.kd.toFixed(2)}
              floorText={`Eligible: at least ${mvps.thresholds.kills} total kills this weekend (no 1-kill / 0-death wonders).`}
              onPlayerClick={onPlayerClick}
            />
          </div>
        </section>
      )}

      {/* RISING + MOST ACTIVE */}
      <section className="dossier-rise dossier-rise-4">
        <div className="grid lg:grid-cols-4 gap-6 items-stretch">
          {/* Rising (filtered by role) - narrower */}
          <div className="lg:col-span-1 flex flex-col">
            <div className="flex items-center gap-3 flex-wrap mb-1 min-h-[36px]">
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--dossier-bone)] tracking-tight">Rising</h2>
              <RoleToggle value={risingRole} onChange={setRisingRole} />
            </div>
            <div className="text-xs text-[var(--dossier-bone-muted)] mb-3 min-h-[16px]">
              Biggest jumps in {risingRole === 'Heal' ? 'healing' : risingRole === 'Tank' ? 'tank' : 'damage'} · 4-week avg
            </div>
            <div className="bg-[var(--dossier-ink-2)] border border-[var(--dossier-line)] rounded-sm p-5 flex-1 flex flex-col">
              {movers.rising.length === 0 ? (
                <div className="text-sm text-[var(--dossier-bone-muted)] py-4 text-center flex-1 flex items-center justify-center">
                  No qualifying {risingRole === 'Heal' ? 'healers' : risingRole === 'Tank' ? 'tanks' : 'DPS'}
                </div>
              ) : (
                <div>
                  {movers.rising.map(m => <MoverRow key={m.name} mover={m} onPlayerClick={onPlayerClick} />)}
                </div>
              )}
            </div>
          </div>
          {/* Most active (all roles) - wider, multi-column */}
          <div className="lg:col-span-3 flex flex-col">
            <div className="flex items-center gap-3 flex-wrap mb-1 min-h-[36px]">
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--dossier-bone)] tracking-tight">Most active</h2>
            </div>
            <div className="text-xs text-[var(--dossier-bone-muted)] mb-3 min-h-[16px]">
              Matches played · last 4 weeks
            </div>
            <div className="bg-[var(--dossier-ink-2)] border border-[var(--dossier-line)] rounded-sm p-5 flex-1 flex flex-col">
              {mostActive.active.length === 0 ? (
                <div className="text-sm text-[var(--dossier-bone-muted)] py-4 text-center flex-1 flex items-center justify-center">
                  No recent activity
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 sm:grid-flow-col sm:grid-rows-11 lg:grid-rows-7 gap-x-6">
                  {mostActive.active.map(p => <ActiveRow key={p.name} player={p} onPlayerClick={onPlayerClick} />)}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4-WEEKEND TREND */}
      {trend.length > 0 && (
        <section className="dossier-rise dossier-rise-5">
          <SectionHeader title="Last 4 weekends" hint={trend.map(t => t.label).join(' · ')} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[var(--dossier-line)] border border-[var(--dossier-line)] rounded-sm overflow-hidden">
            <TrendSpark
              label="Win rate"
              values={trend.map(t => t.winRate)}
              current={trend[trend.length - 1].winRate}
              format={v => `${v}%`}
              color="var(--dossier-sage)"
              deltaText={trendDelta && trendDelta.winRate !== 0
                ? `${trendDelta.winRate > 0 ? '+' : ''}${trendDelta.winRate.toFixed(0)} pts`
                : null}
              deltaPositive={trendDelta ? trendDelta.winRate >= 0 : true}
            />
            <TrendSpark
              label="Avg team damage"
              values={trend.map(t => t.avgTeamDamage)}
              current={trend[trend.length - 1].avgTeamDamage}
              format={v => formatNumber(v)}
              color="var(--dossier-amber)"
              deltaText={trendDelta && trendDelta.avgTeamDamage != null
                ? `${trendDelta.avgTeamDamage > 0 ? '+' : ''}${trendDelta.avgTeamDamage.toFixed(0)}%`
                : null}
              deltaPositive={trendDelta ? (trendDelta.avgTeamDamage ?? 0) >= 0 : true}
            />
            <TrendSpark
              label="Avg team deaths"
              values={trend.map(t => t.avgTeamDeaths)}
              current={trend[trend.length - 1].avgTeamDeaths}
              format={v => v.toFixed(1)}
              color="var(--dossier-crimson)"
              deltaText={trendDelta
                ? `${trendDelta.avgTeamDeaths > 0 ? '+' : ''}${trendDelta.avgTeamDeaths.toFixed(1)}`
                : null}
              deltaPositive={trendDelta ? trendDelta.avgTeamDeaths <= 0 : true}
            />
          </div>
        </section>
      )}

      {/* MATCH BREAKDOWN */}
      <section className="dossier-rise dossier-rise-6">
        <SectionHeader title="Match breakdown (This Weekend)" hint={`${recap.matches.length} ${recap.matches.length === 1 ? 'match' : 'matches'} this weekend`} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recap.matches.map(m => <MatchCard key={m.gameNum} match={m} />)}
        </div>
      </section>

      {/* ROSTER PULSE */}
      {pulse && (
        <section className="dossier-rise dossier-rise-6">
          <div className="bg-[var(--dossier-ink-2)] border border-[var(--dossier-line)] rounded-sm p-5 flex items-center justify-between gap-6 flex-wrap text-sm">
            <div>
              <span className="text-[var(--dossier-bone)] font-semibold tabular-nums">{pulse.played}</span>
              <span className="text-[var(--dossier-bone-muted)]"> of {pulse.rosterTotal} active members played this weekend</span>
            </div>
            <div className="text-xs text-[var(--dossier-bone-muted)] tabular-nums">
              All-time: <span className="text-[var(--dossier-bone)] font-semibold">{overall.wins}-{overall.losses}</span>
              <span className="mx-2">·</span>
              <span className="text-[var(--dossier-bone)] font-semibold">{overall.winRate}%</span> win rate
              <span className="mx-2">·</span>
              <span className="text-[var(--dossier-bone)] font-semibold">{overall.totalGames}</span> matches
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
