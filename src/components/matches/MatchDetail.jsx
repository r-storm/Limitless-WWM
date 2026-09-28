import { useMemo } from 'react';
import SortableTable from '../SortableTable';
import ComparisonBar from './ComparisonBar';
import { formatNumber } from '../../utils/formatters';
import { getGamePlayers, getGameSummary, determineWinCondition } from '../../data/dataUtils';

const columns = [
  { key: 'name', label: 'Player', align: 'left' },
  { key: 'defeated', label: 'Kills', align: 'right' },
  { key: 'assist', label: 'Assists', align: 'right' },
  { key: 'deaths', label: 'Deaths', align: 'right' },
  { key: 'damage', label: 'Damage', mobileLabel: 'DMG', align: 'right' },
  { key: 'heal', label: 'Healing', mobileLabel: 'Heal', align: 'right' },
  { key: 'tank', label: 'Tank', align: 'right', hideOnMobile: true },
  { key: 'siege_damage', label: 'Siege', align: 'right', hideOnMobile: true },
];

function pctFormat(v) {
  return `${v}%`;
}

function treeFormat(v) {
  if (v >= 465) return `${v}m · Delivered`;
  if (v === 0) return '0m';
  return `${v}m`;
}

function StatStrip({ items }) {
  return (
    <div className="bg-[var(--dossier-ink-2)] border border-[var(--dossier-line)] rounded-sm flex flex-wrap divide-x divide-[var(--dossier-line)]">
      {items.map(item => {
        const valueColor =
          item.accent === 'sage' ? 'text-[var(--dossier-sage)]'
          : item.accent === 'crimson' ? 'text-[var(--dossier-crimson)]'
          : 'text-[var(--dossier-bone)]';
        return (
          <div
            key={item.label}
            className="flex-1 min-w-[120px] px-4 py-3 first:border-l-0"
          >
            <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--dossier-bone-muted)] font-semibold mb-1.5">
              {item.label}
            </div>
            <div className={`text-xl font-bold tabular-nums leading-none ${valueColor}`}>
              {item.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const WIN_CONDITION_LABELS = {
  tree_delivered: 'Tree Delivered',
  tree_distance: 'Tree Distance',
  goose_hp: 'Goose HP',
  bulwark: 'Bulwark',
  unknown: 'Unknown',
};

export default function MatchDetail({ gameNum, onPlayerClick }) {
  const summary = useMemo(() => getGameSummary(gameNum), [gameNum]);
  const players = useMemo(() => getGamePlayers(gameNum), [gameNum]);

  const hasMetadata = summary.opponent != null;

  const winCondition = useMemo(() => {
    if (!hasMetadata) return null;
    return determineWinCondition(summary);
  }, [summary, hasMetadata]);

  const isWin = summary.result === 'win';
  const resultPill = isWin
    ? 'border-[var(--dossier-sage)] text-[var(--dossier-sage)] bg-[rgba(74,222,128,0.08)]'
    : 'border-[var(--dossier-crimson)] text-[var(--dossier-crimson)] bg-[rgba(248,113,113,0.08)]';

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        {hasMetadata && (
          <h2 className="text-lg sm:text-xl font-bold text-[var(--dossier-bone)] tracking-tight">
            Limitless <span className="text-[var(--dossier-bone-muted)] font-normal">vs</span>{' '}
            <span className="text-[var(--dossier-amber)]">{summary.opponent}</span>
          </h2>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-wider border ${resultPill}`}>
            {summary.result}
          </span>
          {winCondition && (
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--dossier-bone-muted)] bg-[var(--dossier-ink-2)] border border-[var(--dossier-line)] px-2 py-1 rounded-sm">
              {WIN_CONDITION_LABELS[winCondition.method]}
            </span>
          )}
          <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--dossier-bone)] bg-[var(--dossier-ink-2)] border border-[var(--dossier-line)] px-2 py-1 rounded-sm">
            {summary.type}
          </span>
          <span className="text-[var(--dossier-bone-muted)] text-xs tabular-nums">
            Match {summary.gameNum} · {summary.date}
          </span>
          {hasMetadata && summary.points_gained != null && (
            <span className="text-[var(--dossier-bone-muted)] text-xs tabular-nums">
              · <span className={isWin ? 'text-[var(--dossier-sage)] font-semibold' : 'text-[var(--dossier-crimson)] font-semibold'}>
                {isWin ? '+' : '-'}{summary.points_gained} pts
              </span> → {summary.points_after} pts
            </span>
          )}
        </div>

        {hasMetadata && (summary.our_kills > 0 || summary.enemy_kills > 0) && (
          <div className="bg-[var(--dossier-ink-2)] border border-[var(--dossier-line)] rounded-sm p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            <ComparisonBar label="Kills" ourValue={summary.our_kills} enemyValue={summary.enemy_kills} />
            <ComparisonBar label="Tree Distance" ourValue={summary.our_fortune_tree_m} enemyValue={summary.enemy_fortune_tree_m} format={treeFormat} />
            <ComparisonBar label="Goose HP Remaining" ourValue={summary.our_guardian_goose_hp_pct} enemyValue={summary.enemy_guardian_goose_hp_pct} format={pctFormat} inverted />
            <ComparisonBar label="Bulwarks" ourValue={summary.our_bulwark_remaining} enemyValue={summary.enemy_bulwark_remaining} format={v => `${v} / 3`} />
            <ComparisonBar label="Fun Coins" ourValue={summary.our_fun_coins} enemyValue={summary.enemy_fun_coins} />
          </div>
        )}

        <StatStrip
          items={[
            { label: 'Players', value: formatNumber(summary.playerCount) },
            { label: 'Total Damage', value: formatNumber(summary.totalDamage) },
            { label: 'Total Kills', value: formatNumber(summary.totalKills) },
            { label: 'Total Deaths', value: formatNumber(summary.totalDeaths) },
            ...(summary.killRatio != null ? [{
              label: 'Kill Ratio',
              value: summary.killRatio.toFixed(2),
              accent: summary.killRatio >= 1.0 ? 'sage' : 'crimson',
            }] : []),
          ]}
        />
      </div>
      <SortableTable
        columns={columns}
        data={players}
        onPlayerClick={onPlayerClick}
      />
    </div>
  );
}
