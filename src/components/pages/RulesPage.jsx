import {
  ClockIcon,
  TrophyIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  TableCellsIcon,
} from '@heroicons/react/24/outline';

const sections = [
  {
    title: 'Format',
    icon: ClockIcon,
    items: [
      { label: 'Battle Size', text: '30v30 guild battles' },
      { label: 'Time Limit', text: '30-minute match + 5-minute prep phase' },
      { label: 'Schedule', text: 'Every Saturday and Sunday at 20:30 (battlegroup timezone)' },
      { label: 'Match Types', text: 'League (scheduled group matches) and Ranked (queue-based matchmaking)' },
      { label: 'League Seasons', text: 'Prep Phase (1 week) \u2192 Placement Matches (3 weeks) \u2192 Regular Season (8 weeks)' },
      { label: 'Groups', text: 'Jesting Sage, Jesting God, Jesting Hero, Stealth Jester \u2014 top 4 promote, bottom 4 demote each round' },
    ],
  },
  {
    title: 'Win Conditions',
    icon: TrophyIcon,
    description: 'Checked in priority order. The first condition that distinguishes the teams determines the winner.',
    items: [
      { label: '1. Tree Delivered', text: 'Deliver the enemy\u2019s Fortune Tree to your base for an instant win' },
      { label: '2. Tree Distance', text: 'Whichever team moved the tree further wins' },
      { label: '3. Guardian Goose HP', text: 'If neither tree was moved, the team whose Goose has more HP remaining wins' },
      { label: '4. Bulwarks', text: 'Compare remaining Bulwark count, then remaining Bulwark HP' },
    ],
  },
  {
    title: 'Key Mechanics',
    icon: ShieldCheckIcon,
    items: [
      { label: 'Fortune Tree', text: 'Can only be moved after killing the Guardian Goose. Movement slows with nearby enemies; stops entirely with 5+ enemies nearby' },
      { label: 'Guardian Goose', text: 'Must be defeated before the Fortune Tree can be moved. Guild Techniques and Command Skills deal massive damage to it' },
      { label: 'Bulwarks', text: 'Defensive towers on three lanes. Up to 3 defenders each. Surviving Bulwarks generate Fun Coins every 30s. Nearby allies grant damage reduction to the Bulwark' },
      { label: 'Healing Reduction', text: 'Healing reduced by 30% in Guild War. Potion recovery reduced by 60%' },
      { label: 'Inactivity', text: 'Players are removed after 3 minutes of inactivity' },
    ],
  },
  {
    title: 'Roles',
    icon: UserGroupIcon,
    items: [
      { label: 'Commander', text: 'Guild Leader/Deputies by default. Can use Command Skills, purchase battlefield items, and assign Bulwark defenders' },
      { label: 'Halftime Performer', text: '4 members selected for 1v1 duels during the match. Winning grants team-wide buffs' },
    ],
  },
];

const glossary = [
  { field: 'our_fortune_tree_m / enemy_fortune_tree_m', description: 'Distance (meters) the tree was moved toward the enemy base. ~465\u2013471m = fully delivered' },
  { field: 'our_guardian_goose_hp_pct', description: 'Remaining Goose HP %. 0% = Goose was killed' },
  { field: 'our_bulwark_remaining', description: 'Number of surviving Bulwarks (max 3 per side)' },
  { field: 'our_kills / enemy_kills', description: 'Total player kills by each side' },
  { field: 'our_fun_coins / enemy_fun_coins', description: 'Currency earned from Bulwarks, kills, and monsters' },
  { field: 'points_gained', description: 'Ranked points earned. Typically 40 for a win, 15 for a loss, 0 for league losses' },
  { field: 'defeated', description: 'Player kills (per-player stat)' },
  { field: 'assist', description: 'Assists (per-player stat)' },
  { field: 'damage', description: 'Player damage dealt' },
  { field: 'tank', description: 'Damage mitigated' },
  { field: 'heal', description: 'Healing done' },
  { field: 'siege_damage', description: 'Damage to objectives (Goose, Bulwarks)' },
];

export default function RulesPage() {
  return (
    <div className="space-y-10">
      {sections.map(section => {
        const Icon = section.icon;
        return (
          <section key={section.title}>
            <div className="flex items-end justify-between gap-4 mb-4 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--dossier-bone)] tracking-tight flex items-center gap-2.5">
                <Icon className="h-5 w-5 text-[var(--dossier-amber)]" />
                {section.title}
              </h2>
              {section.description && (
                <p className="text-xs text-[var(--dossier-bone-muted)] max-w-md">{section.description}</p>
              )}
            </div>
            <div className="bg-[var(--dossier-ink-2)] border border-[var(--dossier-line)] rounded-sm divide-y divide-[var(--dossier-line)]">
              {section.items.map(item => (
                <div key={item.label} className="flex flex-col sm:flex-row sm:gap-5 px-5 py-4">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--dossier-amber)] sm:w-44 shrink-0 mb-1 sm:mb-0 sm:pt-0.5">
                    {item.label}
                  </dt>
                  <dd className="text-sm text-[var(--dossier-bone-soft)] leading-relaxed">
                    {item.text}
                  </dd>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {/* Data Field Glossary */}
      <section>
        <div className="flex items-end justify-between gap-4 mb-4 flex-wrap">
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--dossier-bone)] tracking-tight flex items-center gap-2.5">
            <TableCellsIcon className="h-5 w-5 text-[var(--dossier-amber)]" />
            Data Field Glossary
          </h2>
          <div className="text-xs text-[var(--dossier-bone-muted)]">{glossary.length} fields</div>
        </div>
        <div className="bg-[var(--dossier-ink-2)] border border-[var(--dossier-line)] rounded-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--dossier-ink)] border-b border-[var(--dossier-line)]">
                <th className="text-left px-5 py-3 text-[10px] uppercase tracking-[0.18em] font-semibold text-[var(--dossier-bone-muted)]">Field</th>
                <th className="text-left px-5 py-3 text-[10px] uppercase tracking-[0.18em] font-semibold text-[var(--dossier-bone-muted)]">Description</th>
              </tr>
            </thead>
            <tbody>
              {glossary.map((row, i) => (
                <tr
                  key={row.field}
                  className={i < glossary.length - 1 ? 'border-b border-[var(--dossier-line)]' : ''}
                >
                  <td className="px-5 py-2.5 text-[var(--dossier-amber)] font-mono text-xs whitespace-nowrap align-top">
                    {row.field}
                  </td>
                  <td className="px-5 py-2.5 text-[var(--dossier-bone-soft)]">
                    {row.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
