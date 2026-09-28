import { useState, useRef, useEffect } from 'react';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import classNames from '../../utils/classNames';
import Tooltip from '../Tooltip';

export default function CanvasTabs({ canvases, activeIndex, onSelect, onAdd, onRemove, onRename }) {
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (editingIndex !== null && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingIndex]);

  function startRename(index, currentName) {
    setEditingIndex(index);
    setEditValue(currentName);
  }

  function commitRename() {
    if (editingIndex !== null) {
      const trimmed = editValue.trim();
      if (trimmed && trimmed !== canvases[editingIndex].name) {
        onRename(editingIndex, trimmed);
      }
      setEditingIndex(null);
    }
  }

  return (
    <div className="flex items-center gap-1 px-3 py-1 bg-[var(--dossier-ink-2)] border-b border-[var(--dossier-line)]">
      {canvases.map((canvas, i) => (
        <div
          key={canvas.id}
          className={classNames(
            'group flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider cursor-pointer transition-colors select-none -mb-px border-b-2',
            i === activeIndex
              ? 'text-[var(--dossier-amber)] border-[var(--dossier-amber)]'
              : 'text-[var(--dossier-bone-muted)] border-transparent hover:text-[var(--dossier-bone)]'
          )}
          onClick={() => onSelect(i)}
          onDoubleClick={() => startRename(i, canvas.name)}
        >
          {editingIndex === i ? (
            <input
              ref={inputRef}
              className="bg-transparent border-b border-[var(--dossier-amber)] text-[var(--dossier-bone)] text-xs w-20 outline-none uppercase tracking-wider"
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              onBlur={commitRename}
              onKeyDown={e => {
                if (e.key === 'Enter') commitRename();
                if (e.key === 'Escape') setEditingIndex(null);
              }}
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <span className="truncate max-w-24">{canvas.name}</span>
          )}

          {canvases.length > 1 && editingIndex !== i && (
            <Tooltip content="Remove this strategy">
              <button
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded-sm text-[var(--dossier-bone-muted)] hover:text-[var(--dossier-crimson)] hover:bg-[var(--dossier-ink)] transition-opacity"
                onClick={e => { e.stopPropagation(); onRemove(i); }}
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </Tooltip>
          )}
        </div>
      ))}

      {canvases.length < 10 && (
        <Tooltip content="Add a new strategy canvas">
          <button
            className="flex items-center justify-center w-6 h-6 rounded-sm text-[var(--dossier-bone-muted)] hover:text-[var(--dossier-bone)] hover:bg-[var(--dossier-ink)] transition-colors"
            onClick={onAdd}
          >
            <PlusIcon className="w-3.5 h-3.5" />
          </button>
        </Tooltip>
      )}
    </div>
  );
}
