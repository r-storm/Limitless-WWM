import { useState, useEffect } from 'react';
import TopBar from './components/layout/TopBar';

import PlannerPage from './components/pages/PlannerPage';
import RulesPage from './components/pages/RulesPage';
import ArchivePage from './components/pages/ArchivePage';
import HeroPage from './components/pages/HeroPage';
import PlayerModal from './components/PlayerModal';
import SearchPalette from './components/SearchPalette';

function App() {
  const [currentPage, setCurrentPage] = useState('archive');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showHero, setShowHero] = useState(true);
  const [heroExiting, setHeroExiting] = useState(false);

  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  function handleEnterDashboard() {
    setHeroExiting(true);
  }

  function handleHeroAnimationEnd(e) {
    if (e.animationName === 'hero-exit') {
      setShowHero(false);
    }
  }

  if (showHero) {
    return (
      <div onAnimationEnd={handleHeroAnimationEnd}>
        <HeroPage exiting={heroExiting} onEnter={handleEnterDashboard} />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-[var(--color-bg-base)] animate-dashboard-enter">
      <TopBar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onSearchClick={() => setSearchOpen(true)}
      />

      <main className="flex-1 min-w-0 overflow-y-auto dossier-topo dossier-grain">
        {currentPage === 'planner' ? (
          <PlannerPage />
        ) : (
          <div className="px-4 py-6 sm:px-8 sm:py-8 lg:px-10">
            {currentPage === 'archive' && (
              <ArchivePage />
            )}
            {currentPage === 'rules' && (
              <RulesPage />
            )}
          </div>
        )}
      </main>

      <SearchPalette
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onPlayerSelect={setSelectedPlayer}
      />

      {selectedPlayer && (
        <PlayerModal
          playerName={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </div>
  );
}

export default App;
