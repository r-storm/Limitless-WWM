import { useState } from 'react';
import TabBar from '../TabBar';
import classNames from '../../utils/classNames';

// Frozen season snapshots. Each lives in src/archive/<season>/ with its own
// copy of the pages, components and data, so live changes never alter them.
import Spring2026Dashboard from '../../archive/spring2026/components/pages/DashboardPage';
import Spring2026Players from '../../archive/spring2026/components/pages/PlayersPage';
import Spring2026Matches from '../../archive/spring2026/components/pages/MatchesPage';
import Spring2026Opponents from '../../archive/spring2026/components/pages/OpponentHistoryPage';
import Spring2026PlayerModal from '../../archive/spring2026/components/PlayerModal';
import { gameDefinitions as spring2026Games } from '../../archive/spring2026/data/gameDefinitions';
import { getWarDays as getSpring2026WarDays } from '../../archive/spring2026/data/dataUtils';

const seasons = [
  {
    key: 'spring2026',
    label: 'Spring 2026',
    range: 'Feb 14 - May 10, 2026',
    matchCount: spring2026Games.length,
    warDayCount: getSpring2026WarDays().length,
    pages: {
      dashboard: Spring2026Dashboard,
      players: Spring2026Players,
      matches: Spring2026Matches,
      opponents: Spring2026Opponents,
    },
    PlayerModal: Spring2026PlayerModal,
  },
];

const tabs = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'players', label: 'Players' },
  { key: 'matches', label: 'Matches' },
  { key: 'opponents', label: 'Opponents' },
];

export default function ArchivePage() {
  const [seasonKey, setSeasonKey] = useState(seasons[0].key);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const season = seasons.find(s => s.key === seasonKey);
  const Page = season.pages[activeTab];
  const SeasonPlayerModal = season.PlayerModal;

  return (
    <div>
      <div className="bg-[var(--dossier-ink-2)] border border-[var(--dossier-line)] rounded-sm px-4 py-3 sm:px-5 sm:py-4 mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[var(--dossier-bone-muted)]">
            Archived season
          </div>
          <div className="mt-1 flex items-baseline gap-3 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--dossier-bone)] tracking-tight">{season.label}</h2>
            <span className="text-xs text-[var(--dossier-bone-muted)] tabular-nums">
              {season.range} - {season.warDayCount} war days, {season.matchCount} matches
            </span>
          </div>
        </div>

        {seasons.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            {seasons.map(s => (
              <button
                key={s.key}
                onClick={() => { setSeasonKey(s.key); setSelectedPlayer(null); }}
                className={classNames(
                  'px-3 py-1.5 text-xs font-semibold uppercase tracking-wider border transition-colors cursor-pointer',
                  s.key === seasonKey
                    ? 'bg-[var(--dossier-bone)] text-[var(--dossier-ink)] border-[var(--dossier-bone)]'
                    : 'bg-[var(--dossier-ink-2)] text-[var(--dossier-bone-muted)] border-[var(--dossier-line)] hover:text-[var(--dossier-bone)]',
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <TabBar tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div key={`${seasonKey}-${activeTab}`} className="animate-fade-in">
        <Page onPlayerClick={setSelectedPlayer} />
      </div>

      {selectedPlayer && (
        <SeasonPlayerModal
          playerName={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </div>
  );
}
