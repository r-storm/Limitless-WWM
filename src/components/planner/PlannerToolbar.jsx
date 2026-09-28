import { CursorArrowRaysIcon, PencilIcon, ArrowUturnLeftIcon, ArrowUturnRightIcon, TrashIcon, ClockIcon, ArrowLongRightIcon } from '@heroicons/react/24/outline';
import classNames from '../../utils/classNames';
import Tooltip from '../Tooltip';

const PEN_COLORS = [
  { value: '#ffffff', label: 'White' },
  { value: '#ef4444', label: 'Red' },
  { value: '#22c55e', label: 'Green' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#f59e0b', label: 'Amber' },
  { value: '#8b5cf6', label: 'Violet' },
];

const SHAPE_TYPES = [
  { value: 'dot', label: 'Dot', icon: (
    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="currentColor"><circle cx="8" cy="8" r="4" /></svg>
  )},
  { value: 'circle', label: 'Circle', icon: (
    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="8" cy="8" r="6" /></svg>
  )},
  { value: 'square', label: 'Square', icon: (
    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="12" height="12" /></svg>
  )},
];

export default function PlannerToolbar({
  mode,
  onModeChange,
  shapeType,
  onShapeTypeChange,
  penColor,
  onPenColorChange,
  penSize,
  onPenSizeChange,
  onUndo,
  onRedo,
  onClear,
  strokeCount,
  redoCount,
  timedDrawing,
  onTimedDrawingChange,
}) {
  const showPenControls = mode === 'draw' || mode === 'arrow' || mode === 'shape' || mode === 'text';

  const modeBtnBase = 'flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer';
  const modeBtnActive = 'bg-[var(--dossier-bone)] text-[var(--dossier-ink)]';
  const modeBtnIdle = 'text-[var(--dossier-bone-muted)] hover:text-[var(--dossier-bone)] hover:bg-[var(--dossier-ink)]';
  const iconBtnBase = 'p-1.5 rounded-sm transition-colors';

  return (
    <div className="absolute top-12 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 bg-[var(--dossier-ink-2)] border border-[var(--dossier-line)] rounded-sm px-3 py-2 shadow-xl">
      {/* Mode toggle */}
      <div className="flex items-center border border-[var(--dossier-line)] rounded-sm overflow-hidden">
        <Tooltip content="Select mode — click and drag tokens to reposition them">
          <button
            onClick={() => onModeChange('select')}
            className={classNames(modeBtnBase, mode === 'select' ? modeBtnActive : modeBtnIdle)}
          >
            <CursorArrowRaysIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Select</span>
          </button>
        </Tooltip>
        <Tooltip content="Draw mode — freehand pen stroke">
          <button
            onClick={() => onModeChange('draw')}
            className={classNames(modeBtnBase, mode === 'draw' ? modeBtnActive : modeBtnIdle)}
          >
            <PencilIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Draw</span>
          </button>
        </Tooltip>
        <Tooltip content="Arrow mode — drag to draw a directional arrow">
          <button
            onClick={() => onModeChange('arrow')}
            className={classNames(modeBtnBase, mode === 'arrow' ? modeBtnActive : modeBtnIdle)}
          >
            <ArrowLongRightIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Arrow</span>
          </button>
        </Tooltip>
        {SHAPE_TYPES.map(s => (
          <Tooltip key={s.value} content={`Shape mode — ${s.label.toLowerCase()}`}>
            <button
              onClick={() => { onModeChange('shape'); onShapeTypeChange(s.value); }}
              className={classNames(
                modeBtnBase,
                mode === 'shape' && shapeType === s.value ? modeBtnActive : modeBtnIdle,
              )}
            >
              {s.icon}
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          </Tooltip>
        ))}
        <Tooltip content="Text mode — click on the canvas to add a text label">
          <button
            onClick={() => onModeChange('text')}
            className={classNames(modeBtnBase, mode === 'text' ? modeBtnActive : modeBtnIdle)}
          >
            <svg viewBox="0 0 16 16" className="w-4 h-4" fill="currentColor"><text x="3" y="13" fontSize="14" fontWeight="bold" fontFamily="sans-serif">T</text></svg>
            <span className="hidden sm:inline">Text</span>
          </button>
        </Tooltip>
      </div>

      <div className="w-px h-6 bg-[var(--dossier-line)]" />

      {/* Draw/Arrow controls */}
      {showPenControls && (
        <>
          <div className="flex items-center gap-1">
            {PEN_COLORS.map(c => (
              <Tooltip key={c.value} content={`Pen color: ${c.label}`}>
                <button
                  onClick={() => onPenColorChange(c.value)}
                  className={classNames(
                    'w-5 h-5 rounded-full border-2 transition-transform cursor-pointer',
                    penColor === c.value
                      ? 'scale-125 border-[var(--dossier-amber)]'
                      : 'border-transparent hover:scale-110',
                  )}
                  style={{ backgroundColor: c.value }}
                />
              </Tooltip>
            ))}
          </div>

          <Tooltip content={`Pen size: ${penSize}px`}>
            <input
              type="range"
              min={1}
              max={10}
              value={penSize}
              onChange={e => onPenSizeChange(Number(e.target.value))}
              className="w-16 h-1 accent-[var(--dossier-amber)] cursor-pointer"
            />
          </Tooltip>

          <div className="w-px h-6 bg-[var(--dossier-line)]" />
        </>
      )}

      {/* Undo / Clear / Timed */}
      <Tooltip content="Undo last stroke (Ctrl+Z)">
        <button
          onClick={onUndo}
          disabled={strokeCount === 0}
          className={`${iconBtnBase} text-[var(--dossier-bone-muted)] hover:text-[var(--dossier-bone)] hover:bg-[var(--dossier-ink)] disabled:opacity-30 cursor-pointer disabled:cursor-default`}
        >
          <ArrowUturnLeftIcon className="w-4 h-4" />
        </button>
      </Tooltip>
      <Tooltip content="Redo stroke (Ctrl+Shift+Z)">
        <button
          onClick={onRedo}
          disabled={redoCount === 0}
          className={`${iconBtnBase} text-[var(--dossier-bone-muted)] hover:text-[var(--dossier-bone)] hover:bg-[var(--dossier-ink)] disabled:opacity-30 cursor-pointer disabled:cursor-default`}
        >
          <ArrowUturnRightIcon className="w-4 h-4" />
        </button>
      </Tooltip>
      <Tooltip content="Clear all drawing on this canvas">
        <button
          onClick={onClear}
          disabled={strokeCount === 0}
          className={`${iconBtnBase} text-[var(--dossier-bone-muted)] hover:text-[var(--dossier-crimson)] hover:bg-[var(--dossier-ink)] disabled:opacity-30 cursor-pointer disabled:cursor-default`}
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </Tooltip>
      <Tooltip content={timedDrawing ? 'Timed drawing ON — strokes auto-fade after 10 seconds. Click to disable.' : 'Timed drawing OFF — click to enable 10-second auto-fade'}>
        <button
          onClick={() => onTimedDrawingChange(!timedDrawing)}
          className={classNames(
            iconBtnBase,
            'cursor-pointer',
            timedDrawing
              ? 'bg-[var(--dossier-amber)] text-[var(--dossier-ink)]'
              : 'text-[var(--dossier-bone-muted)] hover:text-[var(--dossier-bone)] hover:bg-[var(--dossier-ink)]',
          )}
        >
          <ClockIcon className="w-4 h-4" />
        </button>
      </Tooltip>
    </div>
  );
}
