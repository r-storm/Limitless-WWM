import { useState, useMemo } from 'react';
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions, Dialog, DialogPanel, DialogBackdrop } from '@headlessui/react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { getAllPlayers } from '../data/dataUtils';
import ClassIcon from './ClassIcon';

export default function SearchPalette({ open, onClose, onPlayerSelect }) {
  const [query, setQuery] = useState('');
  const allPlayers = useMemo(() => getAllPlayers(), []);

  const filtered = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return allPlayers.filter(p => p.name.toLowerCase().includes(q));
  }, [allPlayers, query]);

  function handleSelect(player) {
    if (!player) return;
    onPlayerSelect(player.name);
    handleClose();
  }

  function handleClose() {
    onClose();
    setQuery('');
  }

  return (
    <Dialog open={open} onClose={handleClose} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="fixed inset-0 flex justify-center px-4 pt-[20vh]">
        <DialogPanel className="w-full max-w-lg h-fit">
          <Combobox onChange={handleSelect}>
            <div className="glass-strong rounded-xl border border-[var(--color-border)] shadow-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-4 border-b border-[var(--color-border)]">
                <MagnifyingGlassIcon className="h-5 w-5 text-[var(--color-text-muted)] shrink-0" />
                <ComboboxInput
                  autoFocus
                  placeholder="Search players..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="w-full bg-transparent py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none"
                />
                <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-1.5 py-0.5 text-[10px] font-mono text-[var(--color-text-muted)]">
                  ESC
                </kbd>
              </div>

              <ComboboxOptions static className="max-h-72 overflow-y-auto py-1">
                {query && filtered.length === 0 && (
                  <div className="px-4 py-6 text-center text-sm text-[var(--color-text-muted)]">
                    No players found
                  </div>
                )}
                {filtered.map(player => (
                  <ComboboxOption
                    key={player.name}
                    value={player}
                    className="flex items-center gap-3 px-4 py-2.5 cursor-pointer data-[focus]:bg-cyan-500/10 transition-colors"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-white font-bold text-xs shrink-0">
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    <ClassIcon playerName={player.name} size={16} />
                    <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                      {player.name}
                    </span>
                    <span className="ml-auto text-xs text-[var(--color-text-muted)] shrink-0">
                      {player.games_played} {player.games_played === 1 ? 'match' : 'matches'}
                    </span>
                  </ComboboxOption>
                ))}
                {!query && (
                  <div className="px-4 py-6 text-center text-sm text-[var(--color-text-muted)]">
                    Type to search players...
                  </div>
                )}
              </ComboboxOptions>
            </div>
          </Combobox>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
