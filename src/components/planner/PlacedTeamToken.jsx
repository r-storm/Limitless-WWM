import { useRef, useCallback } from 'react';
import classNames from '../../utils/classNames';

export default function PlacedTeamToken({
  team,
  mode,
  selected,
  onMove,
  onRemoveFromMap,
  onGroupDragStart,
  onGroupDragMove,
  onGroupDragEnd,
}) {
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const offset = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const getPct = useCallback((e) => {
    const parent = containerRef.current?.closest('[data-workspace]');
    if (!parent) return { x: 50, y: 50 };
    const parentRect = parent.getBoundingClientRect();
    return {
      x: ((e.clientX - parentRect.left) / parentRect.width) * 100,
      y: ((e.clientY - parentRect.top) / parentRect.height) * 100,
    };
  }, []);

  const handlePointerDown = useCallback((e) => {
    if (mode !== 'select') return;
    e.preventDefault();
    e.stopPropagation();
    dragging.current = true;
    e.target.setPointerCapture(e.pointerId);

    const pct = getPct(e);
    if (selected) {
      dragStart.current = pct;
      onGroupDragStart?.();
    } else {
      offset.current = { x: pct.x - team.x, y: pct.y - team.y };
    }
  }, [mode, team.x, team.y, selected, onGroupDragStart, getPct]);

  const handlePointerMove = useCallback((e) => {
    if (!dragging.current) return;
    e.preventDefault();
    e.stopPropagation();
    const pct = getPct(e);

    if (selected) {
      onGroupDragMove?.(pct.x - dragStart.current.x, pct.y - dragStart.current.y);
    } else {
      onMove(team.id, Math.max(0, Math.min(100, pct.x - offset.current.x)), Math.max(0, Math.min(100, pct.y - offset.current.y)));
    }
  }, [team.id, onMove, selected, onGroupDragMove, getPct]);

  const handlePointerUp = useCallback(() => {
    if (dragging.current && selected) onGroupDragEnd?.();
    dragging.current = false;
  }, [selected, onGroupDragEnd]);

  return (
    <div
      ref={containerRef}
      className={classNames(
        'absolute z-20 group',
        mode === 'select' ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none',
      )}
      style={{
        left: `${team.x}%`,
        top: `${team.y}%`,
        transform: 'translate(-50%, -50%)',
        touchAction: 'none',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div
        className={classNames(
          'flex items-center gap-1.5 rounded-full px-3 py-1.5 shadow-lg select-none border-2',
          selected && 'ring-2 ring-cyan-400 ring-offset-1 ring-offset-transparent',
        )}
        style={{
          backgroundColor: team.color,
          borderColor: selected ? 'rgb(167, 139, 250)' : 'rgba(255,255,255,0.3)',
        }}
      >
        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: team.color }} />
        <span className="text-xs font-bold text-white whitespace-nowrap">{team.name}</span>
        {mode === 'select' && (
          <button
            onClick={(e) => { e.stopPropagation(); onRemoveFromMap(team.id); }}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-white/60 hover:text-red-400 cursor-pointer ml-0.5"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
