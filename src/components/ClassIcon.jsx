import DPSIcon from '../assets/DPSIcon.png';
import HealerIcon from '../assets/HealerIcon.png';
import TankIcon from '../assets/TankIcon.png';
import { playerClasses } from '../data/gameDefinitions';

const iconMap = { DPS: DPSIcon, Heal: HealerIcon, Tank: TankIcon };

export default function ClassIcon({ playerName, size = 16 }) {
  const classes = playerClasses[playerName];
  if (!classes) return null;
  return (
    <>
      {classes.map(cls => (
        <img key={cls} src={iconMap[cls]} alt={cls} width={size} height={size} className="inline-block" />
      ))}
    </>
  );
}
