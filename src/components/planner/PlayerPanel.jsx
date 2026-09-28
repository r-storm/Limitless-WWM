import { useState } from 'react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { TEAM_COLOR_PRESETS } from '../../hooks/usePlannerState';
import classNames from '../../utils/classNames';

import enemyGoose from '../../assets/EnemyGoose.png';
import enemyTree from '../../assets/EnemyTree.png';
import limitlessGoose from '../../assets/LimitlessGoose.png';
import limitlessTree from '../../assets/LimitlessTree.png';
import dpsIcon from '../../assets/DPSIcon.png';
import healerIcon from '../../assets/HealerIcon.png';
import tankIcon from '../../assets/TankIcon.png';

const MARKER_TYPES = [
  { type: 'limitlessgoose', label: 'Our Goose', src: limitlessGoose },
  { type: 'limitlesstree', label: 'Our Tree', src: limitlessTree },
  { type: 'enemygoose', label: 'Enemy Goose', src: enemyGoose },
  { type: 'enemytree', label: 'Enemy Tree', src: enemyTree },
];

const CLASS_MARKERS = [
  { type: 'dps', label: 'DPS', src: dpsIcon },
  { type: 'healer', label: 'Healer', src: healerIcon },
  { type: 'tank', label: 'Tank', src: tankIcon },
];

function TeamChip({ team, onRename, onChangeColor, onRemoveTeam }) {
  const [editing, setEditing] = useState(false);
  const [showColors, setShowColors] = useState(false);

  return (
    <div className="group">
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('application/team-id', team.id);
          e.dataTransfer.effectAllowed = 'move';
        }}
        className={classNames(
          'flex items-center gap-2 rounded-sm border px-3 py-2 transition-colors select-none',
          team.x !== null
            ? 'border-[var(--dossier-sage)] bg-[rgba(74,222,128,0.06)]'
            : 'border-[var(--dossier-line)] bg-[var(--dossier-ink)] hover:border-[var(--dossier-line-bright)]',
          'cursor-grab active:cursor-grabbing',
        )}
      >
        <button
          onClick={(e) => { e.stopPropagation(); setShowColors(v => !v); }}
          className="w-4 h-4 rounded-full shrink-0 border border-[var(--dossier-line-bright)] hover:scale-110 transition-transform cursor-pointer"
          style={{ backgroundColor: team.color }}
        />

        {editing ? (
          <input
            autoFocus
            value={team.name}
            onChange={e => onRename(team.id, e.target.value)}
            onBlur={() => setEditing(false)}
            onKeyDown={e => { if (e.key === 'Enter') setEditing(false); }}
            onClick={e => e.stopPropagation()}
            className="flex-1 min-w-0 text-xs font-semibold bg-transparent text-[var(--dossier-bone)] focus:outline-none border-b border-[var(--dossier-amber)]"
          />
        ) : (
          <span
            onDoubleClick={() => setEditing(true)}
            className="flex-1 min-w-0 text-xs font-semibold text-[var(--dossier-bone)] truncate"
          >
            {team.name}
          </span>
        )}

        {team.x !== null && (
          <span className="text-[9px] uppercase tracking-wider font-semibold text-[var(--dossier-sage)] shrink-0">placed</span>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); onRemoveTeam(team.id); }}
          className="opacity-0 group-hover:opacity-100 text-[var(--dossier-bone-muted)] hover:text-[var(--dossier-crimson)] cursor-pointer transition-opacity shrink-0"
        >
          <XMarkIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      {showColors && (
        <div className="flex items-center gap-1.5 px-3 py-1.5">
          {TEAM_COLOR_PRESETS.map(p => (
            <button
              key={p.color}
              onClick={() => { onChangeColor(team.id, p.color); setShowColors(false); }}
              className={classNames(
                'w-5 h-5 rounded-full border-2 transition-transform cursor-pointer',
                team.color === p.color
                  ? 'scale-110 border-[var(--dossier-amber)]'
                  : 'border-transparent hover:scale-110',
              )}
              style={{ backgroundColor: p.color }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PlayerPanel({
  teams,
  onAddTeam,
  onRemoveTeam,
  onRenameTeam,
  onChangeTeamColor,
}) {
  const tokenTile = 'flex flex-col items-center gap-1.5 rounded-sm border border-[var(--dossier-line)] bg-[var(--dossier-ink)] hover:border-[var(--dossier-line-bright)] p-3 cursor-grab active:cursor-grabbing select-none transition-colors w-20';
  const sectionLabel = 'text-[10px] font-semibold text-[var(--dossier-bone-muted)] uppercase tracking-[0.18em] mb-2';

  return (
    <div className="z-40 bg-[var(--dossier-ink-2)] border-t border-[var(--dossier-line)]">
      <div className="px-4 py-3">
        <div className="flex gap-6">
          {/* Objectives section — single row */}
            <div className="shrink-0">
              <div className={sectionLabel}>Objectives</div>
              <div className="flex gap-2">
                {MARKER_TYPES.map(m => (
                  <div
                    key={m.type}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/marker-type', m.type);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    className={tokenTile}
                  >
                    <img src={m.src} alt={m.label} className="w-12 h-12 object-contain" draggable={false} />
                    <span className="text-[10px] text-[var(--dossier-bone-soft)] text-center leading-tight">{m.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="w-px self-stretch bg-[var(--dossier-line)] shrink-0" />

            {/* Classes section — single row */}
            <div className="shrink-0">
              <div className={sectionLabel}>Classes</div>
              <div className="flex gap-2">
                {CLASS_MARKERS.map(m => (
                  <div
                    key={m.type}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/marker-type', m.type);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    className={tokenTile}
                  >
                    <img src={m.src} alt={m.label} className="w-12 h-12 object-contain" draggable={false} />
                    <span className="text-[10px] text-[var(--dossier-bone-soft)] text-center leading-tight">{m.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="w-px self-stretch bg-[var(--dossier-line)] shrink-0" />

            {/* Teams section — 2-row grid */}
            <div className="flex-1 min-w-0">
              <div className={sectionLabel}>Teams</div>
              <div className="grid grid-rows-2 grid-flow-col auto-cols-[11rem] gap-2">
                {teams.map(team => (
                  <TeamChip
                    key={team.id}
                    team={team}
                    onRename={onRenameTeam}
                    onChangeColor={onChangeTeamColor}
                    onRemoveTeam={onRemoveTeam}
                  />
                ))}
                {teams.length < 6 && (
                  <button
                    onClick={onAddTeam}
                    className="flex items-center justify-center gap-1.5 rounded-sm border border-dashed border-[var(--dossier-line)] bg-transparent px-4 py-2 text-xs uppercase tracking-wider font-semibold text-[var(--dossier-bone-muted)] hover:text-[var(--dossier-amber)] hover:border-[var(--dossier-amber)] transition-colors cursor-pointer"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add Team
                  </button>
                )}
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
