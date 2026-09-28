import { useState, useMemo } from 'react';
import TabBar from '../TabBar';
import CalendarGrid from '../matches/CalendarGrid';
import MatchDetail from '../matches/MatchDetail';
import WarOverviewPage from './WarOverviewPage';
import { getMatchDates, getMatchesByDate } from '../../data/dataUtils';

const tabs = [
  { key: 'log', label: 'Match Log' },
  { key: 'war', label: 'War Stats' },
];

function MatchLog({ onPlayerClick }) {
  const matchDates = useMemo(() => getMatchDates(), []);

  const defaultDate = useMemo(() => {
    const sorted = [...matchDates].sort().reverse();
    return sorted[0] || null;
  }, [matchDates]);

  const [selectedDate, setSelectedDate] = useState(defaultDate);

  const initialDate = defaultDate ? defaultDate.split('/') : null;
  const [calendarYear, setCalendarYear] = useState(initialDate ? parseInt(initialDate[0]) : new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(initialDate ? parseInt(initialDate[1]) - 1 : new Date().getMonth());

  const matches = useMemo(() => {
    if (!selectedDate) return [];
    return [...getMatchesByDate(selectedDate)].reverse();
  }, [selectedDate]);

  function handleMonthChange(year, month) {
    setCalendarYear(year);
    setCalendarMonth(month);
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="lg:w-72 shrink-0">
        <div className="lg:sticky lg:top-6 bg-[var(--dossier-ink-2)] border border-[var(--dossier-line)] rounded-sm p-3 sm:p-4">
          <CalendarGrid
            year={calendarYear}
            month={calendarMonth}
            onMonthChange={handleMonthChange}
            matchDates={matchDates}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </div>
      </div>

      <div className="flex-1 space-y-8">
        {selectedDate && matches.length > 0 ? (
          <>
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--dossier-bone)] tracking-tight">
                Matches on {selectedDate}
              </h2>
              <div className="text-xs text-[var(--dossier-bone-muted)]">
                {matches.length} {matches.length === 1 ? 'match' : 'matches'}
              </div>
            </div>
            {matches.map(m => (
              <MatchDetail
                key={m.gameNum}
                gameNum={m.gameNum}
                onPlayerClick={onPlayerClick}
              />
            ))}
          </>
        ) : (
          <div className="text-center py-12 text-[var(--dossier-bone-muted)] bg-[var(--dossier-ink-2)] border border-[var(--dossier-line)] rounded-sm">
            Select a date with matches from the calendar
          </div>
        )}
      </div>
    </div>
  );
}

export default function MatchesPage({ onPlayerClick }) {
  const [activeTab, setActiveTab] = useState('log');

  return (
    <div>
      <TabBar tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div key={activeTab} className="animate-fade-in">
        {activeTab === 'log' && (
          <MatchLog onPlayerClick={onPlayerClick} />
        )}
        {activeTab === 'war' && (
          <WarOverviewPage embedded />
        )}
      </div>
    </div>
  );
}
