import { useMemo } from 'react';
import { getAllPlayers } from '../../data/dataUtils';
import ClassIcon from '../ClassIcon';

export default function TeamPage({ onPlayerClick }) {
  const allPlayers = useMemo(() => getAllPlayers(), []);

  const players = useMemo(
    () => [...allPlayers].sort((a, b) => a.name.localeCompare(b.name)),
    [allPlayers],
  );

  return (
    <div>
      <div className="flex items-end justify-between gap-4 mb-5 flex-wrap">
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--dossier-bone)] tracking-tight">Roster</h2>
        <div className="text-xs text-[var(--dossier-bone-muted)]">
          {players.length} {players.length === 1 ? 'member' : 'members'}
        </div>
      </div>

      <div className="columns-1 sm:columns-2 lg:columns-3 gap-2 [&>*]:break-inside-avoid [&>*]:mb-2">
        {players.map(player => (
          <button
            key={player.name}
            onClick={() => onPlayerClick(player.name)}
            className="flex items-center gap-3 flex-wrap bg-[var(--dossier-ink-2)] border border-[var(--dossier-line)] rounded-sm px-4 py-3 cursor-pointer text-left w-full hover:bg-[var(--dossier-ink)] hover:border-[var(--dossier-line-bright)] transition-colors"
          >
            <span className="flex items-center gap-0.5 shrink-0">
              <ClassIcon playerName={player.name} size={16} />
            </span>
            <span className="text-sm font-semibold text-[var(--dossier-bone)] truncate min-w-0 flex-1">
              {player.name}
            </span>
            <span className="text-xs text-[var(--dossier-bone-muted)] shrink-0 tabular-nums">
              {player.games_played} {player.games_played === 1 ? 'match' : 'matches'}
            </span>
          </button>
        ))}
        {players.length === 0 && (
          <div className="col-span-full text-center py-12 text-[var(--dossier-bone-muted)] bg-[var(--dossier-ink-2)] border border-[var(--dossier-line)] rounded-sm">
            No players found
          </div>
        )}
      </div>
    </div>
  );
}
