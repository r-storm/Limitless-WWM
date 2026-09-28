import { useState, useEffect, useRef, useLayoutEffect, useMemo } from 'react';
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  XMarkIcon,
  MapIcon,
  BookOpenIcon,
  ArchiveBoxIcon,
} from '@heroicons/react/24/outline';
import classNames from '../../utils/classNames';
import { getWarDays } from '../../data/dataUtils';
import Tooltip from '../Tooltip';

const navigation = [
  { name: 'Archive', key: 'archive', icon: ArchiveBoxIcon },
  { name: 'Planner', key: 'planner', icon: MapIcon },
  { name: 'Rules', key: 'rules', icon: BookOpenIcon },
];

export default function TopBar({ currentPage, onNavigate, onSearchClick }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false });
  const headerRef = useRef(null);
  const itemRefs = useRef({});

  const dataStatus = useMemo(() => {
    const days = getWarDays();
    if (days.length === 0) return { label: '', isStale: true, latestStr: null };
    const latest = days[days.length - 1]; // "YYYY/MM/DD"
    const [y, m, d] = latest.split('/').map(Number);
    const latestDate = new Date(y, m - 1, d);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    latestDate.setHours(0, 0, 0, 0);
    const daysSince = Math.round((today - latestDate) / (24 * 60 * 60 * 1000));
    const label = latestDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    return {
      label,
      isStale: daysSince > 7,
      daysSince,
    };
  }, []);

  useLayoutEffect(() => {
    function recalc() {
      const el = itemRefs.current[currentPage];
      const header = headerRef.current;
      if (!el || !header) return;
      const headerRect = header.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      setIndicator({
        left: elRect.left - headerRect.left,
        width: elRect.width,
        ready: true,
      });
    }
    recalc();
    window.addEventListener('resize', recalc);
    return () => window.removeEventListener('resize', recalc);
  }, [currentPage]);

  useEffect(() => {
    if (!mobileOpen) return;
    function onKey(e) {
      if (e.key === 'Escape') setMobileOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-30 border-b border-[var(--color-border)] glass-floating"
    >
      {/* Hairline accent at the very top edge */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

      <div className="flex h-14 items-center gap-4 px-4 sm:px-6">
        {/* Brand */}
        <button
          onClick={() => onNavigate('archive')}
          className="flex items-center cursor-pointer group"
        >
          <span className="text-sm font-bold tracking-tight text-[var(--dossier-bone)] group-hover:text-[var(--dossier-amber)] transition-colors">
            Limitless
          </span>
        </button>

        {/* Divider */}
        <div className="hidden lg:block h-6 w-px bg-[var(--color-border)]" />

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navigation.map(item => {
            const active = currentPage === item.key;
            return (
              <button
                key={item.key}
                ref={el => { itemRefs.current[item.key] = el; }}
                onClick={() => onNavigate(item.key)}
                className={classNames(
                  'relative px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] rounded transition-colors cursor-pointer',
                  active
                    ? 'text-white'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                )}
              >
                {item.name}
              </button>
            );
          })}
        </nav>

        <div className="flex-1" />

        {/* Discord */}
        <Tooltip content="Join our Discord server" placement="bottom">
          <a
            href="https://discord.gg/Vgqtd4qrKY"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--dossier-bone-muted)] border border-[var(--dossier-line)] rounded-sm bg-[var(--dossier-ink-2)] hover:text-[var(--dossier-amber)] hover:border-[var(--dossier-amber)] transition-colors"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path d="M20.317 4.369a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037 13.79 13.79 0 0 0-.608 1.247 18.27 18.27 0 0 0-5.487 0 12.62 12.62 0 0 0-.617-1.247.077.077 0 0 0-.079-.037 19.74 19.74 0 0 0-4.885 1.515.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.461-.63.873-1.295 1.226-1.994a.076.076 0 0 0-.041-.105 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.371-.292a.074.074 0 0 1 .078-.01c3.927 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.009c.12.099.246.198.372.293a.077.077 0 0 1-.006.127c-.598.349-1.225.645-1.873.892a.076.076 0 0 0-.04.105c.36.7.772 1.364 1.225 1.994a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .031-.055c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 0 0-.031-.028zM8.02 15.331c-1.183 0-2.157-1.085-2.157-2.418 0-1.333.956-2.419 2.157-2.419 1.211 0 2.176 1.095 2.157 2.419 0 1.333-.955 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.418 0-1.333.955-2.419 2.157-2.419 1.211 0 2.176 1.095 2.157 2.419 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
            <span className="hidden lg:inline">Join Discord</span>
          </a>
        </Tooltip>

        {/* Search (desktop) */}
        <button
          onClick={onSearchClick}
          className="hidden sm:flex relative w-56 lg:w-64 items-center gap-2 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)] py-1.5 px-3 text-sm text-[var(--color-text-muted)] hover:border-cyan-400/40 transition-colors cursor-pointer text-left"
        >
          <MagnifyingGlassIcon className="h-4 w-4 shrink-0" />
          <span className="flex-1 truncate">Search players...</span>
          <kbd className="hidden md:inline-flex items-center gap-0.5 rounded border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-1.5 py-0.5 text-[10px] font-mono">
            Ctrl K
          </kbd>
        </button>

        {/* Search (mobile icon) */}
        <button
          onClick={onSearchClick}
          aria-label="Search"
          className="sm:hidden -m-2 p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] cursor-pointer"
        >
          <MagnifyingGlassIcon className="h-5 w-5" />
        </button>

        {/* Last updated with live indicator */}
        {dataStatus.label && (
          <Tooltip
            placement="bottom"
            content={dataStatus.isStale
              ? `Last match was ${dataStatus.daysSince} days ago - data may be stale`
              : `Last match: ${dataStatus.daysSince} ${dataStatus.daysSince === 1 ? 'day' : 'days'} ago`}
          >
            <div className="hidden md:flex items-center gap-2 text-[11px] text-[var(--dossier-bone-muted)] tabular-nums whitespace-nowrap">
              <span className="relative flex h-2 w-2 shrink-0">
                {!dataStatus.isStale && (
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--dossier-sage)] opacity-60 animate-ping" />
                )}
                <span
                  className={classNames(
                    'relative inline-flex h-2 w-2 rounded-full',
                    dataStatus.isStale ? 'bg-[var(--dossier-crimson)]' : 'bg-[var(--dossier-sage)]',
                  )}
                  style={{
                    boxShadow: dataStatus.isStale
                      ? '0 0 8px rgba(248,113,113,0.6)'
                      : '0 0 8px rgba(74,222,128,0.7)',
                  }}
                />
              </span>
              <span>Updated {dataStatus.label}</span>
            </div>
          </Tooltip>
        )}

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileOpen(o => !o)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          className="lg:hidden -m-2 p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] cursor-pointer"
        >
          {mobileOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>
      </div>

      {/* Sliding active-page indicator (desktop) */}
      <div
        aria-hidden="true"
        className={classNames(
          'pointer-events-none absolute bottom-0 hidden lg:block h-[2px] bg-gradient-to-r from-cyan-400 via-cyan-300 to-sky-500 shadow-[0_0_10px_rgba(34,211,238,0.5)] transition-all duration-300 ease-out',
          indicator.ready ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          left: `${indicator.left}px`,
          width: `${indicator.width}px`,
        }}
      />

      {/* Mobile dropdown panel */}
      <div
        className={classNames(
          'lg:hidden overflow-hidden border-[var(--color-border)] transition-[max-height,opacity] duration-300 ease-out',
          mobileOpen ? 'max-h-[28rem] opacity-100 border-t' : 'max-h-0 opacity-0 border-t-0'
        )}
      >
        <nav className="flex flex-col gap-1 p-3">
          {navigation.map(item => {
            const Icon = item.icon;
            const active = currentPage === item.key;
            return (
              <button
                key={item.key}
                onClick={() => { onNavigate(item.key); setMobileOpen(false); }}
                className={classNames(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all cursor-pointer',
                  active
                    ? 'bg-gradient-to-r from-cyan-500/15 to-sky-500/10 ring-1 ring-cyan-500/20 text-cyan-300'
                    : 'text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-[var(--color-text-primary)]',
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {item.name}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
