import { useMemo } from 'react';
import StatCard from '../StatCard';
import SortableTable from '../SortableTable';
import ComparisonBar from '../matches/ComparisonBar';
import PointsProgressionChart from '../charts/PointsProgressionChart';
import FunCoinsTrendChart from '../charts/FunCoinsTrendChart';
import {
  getCurrentPoints,
  getRecordByType,
  getObjectiveStats,
  getWarAggregateStats,
} from '../../data/dataUtils';
import { formatNumber } from '../../../../utils/formatters';
import { gameDefinitions } from '../../data/gameDefinitions';

function ResultBadge(v) {
  const isWin = v === 'win';
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
      isWin
        ? 'bg-emerald-400/15 text-emerald-400 border border-emerald-400/30'
        : 'bg-red-400/15 text-red-400 border border-red-400/30'
    }`}>
      {v}
    </span>
  );
}

function ModeBadge(v) {
  const isLeague = v === 'league';
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold capitalize ${
      isLeague
        ? 'bg-blue-400/15 text-blue-400 border border-blue-400/30'
        : 'bg-amber-400/15 text-amber-400 border border-amber-400/30'
    }`}>
      {v}
    </span>
  );
}

const matchColumns = [
  { key: 'date', label: 'Date & Time', mobileLabel: 'Date', align: 'left' },
  { key: 'opponent', label: 'Opponent', align: 'left' },
  { key: 'result', label: 'Result', align: 'right', format: ResultBadge },
  { key: 'type', label: 'Mode', align: 'right', format: ModeBadge },
  { key: 'points_after', label: 'Points', align: 'right', format: v => v != null ? String(v) : '-' },
  { key: 'our_kills', label: 'Kills', align: 'right' },
  { key: 'enemy_kills', label: 'Enemy Kills', mobileLabel: 'Enemy', align: 'right' },
  { key: 'killDiff', label: 'Kill Diff', mobileLabel: 'Diff', align: 'right', format: v => (v > 0 ? `+${v}` : String(v)) },
  { key: 'our_fun_coins', label: 'Coins Earned', mobileLabel: 'Coins', align: 'right', hideOnMobile: true },
];

export default function WarOverviewPage() {
  const leaguePoints = useMemo(() => getCurrentPoints('league'), []);
  const rankedPoints = useMemo(() => getCurrentPoints('ranked'), []);
  const leagueRecord = useMemo(() => getRecordByType('league'), []);
  const rankedRecord = useMemo(() => getRecordByType('ranked'), []);
  const objectives = useMemo(() => getObjectiveStats(), []);
  const agg = useMemo(() => getWarAggregateStats(), []);

  const matchRows = useMemo(() =>
    [...gameDefinitions]
      .filter(g => g.opponent)
      .sort((a, b) => b.gameNum - a.gameNum)
      .map(g => ({
        ...g,
        name: g.opponent,
        killDiff: (g.our_kills || 0) - (g.enemy_kills || 0),
      })),
  []);

  return (
    <div className="space-y-8">
      {/* Points & Record Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="League Points" value={leaguePoints} accent="blue" />
        <StatCard label="League Record" value={`${leagueRecord.wins}W - ${leagueRecord.losses}L`} numeric={false} accent="blue" />
        <StatCard label="Ranked Points" value={rankedPoints} accent="amber" />
        <StatCard label="Ranked Record" value={`${rankedRecord.wins}W - ${rankedRecord.losses}L`} numeric={false} accent="amber" />
      </div>

      {/* Overall War Stats */}
      {agg && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Overall Win Rate" value={`${agg.winRate}%`} numeric={false} accent="green" />
          <StatCard label="Total Kill Diff" value={agg.killDiff > 0 ? `+${formatNumber(agg.killDiff)}` : formatNumber(agg.killDiff)} numeric={false} accent={agg.killDiff >= 0 ? 'green' : 'red'} />
          <StatCard label="Avg Kills / Match" value={agg.avgOurKills} accent="violet" />
          <StatCard label="Kill Ratio" value={agg.killRatio.toFixed(2)} numeric={false} accent={agg.killRatio >= 1.0 ? 'green' : 'red'} />
        </div>
      )}

      {/* Kill & Coin Comparisons */}
      {agg && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="glass-adaptive border border-[var(--color-border)] rounded-xl p-3 sm:p-4 space-y-3">
            <ComparisonBar label="Total Kills" ourValue={agg.totalOurKills} enemyValue={agg.totalEnemyKills} />
            <div className="flex justify-between text-xs text-[var(--color-text-muted)]">
              <span>Limitless</span>
              <span>Enemy</span>
            </div>
          </div>
          <div className="glass-adaptive border border-[var(--color-border)] rounded-xl p-3 sm:p-4 space-y-3">
            <ComparisonBar label="Total Fun Coins" ourValue={agg.totalOurCoins} enemyValue={agg.totalEnemyCoins} />
            <div className="flex justify-between text-xs text-[var(--color-text-muted)]">
              <span>Limitless</span>
              <span>Enemy</span>
            </div>
          </div>
        </div>
      )}

      {/* Points Progression Chart */}
      <PointsProgressionChart />

      {/* Objective Stats */}
      {objectives && (
        <div>
          <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">
            Objective Stats
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="glass-adaptive border border-[var(--color-border)] rounded-xl p-3 sm:p-4 space-y-3">
              <ComparisonBar label="Fortune Tree (avg)" ourValue={objectives.fortuneTree.ours} enemyValue={objectives.fortuneTree.enemy} />
              <div className="text-center">
                <span className="text-2xl font-bold font-mono text-emerald-400">{objectives.fortuneTree.rate}%</span>
                <p className="text-[var(--color-text-muted)] text-xs mt-0.5">tree advantage rate</p>
              </div>
              <div className="flex justify-center gap-4 text-xs text-[var(--color-text-muted)]">
                <span>Our deliveries: <span className="text-emerald-400 font-semibold">{objectives.fortuneTree.deliveryRate}%</span></span>
                <span>Enemy: <span className="text-red-400 font-semibold">{objectives.fortuneTree.enemyDeliveryRate}%</span></span>
              </div>
            </div>
            <div className="glass-adaptive border border-[var(--color-border)] rounded-xl p-3 sm:p-4 space-y-3">
              <ComparisonBar label="Guardian Goose (avg)" ourValue={objectives.guardianGoose.ours} enemyValue={objectives.guardianGoose.enemy} format={v => `${v}%`} inverted />
              <div className="text-center">
                <span className="text-2xl font-bold font-mono text-emerald-400">{objectives.guardianGoose.rate}%</span>
                <p className="text-[var(--color-text-muted)] text-xs mt-0.5">goose kill rate</p>
              </div>
            </div>
            <div className="glass-adaptive border border-[var(--color-border)] rounded-xl p-3 sm:p-4 space-y-3">
              <ComparisonBar label="Bulwarks (avg)" ourValue={objectives.bulwark.ours} enemyValue={objectives.bulwark.enemy} format={v => String(v)} />
              <div className="text-center">
                <span className="text-2xl font-bold font-mono text-emerald-400">{objectives.bulwark.rate}%</span>
                <p className="text-[var(--color-text-muted)] text-xs mt-0.5">bulwark advantage rate</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fun Coins Trend */}
      <FunCoinsTrendChart />

      {/* Match History Table */}
      <div>
        <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">
          Match History
        </h2>
        <SortableTable columns={matchColumns} data={matchRows} />
      </div>
    </div>
  );
}
