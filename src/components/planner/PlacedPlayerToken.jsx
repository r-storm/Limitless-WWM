import { useRef, useCallback } from 'react';
import ClassIcon from '../ClassIcon';
import classNames from '../../utils/classNames';

export default function PlacedPlayerToken({
  name,
  x,
  y,
  mode,
  onMove,
  onRemove,
}) {
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const handlePointerDown = useCallback((e) => {
    if (mode !== 'select') return;
    e.preventDefault();
    e.stopPropagation();
    dragging.current = true;
    e.target.setPointerCapture(e.pointerId);

    const parent = containerRef.current?.closest('[data-workspace]');
    if (!parent) return;
    const parentRect = parent.getBoundingClientRect();
    const pctX = ((e.clientX - parentRect.left) / parentRect.width) * 100;
    const pctY = ((e.clientY - parentRect.top) / parentRect.height) * 100;
    offset.current = { x: pctX - x, y: pctY - y };
  }, [mode, x, y]);

  const handlePointerMove = useCallback((e) => {
    if (!dragging.current) return;
    e.preventDefault();
    e.stopPropagation();
    const parent = containerRef.current?.closest('[data-workspace]');
    if (!parent) return;
    const parentRect = parent.getBoundingClientRect();
    const pctX = ((e.clientX - parentRect.left) / parentRect.width) * 100 - offset.current.x;
    const pctY = ((e.clientY - parentRect.top) / parentRect.height) * 100 - offset.current.y;
    onMove(name, Math.max(0, Math.min(100, pctX)), Math.max(0, Math.min(100, pctY)));
  }, [name, onMove]);

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  return (
    <div
      ref={containerRef}
      className={classNames(
        'absolute z-20 group',
        mode === 'select' ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none',
      )}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
        touchAction: 'none',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div className="flex items-center gap-1.5 rounded-lg px-2 py-1 glass-floating border border-[var(--color-border)] shadow-lg select-none">
        <ClassIcon playerName={name} size={14} />
        <span className="text-xs text-[var(--color-text-primary)] max-w-[80px] truncate font-medium">
          {name}
        </span>
        {mode === 'select' && (
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(name); }}
            className="opacity-0 group-hover:opacity-100 transition-opacity ml-0.5 text-[var(--color-text-muted)] hover:text-red-400 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
