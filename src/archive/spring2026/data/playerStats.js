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

function buildPlayerStats(days) {
  const merged = {};
  for (const day of days) {
    for (const [name, games] of Object.entries(day.players)) {
      if (!merged[name]) {
        merged[name] = { name, games: [] };
      }
      merged[name].games.push(...games);
    }
  }
  for (const player of Object.values(merged)) {
    player.games = player.games.filter(g =>
      g.defeated !== 0 || g.assist !== 0 || g.deaths !== 0 ||
      g.damage !== 0 || g.tank !== 0 || g.heal !== 0 || g.siege_damage !== 0
    );
    const countedGames = player.games.filter(g => !g.exclude_from_totals);
    if (player.games.length === 0) {
      delete merged[player.name];
      continue;
    }
    player.games.sort((a, b) => a.game_num - b.game_num);
    player.total_damage = countedGames.reduce((s, g) => s + g.damage, 0);
    player.total_defeats = countedGames.reduce((s, g) => s + g.defeated, 0);
    player.total_assists = countedGames.reduce((s, g) => s + g.assist, 0);
    player.total_deaths = countedGames.reduce((s, g) => s + g.deaths, 0);
    player.total_heal = countedGames.reduce((s, g) => s + g.heal, 0);
    player.total_tank = countedGames.reduce((s, g) => s + g.tank, 0);
    player.total_siege = countedGames.reduce((s, g) => s + g.siege_damage, 0);
    player.games_played = countedGames.length;
  }
  return merged;
}

export const playerStats = buildPlayerStats(allDays);
