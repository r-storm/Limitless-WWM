import * as day0214 from './days/2026-02-14.js';
import * as day0215 from './days/2026-02-15.js';
import * as day0221 from './days/2026-02-21.js';
import * as day0222 from './days/2026-02-22.js';
import * as day0228 from './days/2026-02-28.js';
import * as day0301 from './days/2026-03-01.js';
import * as day0307 from './days/2026-03-07.js';
import * as day0308 from './days/2026-03-08.js';
import * as day0314 from './days/2026-03-14.js';
import * as day0315 from './days/2026-03-15.js';
import * as day0321 from './days/2026-03-21.js';
import * as day0322 from './days/2026-03-22.js';
import * as day0328 from './days/2026-03-28.js';
import * as day0329 from './days/2026-03-29.js';
import * as day0404 from './days/2026-04-04.js';
import * as day0405 from './days/2026-04-05.js';
import * as day0411 from './days/2026-04-11.js';
import * as day0412 from './days/2026-04-12.js';
import * as day0418 from './days/2026-04-18.js';
import * as day0419 from './days/2026-04-19.js';
import * as day0425 from './days/2026-04-25.js';
import * as day0426 from './days/2026-04-26.js';
import * as day0502 from './days/2026-05-02.js';
import * as day0503 from './days/2026-05-03.js';
import * as day0509 from './days/2026-05-09.js';
import * as day0510 from './days/2026-05-10.js';

const allDays = [day0214, day0215, day0221, day0222, day0228, day0301, day0307, day0308, day0314, day0315, day0321, day0322, day0328, day0329, day0404, day0405, day0411, day0412, day0418, day0419, day0425, day0426, day0502, day0503, day0509, day0510];

export const gameDefinitions = allDays.flatMap(d => d.games);

export const formerMembers = new Set([
  'Player A',
  'Player B',
  'Player C',
  'Player D',
  'Player E',
  'Player F',
  'Player G',
  'Player H',
  'Player I',
  'Player J',
  'Player K',
  'Player L',
  'Player M',
  'Player N',
  'General-Hei',
  'Somaaaaaa',
  'SagedPotato',
  'Heifeng-Jian',
]);

export const playerClasses = {
  'AsterBlaze': ['DPS'],
  'Autumntea': ['DPS'],
  'AznMuffin': ['Heal'],
  'Azeltan': ['Tank'],
  'AzraelVoidborn': ['DPS', 'Heal'],
  'BaeYuekui': ['Heal'],
  'bbeast': ['DPS'],
  'CyrillaUna': ['Tank'],
  'Destrozz': ['DPS'],
  'Diabolical-': ['DPS'],
  'Erindera': ['DPS'],
  'Eyhem': ['DPS'],
  'StormFengbao': ['Tank'],
  'Heifeng-Jian': ['Tank', 'DPS'],
  'JyC': ['DPS', 'Tank'],
  'FullmetalFork': ['DPS'],
  'Kalecgooos': ['Tank'],
  'Kay\u00f6ko': ['Heal'],
  'LadyDEAD': ['Heal'],
  'LabubuSparrow': ['DPS', 'Heal'],
  'Linsun': ['DPS'],
  'LorienBlade': ['DPS'],
  'Malfuras': ['DPS'],
  'Markiemarc': ['DPS'],
  'OGMX': ['DPS'],
  'OgNick': ['DPS'],
  'Player A': ['DPS'],
  'Player B': ['DPS'],
  'Player C': ['Heal'],
  'Player D': ['DPS'],
  'Player E': ['DPS'],
  'Player F': ['Tank'],
  'Player G': ['DPS'],
  'Player H': ['DPS'],
  'Player I': ['DPS', 'Heal'],
  'Player J': ['DPS'],
  'Player K': ['Tank', 'DPS'],
  'Player L': ['DPS'],
  'Player M': ['DPS', 'Heal'],
  'Quingqi': ['DPS'],
  'Reinoch': ['DPS'],
  'Rensune': ['Heal'],
  'SilentReign': ['DPS'],
  'Sisera': ['Heal'],
  'solyre': ['DPS'],
  'Splyced': ['DPS'],
  'Sudavilla': ['DPS', 'Heal'],
  'Sweara': ['Heal'],
  'TheFinalUchiha': ['DPS'],
  'Tuesday\u2014Night': ['Tank', 'Heal'],
  'Vatonic': ['DPS'],
  'VenDREAD': ['DPS'],
  'WisteriaMoon': ['Heal'],
  'Xania': ['Heal'],
  '\u30c4Meliodas': ['DPS'],
  'T\u00e8mp\u00e9st': ['DPS'],
  'Xioliza': ['Heal'],
  'Y\u00fanxiang': ['Heal'],
  'YueZangTu': ['Tank'],
  'Yurashi-den': ['DPS'],
  'Zatttt': ['DPS'],
  'Zhphy': ['DPS'],
  'Segmented': ['Tank'],
  'Svalan': ['DPS', 'Tank'],
  'TrulyScrumpshus': ['Heal'],
  'YingjunDe': ['Tank'],
  'Y\u00f9xu\u00e2n': ['DPS'],
  'Rielma': ['Heal'],
  '\u00c6thereal': ['Heal', 'DPS'],
  'AcidDeath': ['DPS'],
  'EV\u00d8': ['DPS'],
  'Enyyo': ['Heal'],
  'GuardianEnds': ['DPS'],
  'MightyHive': ['DPS'],
  'Nightbloom': ['Tank'],
  'bubsa': ['DPS'],
  'hazy': ['DPS', 'Heal'],
  'Reqless': ['DPS'],
  'RØYAL': ['Tank'],
  'Kāi': ['DPS'],
  'dmp': ['DPS'],
  'zzzehra': ['Heal'],
  'Azrielxx': ['DPS'],
  'Poisonwind': ['DPS'],
  'Venustas': ['Heal'],
  '壮Lotus': ['DPS'],
  'Bůññy': ['DPS'],
  'izofizo': ['Heal'],
  'FeEdAcLe': ['DPS'],
  'LiiShen': ['DPS'],
  'Beady': ['DPS', 'Heal'],
  'ItzAlex': ['DPS'],
  'KnightRiku': ['DPS'],
  'GinnyEve': ['Heal'],
  'FanLingXiu': ['DPS'],
};
