import { useState, useMemo } from 'react';
import { formatNumber } from '../../../utils/formatters';
import ClassIcon from './ClassIcon';
import Tooltip from './Tooltip';

export default function SortableTable({ columns, data, onPlayerClick, badges }) {
  const [sortKey, setSortKey] = useState(null);
  const [sortAsc, setSortAsc] = useState(false);

  function handleSort(key) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  }

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'string') {
        return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortAsc ? av - bv : bv - av;
    });
  }, [data, sortKey, sortAsc]);

  return (
    <div className="relative rounded-sm border border-[var(--dossier-line)] bg-[var(--dossier-ink-2)]">
      <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[var(--dossier-ink)] border-b border-[var(--dossier-line)]">
            <th className="px-2 sm:px-3 py-3 text-left text-[var(--dossier-bone-muted)] text-[10px] uppercase tracking-[0.18em] font-semibold w-8">#</th>
            {columns.map(col => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key)}
                className={`px-2 sm:px-3 py-3 text-[10px] uppercase tracking-[0.18em] font-semibold cursor-pointer hover:text-[var(--dossier-amber)] transition-colors select-none ${
                  col.align === 'left' ? 'text-left' : 'text-right'
                } ${sortKey === col.key ? 'text-[var(--dossier-amber)]' : 'text-[var(--dossier-bone-muted)]'}${
                  col.hideOnMobile ? ' hidden sm:table-cell' : ''
                }`}
              >
                <span className="inline-flex items-center gap-1">
                  {col.mobileLabel ? (
                    <>
                      <span className="sm:hidden">{col.mobileLabel}</span>
                      <span className="hidden sm:inline">{col.label}</span>
                    </>
                  ) : col.label}
                  {sortKey === col.key && (
                    <span className="text-[10px]">{sortAsc ? '\u25B2' : '\u25BC'}</span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr
              key={row.name}
              className="border-b border-[var(--dossier-line)] last:border-b-0 hover:bg-[var(--dossier-ink)] transition-colors"
            >
              <td className="px-2 sm:px-3 py-2.5 text-[var(--dossier-bone-muted)] tabular-nums text-xs">{i + 1}</td>
              {columns.map(col => (
                <td
                  key={col.key}
                  className={`px-2 sm:px-3 py-2.5 text-[var(--dossier-bone)] ${col.align === 'left' ? 'text-left' : 'text-right'} ${
                    col.key === 'name' ? '' : 'tabular-nums'
                  }${col.hideOnMobile ? ' hidden sm:table-cell' : ''}`}
                >
                  {col.key === 'name' ? (
                    <span className="inline-flex items-center gap-1.5 flex-wrap">
                      <ClassIcon playerName={row.name} size={16} />
                      <button
                        onClick={() => onPlayerClick(row.name)}
                        className="text-[var(--dossier-bone)] hover:text-[var(--dossier-amber)] hover:underline transition-colors font-semibold cursor-pointer bg-transparent border-none p-0 text-sm text-left"
                      >
                        {row.name}
                      </button>
                      {badges?.[row.name]?.map(b => (
                        <Tooltip key={b.label} content={b.description}>
                          <span
                            className={`${b.bg} ${b.text} text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border border-current/20 cursor-help`}
                            style={{ boxShadow: b.glow }}
                            tabIndex={0}
                          >
                            {b.shortLabel && <span className="sm:hidden">{b.shortLabel}</span>}
                            <span className={b.shortLabel ? 'hidden sm:inline' : ''}>{b.label}</span>
                          </span>
                        </Tooltip>
                      ))}
                    </span>
                  ) : col.format ? (
                    col.format(row[col.key])
                  ) : typeof row[col.key] === 'number' ? (
                    formatNumber(row[col.key])
                  ) : (
                    row[col.key]
                  )}
                </td>
              ))}
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={columns.length + 1} className="px-3 py-8 text-center text-[var(--dossier-bone-muted)]">
                No players found
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
      <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[var(--dossier-ink)] to-transparent pointer-events-none sm:hidden rounded-r-sm" />
    </div>
  );
}
