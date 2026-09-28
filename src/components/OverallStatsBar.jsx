import {
  TrophyIcon,
  BoltIcon,
  FireIcon,
  HeartIcon,
  ScaleIcon,
} from '@heroicons/react/24/outline';
import StatCard from './StatCard';
import { getOverallStats } from '../data/dataUtils';

export default function OverallStatsBar() {
  const stats = getOverallStats();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      <StatCard label="Record" mobileLabel="Record" value={`${stats.wins}W - ${stats.losses}L (${stats.totalGames})`} numeric={false} icon={TrophyIcon} accent="amber" />
      <StatCard label="Win Rate" mobileLabel="Win Rate" value={`${stats.winRate}%`} numeric={false} icon={BoltIcon} accent="green" />
      <StatCard label="Avg Team Damage" mobileLabel="Avg Damage" value={stats.avgDamage} icon={FireIcon} accent="red" />
      <StatCard label="Avg Team Healing" mobileLabel="Avg Healing" value={stats.avgHealing} icon={HeartIcon} accent="green" />
      <StatCard label="Team KDA" mobileLabel="Team KDA" value={stats.teamKDA} numeric={false} icon={ScaleIcon} accent="violet" />
    </div>
  );
}
