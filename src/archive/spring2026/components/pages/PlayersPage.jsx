import { useState } from 'react';
import TabBar from '../TabBar';
import TeamPage from './TeamPage';
import AllPlayersTable from '../AllPlayersTable';

const tabs = [
  { key: 'stats', label: 'Stats Table' },
  { key: 'roster', label: 'Roster' },
];

export default function PlayersPage({ onPlayerClick }) {
  const [activeTab, setActiveTab] = useState('stats');

  return (
    <div>
      <TabBar tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div key={activeTab} className="animate-fade-in">
        {activeTab === 'roster' && (
          <TeamPage onPlayerClick={onPlayerClick} embedded />
        )}
        {activeTab === 'stats' && (
          <AllPlayersTable onPlayerClick={onPlayerClick} />
        )}
      </div>
    </div>
  );
}
