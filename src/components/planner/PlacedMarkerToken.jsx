import { useRef, useCallback } from 'react';
import classNames from '../../utils/classNames';

import enemyGoose from '../../assets/EnemyGoose.png';
import enemyTree from '../../assets/EnemyTree.png';
import limitlessGoose from '../../assets/LimitlessGoose.png';
import limitlessTree from '../../assets/LimitlessTree.png';
import dpsIcon from '../../assets/DPSIcon.png';
import healerIcon from '../../assets/HealerIcon.png';
import tankIcon from '../../assets/TankIcon.png';

const MARKER_IMAGES = {
  enemygoose: enemyGoose,
  enemytree: enemyTree,
  limitlessgoose: limitlessGoose,
  limitlesstree: limitlessTree,
  dps: dpsIcon,
  healer: healerIcon,
  tank: tankIcon,
};

const CLASS_TYPES = new Set(['dps', 'healer', 'tank']);

export default function PlacedMarkerToken({ marker, mode, selected, onMove, onRemove, onResizeText, onGroupDragStart, onGroupDragMove, onGroupDragEnd }) {
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
      offset.current = { x: pct.x - marker.x, y: pct.y - marker.y };
    }
  }, [mode, marker.x, marker.y, selected, onGroupDragStart, getPct]);

  const handlePointerMove = useCallback((e) => {
    if (!dragging.current) return;
    e.preventDefault();
    e.stopPropagation();
    const pct = getPct(e);

    if (selected) {
      onGroupDragMove?.(pct.x - dragStart.current.x, pct.y - dragStart.current.y);
    } else {
      onMove(marker.id, Math.max(0, Math.min(100, pct.x - offset.current.x)), Math.max(0, Math.min(100, pct.y - offset.current.y)));
    }
  }, [marker.id, onMove, selected, onGroupDragMove, getPct]);

  const handlePointerUp = useCallback(() => {
    if (dragging.current && selected) onGroupDragEnd?.();
    dragging.current = false;
  }, [selected, onGroupDragEnd]);

  const isText = marker.type === 'text';
  const src = MARKER_IMAGES[marker.type];
  const isClass = CLASS_TYPES.has(marker.type);
  const size = isText ? undefined : isClass ? '2.5rem' : '5rem';

  const handleWheel = useCallback((e) => {
    if (!isText || mode !== 'select') return;
    e.preventDefault();
    e.stopPropagation();
    const current = marker.fontSize || 14;
    const delta = e.deltaY > 0 ? -1 : 1;
    const next = Math.max(8, Math.min(48, current + delta));
    if (next !== current) onResizeText?.(marker.id, next);
  }, [isText, mode, marker.id, marker.fontSize, onResizeText]);

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      className={classNames(
        'absolute z-20 group',
        mode === 'select' ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none',
      )}
      style={{
        left: `${marker.x}%`,
        top: `${marker.y}%`,
        transform: 'translate(-50%, -50%)',
        touchAction: 'none',
        ...(size ? { width: size, height: size } : {}),
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {isText ? (
        <div
          className={classNames(
            'whitespace-nowrap font-bold select-none drop-shadow-lg px-1',
            selected && 'ring-2 ring-cyan-400 rounded',
          )}
          style={{
            color: marker.color || '#ffffff',
            fontSize: `${marker.fontSize || 14}px`,
            textShadow: '0 1px 4px rgba(0,0,0,0.8)',
          }}
        >
          {marker.text}
        </div>
      ) : (
        <img
          src={src}
          alt={marker.type}
          className={classNames(
            'w-full h-full object-contain drop-shadow-lg select-none shrink-0',
            isClass && 'rounded-lg bg-black p-0.5',
            selected && 'ring-2 ring-cyan-400 rounded-lg',
          )}
          draggable={false}
        />
      )}
      {mode === 'select' && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(marker.id); }}
          className="absolute -top-1.5 -right-1.5 opacity-0 group-hover:opacity-100 transition-opacity w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center cursor-pointer"
        >
          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
