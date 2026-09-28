import classNames from '../../../utils/classNames';

export default function TabBar({ tabs, activeTab, onChange }) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-[var(--dossier-line)] scrollbar-none mb-6">
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={classNames(
            'px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer -mb-px',
            activeTab === tab.key
              ? 'text-[var(--dossier-amber)] border-b-2 border-[var(--dossier-amber)]'
              : 'text-[var(--dossier-bone-muted)] border-b-2 border-transparent hover:text-[var(--dossier-bone)]',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
