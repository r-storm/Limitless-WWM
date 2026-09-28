import { playerStats } from './playerStats';
import { gameDefinitions, formerMembers, playerClasses } from './gameDefinitions';


function allPlayersUnfiltered() {
  return Object.values(playerStats);
}

export function getAllPlayers() {
  return allPlayersUnfiltered().filter(p => !formerMembers.has(p.name));
}

export function getGamePlayers(gameNum) {
  return allPlayersUnfiltered()
    .filter(p => p.games.some(g => g.game_num === gameNum))
    .map(p => {
      const game = p.games.find(g => g.game_num === gameNum);
      return { name: p.name, ...game };
    });
}

export function getGameSummary(gameNum) {
  const def = gameDefinitions.find(g => g.gameNum === gameNum);
  const players = getGamePlayers(gameNum);
  const totalDamage = players.reduce((s, p) => s + p.damage, 0);
  const totalKills = players.reduce((s, p) => s + p.defeated, 0);
  const totalDeaths = players.reduce((s, p) => s + p.deaths, 0);
  const totalHealing = players.reduce((s, p) => s + p.heal, 0);
  const totalSiege = players.reduce((s, p) => s + p.siege_damage, 0);
  const totalTank = players.reduce((s, p) => s + p.tank, 0);
  const killRatio = def.our_kills != null
    ? (def.our_kills / Math.max(def.enemy_kills || 0, 1)).toFixed(2)
    : null;
  return {
    ...def,
    playerCount: players.length,
    totalDamage,
    totalKills,
    totalDeaths,
    totalHealing,
    totalSiege,
    totalTank,
    killRatio: killRatio != null ? +killRatio : null,
  };
}

export function getOverallStats() {
  const players = getAllPlayers();
  const totalGames = gameDefinitions.length;
  const wins = gameDefinitions.filter(g => g.result === 'win').length;
  const losses = totalGames - wins;
  const totalDamage = players.reduce((s, p) => s + p.total_damage, 0);
  const avgDamage = Math.round(totalDamage / totalGames);
  const totalHealing = players.reduce((s, p) => s + p.total_heal, 0);
  const avgHealing = Math.round(totalHealing / totalGames);
  const totalKills = players.reduce((s, p) => s + p.total_defeats, 0);
  const totalAssists = players.reduce((s, p) => s + p.total_assists, 0);
  const totalDeaths = players.reduce((s, p) => s + p.total_deaths, 0);
  const teamKDA = ((totalKills + totalAssists) / Math.max(totalDeaths, 1)).toFixed(2);
  const avgDeathsPerMatch = (totalDeaths / totalGames).toFixed(1);

  return {
    totalGames,
    wins,
    losses,
    winRate: ((wins / totalGames) * 100).toFixed(0),
    totalDamage,
    avgDamage,
    avgHealing,
    uniquePlayers: players.length,
    teamKDA,
    avgDeathsPerMatch,
  };
}

// Archive snapshot: "recent" windows are measured from the season's final war day
export const ARCHIVE_AS_OF = new Date(2026, 4, 10);

function getRecentDateCutoff(weeks = 4) {
  const now = new Date(ARCHIVE_AS_OF);
  now.setDate(now.getDate() - weeks * 7);
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}/${m}/${d}`;
}

function computeRecentStats(games) {
  const cutoff4w = getRecentDateCutoff(4);
  const cutoff2w = getRecentDateCutoff(2);
  const recent4w = games.filter(g => !g.exclude_from_totals && g.date >= cutoff4w);
  const recent2w = games.filter(g => !g.exclude_from_totals && g.date >= cutoff2w);
  return {
    recent_games_played: recent4w.length,
    recent_avg_damage: recent4w.length ? Math.round(recent4w.reduce((s, g) => s + g.damage, 0) / recent4w.length) : null,
    recent_2wk_games: recent2w.length,
    recent_2wk_avg_damage: recent2w.length ? Math.round(recent2w.reduce((s, g) => s + g.damage, 0) / recent2w.length) : null,
  };
}

function buildPlayerRow(name, games_played, totals, recentStats, lifetimeAvgDamage) {
  const gp = Math.max(games_played, 1);
  const kdaDeaths = Math.max(totals.total_deaths, 1);
  return {
    name,
    games_played,
    total_deaths: totals.total_deaths,
    avg_damage: Math.round(totals.total_damage / gp),
    avg_defeats: +(totals.total_defeats / gp).toFixed(1),
    avg_assists: +(totals.total_assists / gp).toFixed(1),
    avg_deaths: +(totals.total_deaths / gp).toFixed(1),
    avg_heal: Math.round(totals.total_heal / gp),
    avg_tank: Math.round(totals.total_tank / gp),
    avg_siege: Math.round(totals.total_siege / gp),
    kd: +(totals.total_defeats / kdaDeaths).toFixed(2),
    kda: +((totals.total_defeats + totals.total_assists) / kdaDeaths).toFixed(2),
    lifetime_avg_damage: lifetimeAvgDamage,
    recent_games_played: recentStats.recent_games_played,
    recent_avg_damage: recentStats.recent_avg_damage,
    recent_2wk_games: recentStats.recent_2wk_games,
    recent_2wk_avg_damage: recentStats.recent_2wk_avg_damage,
  };
}

export function getAllPlayersSorted(sortKey = 'avg_damage', ascending = false) {
  const players = getAllPlayers().map(p => {
    const lifetimeAvg = p.games_played > 0 ? Math.round(p.total_damage / p.games_played) : 0;
    return buildPlayerRow(
      p.name,
      p.games_played,
      {
        total_damage: p.total_damage,
        total_defeats: p.total_defeats,
        total_assists: p.total_assists,
        total_deaths: p.total_deaths,
        total_heal: p.total_heal,
        total_tank: p.total_tank,
        total_siege: p.total_siege,
      },
      computeRecentStats(p.games),
      lifetimeAvg,
    );
  });
  return players.sort((a, b) => ascending ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey]);
}

export function getPlayersSortedByDates(dateStrs, sortKey = 'avg_damage', ascending = false) {
  if (!dateStrs || dateStrs.length === 0) return getAllPlayersSorted(sortKey, ascending);
  const players = getAllPlayers()
    .map(p => {
      const filtered = p.games.filter(g =>
        !g.exclude_from_totals && dateStrs.some(d => g.date.startsWith(d))
      );
      if (filtered.length === 0) return null;
      const totals = {
        total_damage: filtered.reduce((s, g) => s + g.damage, 0),
        total_defeats: filtered.reduce((s, g) => s + g.defeated, 0),
        total_assists: filtered.reduce((s, g) => s + g.assist, 0),
        total_deaths: filtered.reduce((s, g) => s + g.deaths, 0),
        total_heal: filtered.reduce((s, g) => s + g.heal, 0),
        total_tank: filtered.reduce((s, g) => s + g.tank, 0),
        total_siege: filtered.reduce((s, g) => s + g.siege_damage, 0),
      };
      const lifetimeAvg = p.games_played > 0 ? Math.round(p.total_damage / p.games_played) : 0;
      return buildPlayerRow(p.name, filtered.length, totals, computeRecentStats(p.games), lifetimeAvg);
    })
    .filter(Boolean);
  return players.sort((a, b) => ascending ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey]);
}

export function getPlayerDetails(name) {
  return playerStats[name] || null;
}

export function getMatchDates() {
  const dates = new Set();
  gameDefinitions.forEach(g => dates.add(g.date.split(' ')[0]));
  return dates;
}

export function getMatchesByDate(dateStr) {
  return gameDefinitions.filter(g => g.date.startsWith(dateStr));
}

export function getAllGameSummaries() {
  return gameDefinitions
    .map(g => getGameSummary(g.gameNum))
    .sort((a, b) => a.gameNum - b.gameNum);
}

export function getPlayerGameDamage(name) {
  const player = playerStats[name];
  if (!player) return [];
  return [...player.games]
    .sort((a, b) => a.game_num - b.game_num)
    .map(g => g.damage);
}

export function getPlayerGameStat(name, stat) {
  const player = playerStats[name];
  if (!player) return [];
  return [...player.games]
    .sort((a, b) => a.game_num - b.game_num)
    .map(g => g[stat]);
}

// ─── Per-Player Efficiency Metrics ──────────────────────────────────

export function getPlayerKDA(name) {
  const p = playerStats[name];
  if (!p) return 0;
  return (p.total_defeats + p.total_assists) / Math.max(p.total_deaths, 1);
}

export function getPlayerDamagePerDeath(name) {
  const p = playerStats[name];
  if (!p) return 0;
  return Math.round(p.total_damage / Math.max(p.total_deaths, 1));
}

export function getPlayerKillParticipation(name) {
  const p = playerStats[name];
  if (!p) return 0;
  let totalRatio = 0;
  let counted = 0;
  for (const g of p.games) {
    const gamePlayers = getGamePlayers(g.game_num);
    const teamKills = gamePlayers.reduce((s, pl) => s + pl.defeated, 0);
    if (teamKills > 0) {
      totalRatio += (g.defeated + g.assist) / teamKills;
      counted++;
    }
  }
  return counted > 0 ? (totalRatio / counted) * 100 : 0;
}

// Floor: average of the player's worst 25% of matches on their role-relevant stat.
// Answers "what can my team count on from me on a bad day?" — a reliability stat
// that isn't penalised by upward improvement (unlike CV/consistency).
export function getPlayerFloorStat(name) {
  const p = playerStats[name];
  if (!p || p.games.length < 2) {
    return { floor: 0, mean: 0, ratio: 0, grade: null, stat: 'damage', statLabel: 'Damage' };
  }
  const roles = playerClasses[name] || [];
  const isHealer = roles.includes('Heal') && !roles.includes('DPS') && !roles.includes('Tank');
  let statKey = 'damage';
  let statLabel = 'Damage';
  if (isHealer && p.total_heal > 0) {
    statKey = 'heal';
    statLabel = 'Healing';
  }
  const values = p.games.map(g => g[statKey] || 0).sort((a, b) => a - b);
  const bottomCount = Math.max(1, Math.ceil(values.length * 0.25));
  const bottom = values.slice(0, bottomCount);
  const floor = bottom.reduce((s, v) => s + v, 0) / bottom.length;
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  const ratio = mean > 0 ? floor / mean : 0;
  // Grade by floor-to-mean ratio: how close is your bad day to your normal output?
  let grade = null;
  if (p.games_played >= 10) {
    if (ratio >= 0.7) grade = 'A';
    else if (ratio >= 0.55) grade = 'B';
    else if (ratio >= 0.4) grade = 'C';
    else grade = 'D';
  }
  return {
    floor: Math.round(floor),
    mean: Math.round(mean),
    ratio: +(ratio * 100).toFixed(0),
    grade,
    stat: statKey,
    statLabel,
    sampleSize: bottomCount,
  };
}

export function getPlayerKDAGrade(name) {
  const p = playerStats[name];
  if (!p || p.games_played < 10) return { value: null, grade: null };
  const kda = (p.total_defeats + p.total_assists) / Math.max(p.total_deaths, 1);
  let grade = 'D';
  if (kda >= 9) grade = 'A';
  else if (kda >= 6) grade = 'B';
  else if (kda >= 4) grade = 'C';
  return { value: +kda.toFixed(2), grade };
}

export function getPlayerSurvivabilityGrade(name) {
  const p = playerStats[name];
  if (!p || p.games_played < 10) return { value: null, grade: null };
  const avgDeaths = p.total_deaths / p.games_played;
  let grade = 'D';
  if (avgDeaths <= 3) grade = 'A';
  else if (avgDeaths <= 5) grade = 'B';
  else if (avgDeaths <= 7) grade = 'C';
  return { value: +avgDeaths.toFixed(1), grade };
}

export function getPlayerKillParticipationGrade(name) {
  const p = playerStats[name];
  if (!p || p.games_played < 10) return { value: null, grade: null };
  const kp = getPlayerKillParticipation(name);
  let grade = 'D';
  if (kp >= 55) grade = 'A';
  else if (kp >= 40) grade = 'B';
  else if (kp >= 25) grade = 'C';
  return { value: +kp.toFixed(0), grade };
}

export function getPlayerWinRate(name) {
  const p = playerStats[name];
  if (!p) return 0;
  const wins = p.games.filter(g => g.result === 'win').length;
  return (wins / p.games_played) * 100;
}

export function getPlayerWinRateGrade(name) {
  const p = playerStats[name];
  if (!p || p.games_played < 10) return { value: null, grade: null };
  const wr = getPlayerWinRate(name);
  let grade = 'D';
  if (wr >= 70) grade = 'A';
  else if (wr >= 55) grade = 'B';
  else if (wr >= 40) grade = 'C';
  return { value: +wr.toFixed(0), grade };
}

export function getPlayerEfficiencyMetrics(name) {
  return {
    kda: getPlayerKDA(name),
    damagePerDeath: getPlayerDamagePerDeath(name),
    killParticipation: getPlayerKillParticipation(name),
    kdaGrade: getPlayerKDAGrade(name),
    survivabilityGrade: getPlayerSurvivabilityGrade(name),
    killParticipationGrade: getPlayerKillParticipationGrade(name),
    winRate: getPlayerWinRate(name),
  };
}

// ─── War Day Trend Functions ────────────────────────────────────────

export function getWarDays() {
  const dates = new Set();
  gameDefinitions.forEach(g => dates.add(g.date.split(' ')[0]));
  return [...dates].sort();
}

export function getGuildTrendByDate() {
  const warDays = getWarDays();
  return warDays.map(day => {
    const games = gameDefinitions.filter(g => g.date.startsWith(day));
    const wins = games.filter(g => g.result === 'win').length;
    let totalDamage = 0;
    let totalKills = 0;
    let totalAssists = 0;
    let totalDeaths = 0;
    let totalHealing = 0;
    for (const game of games) {
      const players = getGamePlayers(game.gameNum);
      totalDamage += players.reduce((s, p) => s + p.damage, 0);
      totalKills += players.reduce((s, p) => s + p.defeated, 0);
      totalAssists += players.reduce((s, p) => s + p.assist, 0);
      totalDeaths += players.reduce((s, p) => s + p.deaths, 0);
      totalHealing += players.reduce((s, p) => s + p.heal, 0);
    }
    const avgTeamDamage = Math.round(totalDamage / games.length);
    const avgTeamHealing = Math.round(totalHealing / games.length);
    return {
      date: day,
      games: games.length,
      wins,
      winRate: (wins / games.length) * 100,
      avgTeamDamage,
      avgTeamHealing,
      avgTeamKDA: ((totalKills + totalAssists) / Math.max(totalDeaths, 1)).toFixed(2),
      avgTeamDeaths: Math.round(totalDeaths / games.length),
    };
  });
}

export function getPlayerTrendByDate(name) {
  const p = playerStats[name];
  if (!p) return [];
  const warDays = getWarDays();
  return warDays
    .map(day => {
      const dayGames = p.games.filter(g => g.date.startsWith(day));
      if (dayGames.length === 0) return null;
      const wins = dayGames.filter(g => g.result === 'win').length;
      const totalK = dayGames.reduce((s, g) => s + g.defeated, 0);
      const totalA = dayGames.reduce((s, g) => s + g.assist, 0);
      const totalD = dayGames.reduce((s, g) => s + g.deaths, 0);
      return {
        date: day,
        games: dayGames.length,
        avgDamage: Math.round(dayGames.reduce((s, g) => s + g.damage, 0) / dayGames.length),
        avgKills: +(totalK / dayGames.length).toFixed(1),
        avgDeaths: +(totalD / dayGames.length).toFixed(1),
        kda: +((totalK + totalA) / Math.max(totalD, 1)).toFixed(2),
        wins,
      };
    })
    .filter(Boolean);
}

export function getGuildTrendByWeek() {
  const daily = getGuildTrendByDate();
  const weeks = new Map();
  for (const day of daily) {
    const d = new Date(day.date.replace(/\//g, '-') + 'T00:00:00');
    // ISO week start (Monday)
    const dow = (d.getDay() + 6) % 7; // 0=Mon … 6=Sun
    const monday = new Date(d);
    monday.setDate(d.getDate() - dow);
    const key = monday.toISOString().slice(0, 10);
    if (!weeks.has(key)) weeks.set(key, []);
    weeks.get(key).push(day);
  }
  return [...weeks.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([mondayStr, days]) => {
      const totalGames = days.reduce((s, d) => s + d.games, 0);
      const totalWins = days.reduce((s, d) => s + d.wins, 0);
      const avgTeamDamage = Math.round(
        days.reduce((s, d) => s + d.avgTeamDamage * d.games, 0) / totalGames
      );
      const avgTeamDeaths = Math.round(
        days.reduce((s, d) => s + d.avgTeamDeaths * d.games, 0) / totalGames
      );
      const avgTeamHealing = Math.round(
        days.reduce((s, d) => s + d.avgTeamHealing * d.games, 0) / totalGames
      );
      // Weighted KDA
      const avgTeamKDA = (
        days.reduce((s, d) => s + (+d.avgTeamKDA) * d.games, 0) / totalGames
      ).toFixed(2);

      // Build week label like "Feb 9 – 15"
      const mon = new Date(mondayStr + 'T00:00:00');
      const sun = new Date(mon);
      sun.setDate(mon.getDate() + 6);
      const fmt = (dt) => dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const weekLabel = mon.getMonth() === sun.getMonth()
        ? `${fmt(mon)} – ${sun.getDate()}`
        : `${fmt(mon)} – ${fmt(sun)}`;

      return {
        weekLabel,
        games: totalGames,
        wins: totalWins,
        winRate: (totalWins / totalGames) * 100,
        avgTeamDamage,
        avgTeamHealing,
        avgTeamKDA,
        avgTeamDeaths,
      };
    });
}

export function getDeltaStats() {
  const trend = getGuildTrendByWeek();
  if (trend.length < 2) return null;
  const prev = trend[trend.length - 2];
  const curr = trend[trend.length - 1];
  function pct(c, p) {
    if (p === 0) return c > 0 ? 100 : 0;
    return ((c - p) / Math.abs(p)) * 100;
  }
  return {
    currentDate: curr.weekLabel,
    previousDate: prev.weekLabel,
    avgTeamDamage: { current: curr.avgTeamDamage, delta: pct(curr.avgTeamDamage, prev.avgTeamDamage) },
    avgTeamHealing: { current: curr.avgTeamHealing, delta: pct(curr.avgTeamHealing, prev.avgTeamHealing) },
    winRate: { current: curr.winRate, delta: curr.winRate - prev.winRate },
    avgTeamKDA: { current: +curr.avgTeamKDA, delta: pct(+curr.avgTeamKDA, +prev.avgTeamKDA) },
    avgTeamDeaths: { current: curr.avgTeamDeaths, delta: pct(curr.avgTeamDeaths, prev.avgTeamDeaths) },
  };
}

export function getPlayerPersonalBests(name) {
  const p = playerStats[name];
  if (!p) return {};
  const stats = ['damage', 'defeated', 'assist', 'heal', 'tank', 'siege_damage'];
  const labels = { damage: 'Damage', defeated: 'Kills', assist: 'Assists', heal: 'Healing', tank: 'Tank', siege_damage: 'Siege' };
  const bests = {};
  for (const stat of stats) {
    let best = null;
    for (const g of p.games) {
      if (g[stat] > 0 && (!best || g[stat] > best.value)) {
        best = { value: g[stat], date: g.date.split(' ')[0] };
      }
    }
    if (best) bests[labels[stat]] = best;
  }
  return bests;
}

// ─── War Overview Functions ────────────────────────────────────────

export function getPointsProgression(type) {
  return gameDefinitions
    .filter(g => g.type === type && g.points_after != null)
    .sort((a, b) => a.gameNum - b.gameNum)
    .map(g => ({
      gameNum: g.gameNum,
      date: g.date,
      opponent: g.opponent,
      result: g.result,
      points_after: g.points_after,
      points_gained: g.points_gained,
    }));
}

export function getCurrentPoints(type) {
  const progression = getPointsProgression(type);
  return progression.length > 0 ? progression[progression.length - 1].points_after : 0;
}

export function getRecordByType(type) {
  const games = gameDefinitions.filter(g => g.type === type);
  const wins = games.filter(g => g.result === 'win').length;
  const losses = games.length - wins;
  return { wins, losses, total: games.length };
}

export function getMatchesByOpponent() {
  const map = new Map();
  for (const g of gameDefinitions) {
    if (!g.opponent) continue;
    if (!map.has(g.opponent)) {
      map.set(g.opponent, { opponent: g.opponent, games: [], type: g.type });
    }
    map.get(g.opponent).games.push(g);
  }
  return [...map.values()].map(entry => {
    const wins = entry.games.filter(g => g.result === 'win').length;
    const losses = entry.games.length - wins;
    const totalOurKills = entry.games.reduce((s, g) => s + (g.our_kills || 0), 0);
    const totalEnemyKills = entry.games.reduce((s, g) => s + (g.enemy_kills || 0), 0);
    const totalOurCoins = entry.games.reduce((s, g) => s + (g.our_fun_coins || 0), 0);
    const totalEnemyCoins = entry.games.reduce((s, g) => s + (g.enemy_fun_coins || 0), 0);
    const lastGame = entry.games.reduce((latest, g) => g.gameNum > latest.gameNum ? g : latest, entry.games[0]);
    return {
      opponent: entry.opponent,
      games: entry.games.length,
      record: `${wins}-${losses}`,
      wins,
      losses,
      winRate: Math.round((wins / entry.games.length) * 100),
      type: entry.type,
      avgOurKills: Math.round(totalOurKills / entry.games.length),
      avgEnemyKills: Math.round(totalEnemyKills / entry.games.length),
      totalOurKills,
      totalEnemyKills,
      totalKillDiff: totalOurKills - totalEnemyKills,
      totalOurCoins,
      totalEnemyCoins,
      avgOurCoins: Math.round(totalOurCoins / entry.games.length),
      lastPlayed: lastGame.date,
      lastResult: lastGame.result,
    };
  });
}

export function getObjectiveStats() {
  const games = gameDefinitions.filter(g => g.opponent);
  const total = games.length;
  if (total === 0) return null;

  const avgOurFT = Math.round(games.reduce((s, g) => s + (g.our_fortune_tree_m || 0), 0) / total);
  const avgEnemyFT = Math.round(games.reduce((s, g) => s + (g.enemy_fortune_tree_m || 0), 0) / total);
  const ftWins = games.filter(g => (g.our_fortune_tree_m || 0) > (g.enemy_fortune_tree_m || 0)).length;

  const avgOurGG = Math.round(games.reduce((s, g) => s + (g.our_guardian_goose_hp_pct || 0), 0) / total);
  const avgEnemyGG = Math.round(games.reduce((s, g) => s + (g.enemy_guardian_goose_hp_pct || 0), 0) / total);
  const ggWins = games.filter(g => (g.our_guardian_goose_hp_pct || 0) < (g.enemy_guardian_goose_hp_pct || 0)).length;

  const avgOurBW = +(games.reduce((s, g) => s + (g.our_bulwark_remaining || 0), 0) / total).toFixed(1);
  const avgEnemyBW = +(games.reduce((s, g) => s + (g.enemy_bulwark_remaining || 0), 0) / total).toFixed(1);
  const bwWins = games.filter(g => (g.our_bulwark_remaining || 0) > (g.enemy_bulwark_remaining || 0)).length;

  const ourDeliveries = games.filter(g => (g.our_fortune_tree_m || 0) >= 465).length;
  const enemyDeliveries = games.filter(g => (g.enemy_fortune_tree_m || 0) >= 465).length;

  return {
    fortuneTree: {
      ours: avgOurFT, enemy: avgEnemyFT, rate: Math.round((ftWins / total) * 100),
      deliveryRate: Math.round((ourDeliveries / total) * 100),
      enemyDeliveryRate: Math.round((enemyDeliveries / total) * 100),
    },
    guardianGoose: { ours: avgOurGG, enemy: avgEnemyGG, rate: Math.round((ggWins / total) * 100) },
    bulwark: { ours: avgOurBW, enemy: avgEnemyBW, rate: Math.round((bwWins / total) * 100) },
  };
}

export function getWarAggregateStats() {
  const games = gameDefinitions.filter(g => g.opponent);
  const total = games.length;
  if (total === 0) return null;
  const wins = games.filter(g => g.result === 'win').length;
  const totalOurKills = games.reduce((s, g) => s + (g.our_kills || 0), 0);
  const totalEnemyKills = games.reduce((s, g) => s + (g.enemy_kills || 0), 0);
  const totalOurCoins = games.reduce((s, g) => s + (g.our_fun_coins || 0), 0);
  const totalEnemyCoins = games.reduce((s, g) => s + (g.enemy_fun_coins || 0), 0);
  return {
    totalGames: total,
    wins,
    losses: total - wins,
    winRate: Math.round((wins / total) * 100),
    totalOurKills,
    totalEnemyKills,
    killDiff: totalOurKills - totalEnemyKills,
    avgOurKills: Math.round(totalOurKills / total),
    avgEnemyKills: Math.round(totalEnemyKills / total),
    totalOurCoins,
    totalEnemyCoins,
    avgOurCoins: Math.round(totalOurCoins / total),
    avgEnemyCoins: Math.round(totalEnemyCoins / total),
    killRatio: +(totalOurKills / Math.max(totalEnemyKills, 1)).toFixed(2),
  };
}

export function getFunCoinsTrend() {
  const warDays = getWarDays();
  return warDays.map(day => {
    const games = gameDefinitions.filter(g => g.date.startsWith(day) && g.opponent);
    const ourTotal = games.reduce((s, g) => s + (g.our_fun_coins || 0), 0);
    const enemyTotal = games.reduce((s, g) => s + (g.enemy_fun_coins || 0), 0);
    return { date: day, ours: ourTotal, enemy: enemyTotal, games: games.length };
  });
}

export function determineWinCondition(game) {
  const ourTree = game.our_fortune_tree_m || 0;
  const enemyTree = game.enemy_fortune_tree_m || 0;
  const ourGoose = game.our_guardian_goose_hp_pct != null ? game.our_guardian_goose_hp_pct : 100;
  const enemyGoose = game.enemy_guardian_goose_hp_pct != null ? game.enemy_guardian_goose_hp_pct : 100;
  const ourBulwark = game.our_bulwark_remaining || 0;
  const enemyBulwark = game.enemy_bulwark_remaining || 0;

  // Tree delivered (>=465m)
  if (ourTree >= 465 || enemyTree >= 465) {
    return { method: 'tree_delivered', winner: ourTree >= 465 ? 'us' : 'enemy' };
  }
  // Tree distance
  if (ourTree !== enemyTree) {
    return { method: 'tree_distance', winner: ourTree > enemyTree ? 'us' : 'enemy' };
  }
  // Goose HP (lower remaining = better, killed more of their goose)
  if (ourGoose !== enemyGoose) {
    return { method: 'goose_hp', winner: ourGoose < enemyGoose ? 'us' : 'enemy' };
  }
  // Bulwarks (higher = better)
  if (ourBulwark !== enemyBulwark) {
    return { method: 'bulwark', winner: ourBulwark > enemyBulwark ? 'us' : 'enemy' };
  }
  return { method: 'unknown', winner: game.result === 'win' ? 'us' : 'enemy' };
}

export function getWinConditionBreakdown() {
  const games = gameDefinitions.filter(g => g.opponent);
  const breakdown = { tree_delivered: 0, tree_distance: 0, goose_hp: 0, bulwark: 0, unknown: 0 };
  const byResult = { wins: { ...breakdown }, losses: { ...breakdown } };
  for (const g of games) {
    const { method } = determineWinCondition(g);
    if (g.result === 'win') byResult.wins[method]++;
    else byResult.losses[method]++;
  }
  return byResult;
}

// ─── Weekend / MVP / Form Helpers ──────────────────────────────────

function isoFromSlashDate(slash) {
  return slash.replace(/\//g, '-');
}

function weekendKeyForDate(slashDate) {
  const iso = isoFromSlashDate(slashDate);
  const d = new Date(iso + 'T00:00:00');
  const day = d.getDay(); // 0=Sun, 6=Sat
  if (day !== 0 && day !== 6) return null;
  const sat = new Date(d);
  if (day === 0) sat.setDate(sat.getDate() - 1);
  return sat.toISOString().slice(0, 10);
}

function formatWeekendLabel(satIso) {
  const sat = new Date(satIso + 'T00:00:00');
  const sun = new Date(sat);
  sun.setDate(sun.getDate() + 1);
  const fmt = (dt) => dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return sat.getMonth() === sun.getMonth()
    ? `${fmt(sat)} - ${sun.getDate()}`
    : `${fmt(sat)} - ${fmt(sun)}`;
}

export function getLatestWeekend() {
  const byKey = new Map();
  for (const g of gameDefinitions) {
    const dateOnly = g.date.split(' ')[0];
    const key = weekendKeyForDate(dateOnly);
    if (!key) continue;
    if (!byKey.has(key)) byKey.set(key, new Set());
    byKey.get(key).add(dateOnly);
  }
  if (byKey.size === 0) return null;
  const sorted = [...byKey.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  const [satKey, dateSet] = sorted[0];
  return {
    key: satKey,
    label: formatWeekendLabel(satKey),
    dates: [...dateSet].sort(),
  };
}

export function getWeekendRecap(dateStrs) {
  if (!dateStrs || dateStrs.length === 0) return null;
  const games = gameDefinitions
    .filter(g => dateStrs.some(d => g.date.startsWith(d)))
    .sort((a, b) => a.gameNum - b.gameNum);

  const matches = games.map(g => {
    const cond = determineWinCondition(g);
    const ourPlayers = getGamePlayers(g.gameNum).length;
    return {
      gameNum: g.gameNum,
      date: g.date,
      opponent: g.opponent,
      type: g.type,
      result: g.result,
      points_gained: g.points_gained ?? null,
      our_kills: g.our_kills ?? 0,
      enemy_kills: g.enemy_kills ?? 0,
      our_tree_m: g.our_fortune_tree_m ?? 0,
      enemy_tree_m: g.enemy_fortune_tree_m ?? 0,
      our_bulwark: g.our_bulwark_remaining ?? 0,
      enemy_bulwark: g.enemy_bulwark_remaining ?? 0,
      our_player_count: ourPlayers,
      enemy_player_count: g.enemy_player_count ?? null,
      condition: cond.method,
      conditionWinner: cond.winner,
    };
  });

  const wins = matches.filter(m => m.result === 'win').length;
  const losses = matches.length - wins;
  const pointsGained = matches.reduce((s, m) => s + (m.points_gained || 0), 0);

  // Headline: pick most striking observation
  let headline = null;
  if (matches.length > 0) {
    const winRate = wins / matches.length;
    const treeWins = matches.filter(m => m.result === 'win' && m.condition === 'tree_delivered').length;
    if (winRate === 1) {
      headline = matches.length >= 3 ? `Clean sweep · ${matches.length}-0` : `Undefeated weekend · ${wins}-0`;
    } else if (winRate >= 0.75 && matches.length >= 3) {
      headline = `Strong showing · ${wins}-${losses}`;
    } else if (treeWins >= 2) {
      headline = `Delivered the Tree in ${treeWins} of ${matches.length}`;
    } else if (winRate === 0 && matches.length >= 2) {
      headline = `Tough weekend · 0-${losses}`;
    } else {
      headline = `${wins}-${losses} weekend`;
    }
  }

  return { matches, wins, losses, pointsGained, headline };
}

export function getWeekendMVPs(dateStrs) {
  if (!dateStrs || dateStrs.length === 0) return null;
  const matchingGameNums = new Set(
    gameDefinitions
      .filter(g => dateStrs.some(d => g.date.startsWith(d)))
      .map(g => g.gameNum)
  );
  const totalMatches = matchingGameNums.size;
  if (totalMatches === 0) return null;

  const minGames = Math.max(1, Math.ceil(totalMatches / 2));

  const perPlayer = [];
  for (const p of getAllPlayers()) {
    const games = p.games.filter(g => matchingGameNums.has(g.game_num));
    if (games.length < minGames) continue;
    const totals = games.reduce((acc, g) => {
      acc.damage += g.damage || 0;
      acc.tank += g.tank || 0;
      acc.heal += g.heal || 0;
      acc.deaths += g.deaths || 0;
      acc.kills += g.defeated || 0;
      acc.assists += g.assist || 0;
      acc.siege += g.siege_damage || 0;
      return acc;
    }, { damage: 0, tank: 0, heal: 0, deaths: 0, kills: 0, assists: 0, siege: 0 });
    const safeDeaths = Math.max(totals.deaths, 1);
    perPlayer.push({
      name: p.name,
      games: games.length,
      totals,
      avgDeaths: +(totals.deaths / games.length).toFixed(2),
      damagePerDeath: Math.round(totals.damage / safeDeaths),
      tankPerDeath: Math.round(totals.tank / safeDeaths),
      healPerDeath: Math.round(totals.heal / safeDeaths),
      kd: +(totals.kills / safeDeaths).toFixed(2),
    });
  }

  if (perPlayer.length === 0) return null;

  const TOP_N = 5;
  function topNBy(pool, scoreFn, tieBreaker) {
    return [...pool]
      .sort((a, b) => {
        const diff = scoreFn(b) - scoreFn(a);
        if (diff !== 0) return diff;
        return tieBreaker ? tieBreaker(b, a) : 0;
      })
      .slice(0, TOP_N);
  }
  function bottomNBy(pool, scoreFn, tieBreaker) {
    return [...pool]
      .sort((a, b) => {
        const diff = scoreFn(a) - scoreFn(b);
        if (diff !== 0) return diff;
        return tieBreaker ? tieBreaker(b, a) : 0;
      })
      .slice(0, TOP_N);
  }

  // Per-category minimum thresholds: filter out noise from low-volume entries
  // (e.g. someone with 1 kill / 0 deaths shouldn't claim Best K/D)
  const MIN_DAMAGE_TOTAL = 2_000_000;
  const MIN_TANK_TOTAL = 1_000_000;
  const MIN_HEAL_TOTAL = 1_000_000;
  const MIN_KILLS = 5;
  const MIN_ENGAGEMENT = 1_000_000;

  // "Engaged" = meaningful contribution via ANY of damage / heal / tank
  // (so healers and tanks aren't unfairly excluded by a damage-only floor)
  const engaged = (p) =>
    p.totals.damage >= MIN_ENGAGEMENT ||
    p.totals.heal >= MIN_ENGAGEMENT ||
    p.totals.tank >= MIN_ENGAGEMENT;

  // Per-death awards: require at least 1 death (so ratio is finite) AND the category-specific volume floor
  // (these stay category-specific since the award is about that specific output)
  const damagePool = perPlayer.filter(p => p.totals.deaths >= 1 && p.totals.damage >= MIN_DAMAGE_TOTAL);
  const tankPool = perPlayer.filter(p => p.totals.deaths >= 1 && p.totals.tank >= MIN_TANK_TOTAL);
  const healPool = perPlayer.filter(p => p.totals.deaths >= 1 && p.totals.heal >= MIN_HEAL_TOTAL);
  // Fewest Deaths: engagement-based, so any of damage/heal/tank counts
  const fewestDeathsPool = perPlayer.filter(engaged);
  // Best K/D: require minimum kills so 1-kill / 0-death isn't crowned
  const kdPool = perPlayer.filter(p => p.totals.kills >= MIN_KILLS);

  return {
    weekendLabel: dateStrs.join(', '),
    totalMatches,
    minGames,
    thresholds: {
      damageTotal: MIN_DAMAGE_TOTAL,
      tankTotal: MIN_TANK_TOTAL,
      healTotal: MIN_HEAL_TOTAL,
      kills: MIN_KILLS,
      engagement: MIN_ENGAGEMENT,
    },
    damagePerDeath: topNBy(
      damagePool,
      p => p.damagePerDeath,
      (a, b) => a.totals.damage - b.totals.damage,
    ),
    tankPerDeath: topNBy(
      tankPool,
      p => p.tankPerDeath,
      (a, b) => a.totals.tank - b.totals.tank,
    ),
    healPerDeath: topNBy(
      healPool,
      p => p.healPerDeath,
      (a, b) => a.totals.heal - b.totals.heal,
    ),
    fewestDeaths: bottomNBy(
      fewestDeathsPool,
      p => p.avgDeaths,
      (a, b) => a.games - b.games,
    ),
    bestKD: topNBy(
      kdPool,
      p => p.kd,
      (a, b) => a.totals.kills - b.totals.kills,
    ),
  };
}

export function getRosterFormMovers(limit = 6, role = 'DPS') {
  const cutoff4w = getRecentDateCutoff(4);
  const cutoff8w = getRecentDateCutoff(8);
  const statKey = role === 'Heal' ? 'heal' : role === 'Tank' ? 'tank' : 'damage';
  const movers = [];
  for (const p of getAllPlayers()) {
    const classes = playerClasses[p.name] || [];
    if (!classes.includes(role)) continue;

    const recent = p.games.filter(g => !g.exclude_from_totals && g.date >= cutoff4w);
    if (recent.length < 2) continue;
    const recentAvg = Math.round(recent.reduce((s, g) => s + (g[statKey] || 0), 0) / recent.length);

    // Baseline: prefer prior 4-8 week window; fall back to lifetime (excluding recent)
    const prior = p.games.filter(g => !g.exclude_from_totals && g.date >= cutoff8w && g.date < cutoff4w);
    let priorAvg;
    let baseline;
    if (prior.length >= 2) {
      priorAvg = Math.round(prior.reduce((s, g) => s + (g[statKey] || 0), 0) / prior.length);
      baseline = 'prior 4 weeks';
    } else {
      const lifetime = p.games.filter(g => !g.exclude_from_totals && g.date < cutoff4w);
      if (lifetime.length < 2) continue;
      priorAvg = Math.round(lifetime.reduce((s, g) => s + (g[statKey] || 0), 0) / lifetime.length);
      baseline = 'lifetime avg';
    }
    if (priorAvg === 0) continue;
    // Floor: both baseline and recent must clear 1M to qualify (filters out low-volume noise)
    const MIN_THRESHOLD = 1_000_000;
    if (priorAvg < MIN_THRESHOLD || recentAvg < MIN_THRESHOLD) continue;
    const deltaPct = ((recentAvg - priorAvg) / priorAvg) * 100;
    if (deltaPct <= 0) continue;
    movers.push({
      name: p.name,
      recentAvg,
      priorAvg,
      deltaPct: +deltaPct.toFixed(0),
      recentGames: recent.length,
      baseline,
      stat: statKey,
    });
  }
  const rising = [...movers].sort((a, b) => b.deltaPct - a.deltaPct).slice(0, limit);
  return { rising, role, stat: statKey };
}

export function getRosterMostActive(limit = 3) {
  const cutoff4w = getRecentDateCutoff(4);
  const active = [];
  for (const p of getAllPlayers()) {
    const recent = p.games.filter(g => !g.exclude_from_totals && g.date >= cutoff4w);
    if (recent.length === 0) continue;
    const totalDamage = recent.reduce((s, g) => s + (g.damage || 0), 0);
    const classes = playerClasses[p.name] || [];
    active.push({
      name: p.name,
      recentGames: recent.length,
      recentAvgDamage: Math.round(totalDamage / recent.length),
      role: classes[0] || '—',
    });
  }
  // Sort by most games, tiebreak by higher avg damage
  active.sort((a, b) => {
    if (b.recentGames !== a.recentGames) return b.recentGames - a.recentGames;
    return b.recentAvgDamage - a.recentAvgDamage;
  });
  return { active: active.slice(0, limit) };
}

export function getLastNWeekendsTrend(n = 4) {
  const byKey = new Map();
  for (const g of gameDefinitions) {
    const dateOnly = g.date.split(' ')[0];
    const key = weekendKeyForDate(dateOnly);
    if (!key) continue;
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key).push(g);
  }
  const sorted = [...byKey.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-n);
  return sorted.map(([key, games]) => {
    const wins = games.filter(g => g.result === 'win').length;
    let totalDamage = 0;
    let totalDeaths = 0;
    for (const g of games) {
      const players = getGamePlayers(g.gameNum);
      totalDamage += players.reduce((s, p) => s + p.damage, 0);
      totalDeaths += players.reduce((s, p) => s + p.deaths, 0);
    }
    return {
      key,
      label: formatWeekendLabel(key),
      games: games.length,
      wins,
      winRate: Math.round((wins / games.length) * 100),
      avgTeamDamage: Math.round(totalDamage / games.length),
      avgTeamDeaths: +(totalDeaths / games.length).toFixed(1),
    };
  });
}

export function getWeekendRosterPulse(dateStrs) {
  if (!dateStrs || dateStrs.length === 0) return null;
  const matchingGameNums = new Set(
    gameDefinitions
      .filter(g => dateStrs.some(d => g.date.startsWith(d)))
      .map(g => g.gameNum)
  );
  const allPlayers = getAllPlayers();
  const playedNames = new Set();
  for (const p of allPlayers) {
    if (p.games.some(g => matchingGameNums.has(g.game_num))) playedNames.add(p.name);
  }
  return {
    played: playedNames.size,
    rosterTotal: allPlayers.length,
    matches: matchingGameNums.size,
  };
}

export function getPlayerWeeklyComparison(name) {
  const p = playerStats[name];
  if (!p) return null;

  // Group player's games by weekend (Sat/Sun pairs)
  const weekendMap = new Map();
  for (const g of p.games) {
    const dateStr = g.date.split(' ')[0];
    const isoStr = dateStr.replace(/\//g, '-');
    const d = new Date(isoStr + 'T00:00:00');
    const day = d.getDay(); // 0=Sun, 6=Sat
    // Normalize to Saturday of the weekend
    let sat;
    if (day === 0) {
      sat = new Date(d);
      sat.setDate(sat.getDate() - 1);
    } else if (day === 6) {
      sat = new Date(d);
    } else {
      continue; // skip non-weekend games
    }
    const key = sat.toISOString().slice(0, 10);
    if (!weekendMap.has(key)) weekendMap.set(key, []);
    weekendMap.get(key).push(g);
  }

  // Sort weekends chronologically and take the two most recent
  const sortedWeekends = [...weekendMap.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  if (sortedWeekends.length < 2) return null;

  const [prevKey, prevGames] = sortedWeekends[sortedWeekends.length - 2];
  const [currKey, currGames] = sortedWeekends[sortedWeekends.length - 1];

  function computeStats(games, satKey) {
    const sat = new Date(satKey + 'T00:00:00');
    const sun = new Date(sat);
    sun.setDate(sun.getDate() + 1);
    const fmt = (dt) => dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const weekLabel = `${fmt(sat)} – ${sun.getDate()}`;

    const n = games.length;
    const wins = games.filter(g => g.result === 'win').length;
    const totalDamage = games.reduce((s, g) => s + g.damage, 0);
    const totalKills = games.reduce((s, g) => s + g.defeated, 0);
    const totalAssists = games.reduce((s, g) => s + g.assist, 0);
    const totalDeaths = games.reduce((s, g) => s + g.deaths, 0);
    const totalHeal = games.reduce((s, g) => s + g.heal, 0);
    const totalTank = games.reduce((s, g) => s + g.tank, 0);
    const totalSiege = games.reduce((s, g) => s + g.siege_damage, 0);

    return {
      weekLabel,
      games: n,
      wins,
      winRate: (wins / n) * 100,
      avgDamage: Math.round(totalDamage / n),
      avgKills: +(totalKills / n).toFixed(1),
      avgAssists: +(totalAssists / n).toFixed(1),
      avgDeaths: +(totalDeaths / n).toFixed(1),
      kda: +((totalKills + totalAssists) / Math.max(totalDeaths, 1)).toFixed(2),
      avgHeal: Math.round(totalHeal / n),
      avgTank: Math.round(totalTank / n),
      avgSiege: Math.round(totalSiege / n),
    };
  }

  const previous = computeStats(prevGames, prevKey);
  const current = computeStats(currGames, currKey);

  function pct(curr, prev) {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return ((curr - prev) / Math.abs(prev)) * 100;
  }

  const deltas = {
    games: pct(current.games, previous.games),
    winRate: current.winRate - previous.winRate,
    avgDamage: pct(current.avgDamage, previous.avgDamage),
    avgKills: pct(current.avgKills, previous.avgKills),
    avgAssists: pct(current.avgAssists, previous.avgAssists),
    avgDeaths: pct(current.avgDeaths, previous.avgDeaths),
    kda: pct(current.kda, previous.kda),
    avgHeal: pct(current.avgHeal, previous.avgHeal),
    avgTank: pct(current.avgTank, previous.avgTank),
    avgSiege: pct(current.avgSiege, previous.avgSiege),
  };

  return { current, previous, deltas };
}

// ─── Player Profile Helpers ─────────────────────────────────────────

export function getPlayerRoles(name) {
  return playerClasses[name] || [];
}

// New-player flag: first match within the last 4 weeks.
export function getPlayerNewness(name) {
  const p = playerStats[name];
  if (!p || p.games.length === 0) return null;
  const firstMatchDate = p.games.map(g => g.date.split(' ')[0]).sort()[0];
  const cutoff = getRecentDateCutoff(4);
  if (firstMatchDate < cutoff) return null;
  return { totalGames: p.games_played || 0, firstMatchDate };
}

export function getPlayerPrimaryRole(name) {
  const roles = getPlayerRoles(name);
  if (roles.length === 0) {
    // Fall back to inferred role from contribution mix
    const p = playerStats[name];
    if (!p || p.games_played === 0) return 'DPS';
    const heal = p.total_heal || 0;
    const tank = p.total_tank || 0;
    const dmg = p.total_damage || 0;
    if (heal > tank && heal > dmg * 0.5) return 'Heal';
    if (tank > heal && tank > dmg * 0.5) return 'Tank';
    return 'DPS';
  }
  return roles[0];
}

function computePercentile(value, pool, invert = false) {
  if (!pool.length) return null;
  let worse = 0;
  for (const v of pool) {
    if (invert ? v > value : v < value) worse++;
  }
  // Fraction of peers this player beats (higher number = better rank)
  return Math.round((worse / pool.length) * 100);
}

export function getPlayerPercentiles(name, { minGames = 10 } = {}) {
  const p = playerStats[name];
  if (!p) return null;
  const role = getPlayerPrimaryRole(name);
  const all = getAllPlayers().filter(pp => pp.games_played >= minGames);
  const sameRole = all.filter(pp => {
    const r = playerClasses[pp.name] || [];
    return r.includes(role);
  });

  function avg(stat, pl) {
    return pl.games_played > 0 ? pl[stat] / pl.games_played : 0;
  }

  const avgDamage = avg('total_damage', p);
  const avgKills = avg('total_defeats', p);
  const avgDeaths = avg('total_deaths', p);
  const avgHeal = avg('total_heal', p);
  const avgTank = avg('total_tank', p);
  const avgSiege = avg('total_siege', p);
  const kda = (p.total_defeats + p.total_assists) / Math.max(p.total_deaths, 1);
  const winRate = getPlayerWinRate(name);

  function pct(stat, value, invert = false) {
    return {
      guild: computePercentile(value, all.map(pp => avg(stat, pp)), invert),
      role: computePercentile(value, sameRole.map(pp => avg(stat, pp)), invert),
    };
  }

  return {
    role,
    sampleSizes: { guild: all.length, role: sameRole.length },
    avgDamage: pct('total_damage', avgDamage),
    avgKills: pct('total_defeats', avgKills),
    avgDeaths: pct('total_deaths', avgDeaths, true),
    avgHeal: pct('total_heal', avgHeal),
    avgTank: pct('total_tank', avgTank),
    avgSiege: pct('total_siege', avgSiege),
    kda: {
      guild: computePercentile(kda, all.map(pp => (pp.total_defeats + pp.total_assists) / Math.max(pp.total_deaths, 1))),
      role: computePercentile(kda, sameRole.map(pp => (pp.total_defeats + pp.total_assists) / Math.max(pp.total_deaths, 1))),
    },
    winRate: {
      guild: computePercentile(winRate, all.map(pp => getPlayerWinRate(pp.name))),
      role: computePercentile(winRate, sameRole.map(pp => getPlayerWinRate(pp.name))),
    },
  };
}

// Next-grade hint helpers — given current value + grade, what's the next tier and gap?
export function getPlayerNextGradeHints(name) {
  const p = playerStats[name];
  if (!p || p.games_played < 10) return null;
  const kda = (p.total_defeats + p.total_assists) / Math.max(p.total_deaths, 1);
  const avgDeaths = p.total_deaths / p.games_played;
  const kp = getPlayerKillParticipation(name);
  const wr = getPlayerWinRate(name);
  const floor = getPlayerFloorStat(name);

  function nextHigher(value, thresholds) {
    // thresholds sorted ascending: [Cmin, Bmin, Amin]; returns next unmet
    for (const t of thresholds) {
      if (value < t) return t;
    }
    return null;
  }
  function nextLower(value, thresholds) {
    // thresholds sorted descending (looser first): [Cmax, Bmax, Amax]
    for (const t of thresholds) {
      if (value > t) return t;
    }
    return null;
  }

  const kdaNext = nextHigher(kda, [4, 6, 9]);
  const kpNext = nextHigher(kp, [25, 40, 55]);
  const wrNext = nextHigher(wr, [40, 55, 70]);
  const deathsNext = nextLower(avgDeaths, [7, 5, 3]);
  // Floor ratio thresholds (percent): C ≥ 40, B ≥ 55, A ≥ 70
  const floorRatioNext = nextHigher(floor.ratio, [40, 55, 70]);

  function letterFor(target, type) {
    if (type === 'kda') return target === 4 ? 'C' : target === 6 ? 'B' : 'A';
    if (type === 'kp') return target === 25 ? 'C' : target === 40 ? 'B' : 'A';
    if (type === 'wr') return target === 40 ? 'C' : target === 55 ? 'B' : 'A';
    if (type === 'deaths') return target === 7 ? 'C' : target === 5 ? 'B' : 'A';
    if (type === 'floor') return target === 40 ? 'C' : target === 55 ? 'B' : 'A';
    return '';
  }

  return {
    kda: kdaNext ? { current: +kda.toFixed(2), target: kdaNext, letter: letterFor(kdaNext, 'kda') } : null,
    killParticipation: kpNext ? { current: +kp.toFixed(0), target: kpNext, letter: letterFor(kpNext, 'kp') } : null,
    winRate: wrNext ? { current: +wr.toFixed(0), target: wrNext, letter: letterFor(wrNext, 'wr') } : null,
    survival: deathsNext ? { current: +avgDeaths.toFixed(1), target: deathsNext, letter: letterFor(deathsNext, 'deaths') } : null,
    floor: floorRatioNext ? {
      current: floor.ratio,
      target: floorRatioNext,
      letter: letterFor(floorRatioNext, 'floor'),
      currentFloor: floor.floor,
      targetFloor: Math.round(floor.mean * (floorRatioNext / 100)),
    } : null,
  };
}

export function getGuildAverageProfile({ minGames = 5 } = {}) {
  const players = getAllPlayers().filter(p => p.games_played >= minGames);
  if (players.length === 0) return null;
  const sum = { dmg: 0, k: 0, a: 0, d: 0, h: 0, t: 0, s: 0, wr: 0, kda: 0, gp: 0 };
  for (const p of players) {
    const gp = p.games_played;
    sum.dmg += p.total_damage / gp;
    sum.k += p.total_defeats / gp;
    sum.a += p.total_assists / gp;
    sum.d += p.total_deaths / gp;
    sum.h += p.total_heal / gp;
    sum.t += p.total_tank / gp;
    sum.s += p.total_siege / gp;
    sum.wr += getPlayerWinRate(p.name);
    sum.kda += (p.total_defeats + p.total_assists) / Math.max(p.total_deaths, 1);
    sum.gp += gp;
  }
  const n = players.length;
  return {
    sampleSize: n,
    avgDamage: Math.round(sum.dmg / n),
    avgKills: +(sum.k / n).toFixed(1),
    avgAssists: +(sum.a / n).toFixed(1),
    avgDeaths: +(sum.d / n).toFixed(1),
    avgHeal: Math.round(sum.h / n),
    avgTank: Math.round(sum.t / n),
    avgSiege: Math.round(sum.s / n),
    winRate: +(sum.wr / n).toFixed(0),
    kda: +(sum.kda / n).toFixed(2),
  };
}

export function getRoleAverageProfile(role, { minGames = 5 } = {}) {
  const players = getAllPlayers().filter(p => {
    if (p.games_played < minGames) return false;
    const roles = playerClasses[p.name] || [];
    return roles.includes(role);
  });
  if (players.length === 0) return null;
  const sum = { dmg: 0, k: 0, a: 0, d: 0, h: 0, t: 0, s: 0, wr: 0, kda: 0 };
  for (const p of players) {
    const gp = p.games_played;
    sum.dmg += p.total_damage / gp;
    sum.k += p.total_defeats / gp;
    sum.a += p.total_assists / gp;
    sum.d += p.total_deaths / gp;
    sum.h += p.total_heal / gp;
    sum.t += p.total_tank / gp;
    sum.s += p.total_siege / gp;
    sum.wr += getPlayerWinRate(p.name);
    sum.kda += (p.total_defeats + p.total_assists) / Math.max(p.total_deaths, 1);
  }
  const n = players.length;
  return {
    role,
    sampleSize: n,
    avgDamage: Math.round(sum.dmg / n),
    avgKills: +(sum.k / n).toFixed(1),
    avgAssists: +(sum.a / n).toFixed(1),
    avgDeaths: +(sum.d / n).toFixed(1),
    avgHeal: Math.round(sum.h / n),
    avgTank: Math.round(sum.t / n),
    avgSiege: Math.round(sum.s / n),
    winRate: +(sum.wr / n).toFixed(0),
    kda: +(sum.kda / n).toFixed(2),
  };
}

export function getPlayerVsBenchmark(name, scope = 'guild') {
  const p = playerStats[name];
  if (!p || p.games_played === 0) return null;
  const role = getPlayerPrimaryRole(name);
  const benchmark = scope === 'role' ? getRoleAverageProfile(role) : getGuildAverageProfile();
  if (!benchmark) return null;
  const gp = p.games_played;
  const player = {
    games: gp,
    winRate: +getPlayerWinRate(name).toFixed(0),
    avgDamage: Math.round(p.total_damage / gp),
    avgKills: +(p.total_defeats / gp).toFixed(1),
    avgAssists: +(p.total_assists / gp).toFixed(1),
    avgDeaths: +(p.total_deaths / gp).toFixed(1),
    avgHeal: Math.round(p.total_heal / gp),
    avgTank: Math.round(p.total_tank / gp),
    avgSiege: Math.round(p.total_siege / gp),
    kda: +((p.total_defeats + p.total_assists) / Math.max(p.total_deaths, 1)).toFixed(2),
  };
  function pct(c, b) {
    if (b === 0) return c > 0 ? 100 : 0;
    return ((c - b) / Math.abs(b)) * 100;
  }
  const deltas = {
    winRate: player.winRate - benchmark.winRate,
    avgDamage: pct(player.avgDamage, benchmark.avgDamage),
    avgKills: pct(player.avgKills, benchmark.avgKills),
    avgAssists: pct(player.avgAssists, benchmark.avgAssists),
    avgDeaths: pct(player.avgDeaths, benchmark.avgDeaths),
    avgHeal: pct(player.avgHeal, benchmark.avgHeal),
    avgTank: pct(player.avgTank, benchmark.avgTank),
    avgSiege: pct(player.avgSiege, benchmark.avgSiege),
    kda: pct(player.kda, benchmark.kda),
  };
  return { scope, role, player, benchmark, deltas };
}

// Cache: team-wide totals per game (sum of every player's stats in that match).
// Used to compute "share of team" metrics. Computed lazily on first access.
let _gameTeamTotalsCache = null;
function getGameTeamTotals() {
  if (_gameTeamTotalsCache) return _gameTeamTotalsCache;
  const m = new Map();
  for (const p of Object.values(playerStats)) {
    for (const g of p.games) {
      const t = m.get(g.game_num) || { damage: 0, heal: 0, tank: 0, siege: 0, kills: 0 };
      t.damage += g.damage || 0;
      t.heal += g.heal || 0;
      t.tank += g.tank || 0;
      t.siege += g.siege_damage || 0;
      t.kills += g.defeated || 0;
      m.set(g.game_num, t);
    }
  }
  _gameTeamTotalsCache = m;
  return m;
}

// ─── Scoped (windowed) Player Report ──────────────────────────────
//
// Lifetime stats hide what's true *now*. The dashboard + roster views
// already lean on rolling windows; this helper does the same for the
// player profile so the Report Card / hero stats reflect recent form
// by default.

// Thresholds calibrated against guild distribution (see /tmp/audit-grades.mjs).
// Goal: every grade should be reachable by real players, with A reserved for
// roughly the top 10-15% in a 4-week window.
function gradeKDA(v) { if (v >= 9) return 'A'; if (v >= 6) return 'B'; if (v >= 4) return 'C'; return 'D'; }
function gradeKP(v) { if (v >= 45) return 'A'; if (v >= 35) return 'B'; if (v >= 22) return 'C'; return 'D'; }
function gradeSurvival(v) { if (v <= 3) return 'A'; if (v <= 5) return 'B'; if (v <= 7) return 'C'; return 'D'; }
function gradeWR(v) { if (v >= 60) return 'A'; if (v >= 50) return 'B'; if (v >= 40) return 'C'; return 'D'; }
function gradeFloorRatio(r) { if (r >= 45) return 'A'; if (r >= 30) return 'B'; if (r >= 18) return 'C'; return 'D'; }
// Share grades: 30v30, so even split is ~3.3%. Calibrated against guild distribution.
function gradeDamageShare(v) { if (v >= 5) return 'A'; if (v >= 3.5) return 'B'; if (v >= 2) return 'C'; return 'D'; }
function gradeHealShare(v) { if (v >= 14) return 'A'; if (v >= 10) return 'B'; if (v >= 6) return 'C'; return 'D'; }
function gradeSiegeShare(v) { if (v >= 7) return 'A'; if (v >= 4) return 'B'; if (v >= 1.5) return 'C'; return 'D'; }
function gradeActivity(v) { if (v >= 75) return 'A'; if (v >= 50) return 'B'; if (v >= 25) return 'C'; return 'D'; }
function gradeCarry(v) { if (v >= 60) return 'A'; if (v >= 30) return 'B'; if (v >= 12) return 'C'; return 'D'; }
// Per-death efficiency grades — calibrated against guild distribution
function gradeDmgPerDeath(v) { if (v >= 800_000) return 'A'; if (v >= 450_000) return 'B'; if (v >= 220_000) return 'C'; return 'D'; }
function gradeDmgTakenPerDeath(v) { if (v >= 1_000_000) return 'A'; if (v >= 700_000) return 'B'; if (v >= 400_000) return 'C'; return 'D'; }
function gradeHealPerDeath(v) { if (v >= 3_500_000) return 'A'; if (v >= 2_000_000) return 'B'; if (v >= 1_000_000) return 'C'; return 'D'; }

export function getPlayerScopedReport(name, scope = { type: 'weeks', value: 4 }) {
  const p = playerStats[name];
  if (!p) return null;

  let games;
  let label;
  if (scope.type === 'lifetime') {
    games = p.games.filter(g => !g.exclude_from_totals);
    label = 'Lifetime';
  } else {
    const cutoff = getRecentDateCutoff(scope.value);
    games = p.games.filter(g => !g.exclude_from_totals && g.date >= cutoff);
    label = `Last ${scope.value} weeks`;
  }

  const gp = games.length;
  const totals = {
    damage: games.reduce((s, g) => s + (g.damage || 0), 0),
    kills: games.reduce((s, g) => s + (g.defeated || 0), 0),
    assists: games.reduce((s, g) => s + (g.assist || 0), 0),
    deaths: games.reduce((s, g) => s + (g.deaths || 0), 0),
    heal: games.reduce((s, g) => s + (g.heal || 0), 0),
    tank: games.reduce((s, g) => s + (g.tank || 0), 0),
    siege: games.reduce((s, g) => s + (g.siege_damage || 0), 0),
  };
  const wins = games.filter(g => g.result === 'win').length;
  const winRate = gp > 0 ? (wins / gp) * 100 : 0;
  const kda = (totals.kills + totals.assists) / Math.max(totals.deaths, 1);
  const avgDeaths = gp > 0 ? totals.deaths / gp : 0;

  // Kill participation across just these games
  let kpSum = 0;
  let kpCount = 0;
  for (const g of games) {
    const teammates = getGamePlayers(g.game_num);
    const teamKills = teammates.reduce((s, pl) => s + pl.defeated, 0);
    if (teamKills > 0) {
      kpSum += (g.defeated + g.assist) / teamKills;
      kpCount++;
    }
  }
  const killParticipation = kpCount > 0 ? (kpSum / kpCount) * 100 : 0;

  // Team-share metrics: per-game share of team output, then averaged.
  // Treats each match as one observation regardless of length.
  const teamTotals = getGameTeamTotals();
  let dmgShareSum = 0, dmgShareCount = 0;
  let healShareSum = 0, healShareCount = 0;
  let siegeShareSum = 0, siegeShareCount = 0;
  for (const g of games) {
    const t = teamTotals.get(g.game_num);
    if (!t) continue;
    if (t.damage > 0) { dmgShareSum += (g.damage || 0) / t.damage; dmgShareCount++; }
    if (t.heal > 0) { healShareSum += (g.heal || 0) / t.heal; healShareCount++; }
    if (t.siege > 0) { siegeShareSum += (g.siege_damage || 0) / t.siege; siegeShareCount++; }
  }
  const damageShare = dmgShareCount > 0 ? (dmgShareSum / dmgShareCount) * 100 : 0;
  const healShare = healShareCount > 0 ? (healShareSum / healShareCount) * 100 : 0;
  const siegeShare = siegeShareCount > 0 ? (siegeShareSum / siegeShareCount) * 100 : 0;

  // Heal/Siege Share are role-gated using lifetime contribution: a DPS shouldn't
  // be graded on heal share for not being a healer.
  const lifetimeHealShare = (() => {
    let s = 0, c = 0;
    for (const g of p.games) {
      const t = teamTotals.get(g.game_num);
      if (t && t.heal > 0) { s += (g.heal || 0) / t.heal; c++; }
    }
    return c > 0 ? (s / c) * 100 : 0;
  })();
  const lifetimeSiegeShare = (() => {
    let s = 0, c = 0;
    for (const g of p.games) {
      const t = teamTotals.get(g.game_num);
      if (t && t.siege > 0) { s += (g.siege_damage || 0) / t.siege; c++; }
    }
    return c > 0 ? (s / c) * 100 : 0;
  })();
  const qualifiesForHealShare = lifetimeHealShare >= 2;
  const qualifiesForSiegeShare = lifetimeSiegeShare >= 1;
  const lifetimeTankPerDeath = p.total_deaths > 0 ? p.total_tank / p.total_deaths : 0;
  const qualifiesForTankPerDeath = lifetimeTankPerDeath >= 300_000;

  // Activity: % of guild matches in window that this player participated in
  let guildMatchesInWindow;
  if (scope.type === 'lifetime') {
    guildMatchesInWindow = gameDefinitions.filter(gd => !gd.exclude_from_totals).length;
  } else {
    const cutoff = getRecentDateCutoff(scope.value);
    guildMatchesInWindow = gameDefinitions.filter(gd => {
      const d = gd.date.split(' ')[0];
      return !gd.exclude_from_totals && d >= cutoff;
    }).length;
  }
  const activity = guildMatchesInWindow > 0 ? (gp / guildMatchesInWindow) * 100 : 0;

  // Per-death efficiency stats (raw, not graded — context for the grades above)
  const safeDeaths = Math.max(totals.deaths, 1);
  const damagePerDeath = Math.round(totals.damage / safeDeaths);
  const damageTakenPerDeath = Math.round(totals.tank / safeDeaths);
  const healPerDeath = Math.round(totals.heal / safeDeaths);

  // Form trajectory: linear regression slope of role-relevant stat across the window
  let trajectory = null;
  if (gp >= 4) {
    const trajRoles = playerClasses[name] || [];
    const trajIsHealer = trajRoles.includes('Heal') && !trajRoles.includes('DPS') && !trajRoles.includes('Tank');
    const slopeStat = trajIsHealer && totals.heal > 0 ? 'heal' : 'damage';
    const sortedGames = [...games].sort((a, b) => a.game_num - b.game_num);
    const ys = sortedGames.map(g => g[slopeStat] || 0);
    const n = ys.length;
    const meanY = ys.reduce((s, v) => s + v, 0) / n;
    const meanX = (n - 1) / 2;
    let num = 0, den = 0;
    for (let i = 0; i < n; i++) {
      num += (i - meanX) * (ys[i] - meanY);
      den += (i - meanX) ** 2;
    }
    const slope = den > 0 ? num / den : 0;
    const slopePerGameRel = meanY > 0 ? (slope / meanY) * 100 : 0;
    let direction = 'steady';
    if (slopePerGameRel >= 2.5) direction = 'up';
    else if (slopePerGameRel <= -2.5) direction = 'down';
    trajectory = {
      direction,
      slopePerGameRel: +slopePerGameRel.toFixed(1),
      stat: slopeStat,
      statLabel: slopeStat === 'heal' ? 'Healing' : 'Damage',
    };
  }

  // Carry score: composite of efficiency (KDA) and contribution (KP).
  // KDA 9 * KP 45 / 10 ≈ 40 (A); KDA 4 * KP 22 / 10 ≈ 8.8 (C boundary).
  const carryScore = (kda * killParticipation) / 10;

  // Min games for grading: shorter windows can grade with fewer games,
  // since lifetime samples include long-stale matches we don't care about.
  const minForGrade = scope.type === 'lifetime' ? 10 : 4;
  const canGrade = gp >= minForGrade;

  // Floor on the role-relevant stat
  const roles = playerClasses[name] || [];
  const isHealer = roles.includes('Heal') && !roles.includes('DPS') && !roles.includes('Tank');
  const floorStatKey = isHealer && totals.heal > 0 ? 'heal' : 'damage';
  const floorLabel = floorStatKey === 'heal' ? 'Healing' : 'Damage';
  let floor = { floor: 0, mean: 0, ratio: 0, grade: null, stat: floorStatKey, statLabel: floorLabel, sampleSize: 0 };
  if (gp >= 2) {
    const values = games.map(g => g[floorStatKey] || 0).sort((a, b) => a - b);
    const bottomCount = Math.max(1, Math.ceil(values.length * 0.25));
    const bottom = values.slice(0, bottomCount);
    const fl = bottom.reduce((s, v) => s + v, 0) / bottom.length;
    const mn = values.reduce((s, v) => s + v, 0) / values.length;
    const ratio = mn > 0 ? (fl / mn) * 100 : 0;
    floor = {
      floor: Math.round(fl),
      mean: Math.round(mn),
      ratio: Math.round(ratio),
      grade: canGrade ? gradeFloorRatio(ratio) : null,
      stat: floorStatKey,
      statLabel: floorLabel,
      sampleSize: bottomCount,
    };
  }

  // Next-grade hints (only when graded)
  function nextHigher(value, thresholds) {
    for (const t of thresholds) if (value < t) return t;
    return null;
  }
  function nextLower(value, thresholds) {
    for (const t of thresholds) if (value > t) return t;
    return null;
  }
  function letterFor(target, type) {
    if (type === 'kda') return target === 4 ? 'C' : target === 6 ? 'B' : 'A';
    if (type === 'kp') return target === 22 ? 'C' : target === 35 ? 'B' : 'A';
    if (type === 'wr') return target === 40 ? 'C' : target === 50 ? 'B' : 'A';
    if (type === 'deaths') return target === 7 ? 'C' : target === 5 ? 'B' : 'A';
    if (type === 'floor') return target === 18 ? 'C' : target === 30 ? 'B' : 'A';
    if (type === 'dmgShare') return target === 2 ? 'C' : target === 3.5 ? 'B' : 'A';
    if (type === 'healShare') return target === 6 ? 'C' : target === 10 ? 'B' : 'A';
    if (type === 'siegeShare') return target === 1.5 ? 'C' : target === 4 ? 'B' : 'A';
    if (type === 'activity') return target === 25 ? 'C' : target === 50 ? 'B' : 'A';
    if (type === 'carry') return target === 12 ? 'C' : target === 30 ? 'B' : 'A';
    if (type === 'dpd') return target === 220_000 ? 'C' : target === 450_000 ? 'B' : 'A';
    if (type === 'dtpd') return target === 400_000 ? 'C' : target === 700_000 ? 'B' : 'A';
    if (type === 'hpd') return target === 1_000_000 ? 'C' : target === 2_000_000 ? 'B' : 'A';
    return '';
  }
  const kdaNext = canGrade ? nextHigher(kda, [4, 6, 9]) : null;
  const kpNext = canGrade ? nextHigher(killParticipation, [22, 35, 45]) : null;
  const wrNext = canGrade ? nextHigher(winRate, [40, 50, 60]) : null;
  const deathsNext = canGrade ? nextLower(avgDeaths, [7, 5, 3]) : null;
  const floorNext = canGrade ? nextHigher(floor.ratio, [18, 30, 45]) : null;
  const dmgShareNext = canGrade ? nextHigher(damageShare, [2, 3.5, 5]) : null;
  const dpdNext = canGrade ? nextHigher(damagePerDeath, [220_000, 450_000, 800_000]) : null;
  const dtpdNext = canGrade && qualifiesForTankPerDeath ? nextHigher(damageTakenPerDeath, [400_000, 700_000, 1_000_000]) : null;
  const hpdNext = canGrade && qualifiesForHealShare ? nextHigher(healPerDeath, [1_000_000, 2_000_000, 3_500_000]) : null;
  const healShareNext = canGrade && qualifiesForHealShare ? nextHigher(healShare, [6, 10, 14]) : null;
  const siegeShareNext = canGrade && qualifiesForSiegeShare ? nextHigher(siegeShare, [1.5, 4, 7]) : null;
  const activityNext = canGrade ? nextHigher(activity, [25, 50, 75]) : null;
  const carryNext = canGrade ? nextHigher(carryScore, [12, 30, 60]) : null;
  const nextHints = {
    kda: kdaNext ? { current: +kda.toFixed(2), target: kdaNext, letter: letterFor(kdaNext, 'kda') } : null,
    killParticipation: kpNext ? { current: +killParticipation.toFixed(0), target: kpNext, letter: letterFor(kpNext, 'kp') } : null,
    winRate: wrNext ? { current: +winRate.toFixed(0), target: wrNext, letter: letterFor(wrNext, 'wr') } : null,
    survival: deathsNext ? { current: +avgDeaths.toFixed(1), target: deathsNext, letter: letterFor(deathsNext, 'deaths') } : null,
    floor: floorNext ? {
      current: floor.ratio,
      target: floorNext,
      letter: letterFor(floorNext, 'floor'),
      currentFloor: floor.floor,
      targetFloor: Math.round(floor.mean * (floorNext / 100)),
    } : null,
    damageShare: dmgShareNext ? { current: +damageShare.toFixed(1), target: dmgShareNext, letter: letterFor(dmgShareNext, 'dmgShare') } : null,
    healShare: healShareNext ? { current: +healShare.toFixed(1), target: healShareNext, letter: letterFor(healShareNext, 'healShare') } : null,
    siegeShare: siegeShareNext ? { current: +siegeShare.toFixed(1), target: siegeShareNext, letter: letterFor(siegeShareNext, 'siegeShare') } : null,
    activity: activityNext ? { current: +activity.toFixed(0), target: activityNext, letter: letterFor(activityNext, 'activity') } : null,
    carry: carryNext ? { current: +carryScore.toFixed(0), target: carryNext, letter: letterFor(carryNext, 'carry') } : null,
    dmgPerDeath: dpdNext ? { current: damagePerDeath, target: dpdNext, letter: letterFor(dpdNext, 'dpd') } : null,
    dmgTakenPerDeath: dtpdNext ? { current: damageTakenPerDeath, target: dtpdNext, letter: letterFor(dtpdNext, 'dtpd') } : null,
    healPerDeath: hpdNext ? { current: healPerDeath, target: hpdNext, letter: letterFor(hpdNext, 'hpd') } : null,
  };

  const damageShareGrade = canGrade ? gradeDamageShare(damageShare) : null;
  const healShareGrade = canGrade && qualifiesForHealShare ? gradeHealShare(healShare) : null;
  const siegeShareGrade = canGrade && qualifiesForSiegeShare ? gradeSiegeShare(siegeShare) : null;
  const activityGrade = canGrade ? gradeActivity(activity) : null;
  const carryGrade = canGrade ? gradeCarry(carryScore) : null;
  const dmgPerDeathGrade = canGrade ? gradeDmgPerDeath(damagePerDeath) : null;
  const dmgTakenPerDeathGrade = canGrade && qualifiesForTankPerDeath ? gradeDmgTakenPerDeath(damageTakenPerDeath) : null;
  const healPerDeathGrade = canGrade && qualifiesForHealShare ? gradeHealPerDeath(healPerDeath) : null;

  // Weakest graded entry for the headline
  const order = { A: 4, B: 3, C: 2, D: 1 };
  const gradeEntries = [
    { label: 'KDA', grade: canGrade ? gradeKDA(kda) : null },
    { label: 'Kill Part.', grade: canGrade ? gradeKP(killParticipation) : null },
    { label: 'Survival', grade: canGrade ? gradeSurvival(avgDeaths) : null },
    { label: 'Dmg Share', grade: damageShareGrade },
    { label: 'Heal Share', grade: healShareGrade },
    { label: 'Siege Share', grade: siegeShareGrade },
    { label: 'Activity', grade: activityGrade },
    { label: 'Carry', grade: carryGrade },
    { label: 'Dmg/Death', grade: dmgPerDeathGrade },
    { label: 'Dmg Taken/Death', grade: dmgTakenPerDeathGrade },
    { label: 'Heal/Death', grade: healPerDeathGrade },
  ].filter(e => e.grade);
  const weakest = gradeEntries.length ? gradeEntries.reduce((w, e) => order[e.grade] < order[w.grade] ? e : w, gradeEntries[0]) : null;

  return {
    scope,
    label,
    canGrade,
    minForGrade,
    games,
    gamesPlayed: gp,
    wins,
    losses: gp - wins,
    winRate: +winRate.toFixed(0),
    kda: +kda.toFixed(2),
    killParticipation: +killParticipation.toFixed(0),
    avgDamage: gp > 0 ? Math.round(totals.damage / gp) : 0,
    avgKills: gp > 0 ? +(totals.kills / gp).toFixed(1) : 0,
    avgAssists: gp > 0 ? +(totals.assists / gp).toFixed(1) : 0,
    avgDeaths: gp > 0 ? +(totals.deaths / gp).toFixed(1) : 0,
    avgHeal: gp > 0 ? Math.round(totals.heal / gp) : 0,
    avgTank: gp > 0 ? Math.round(totals.tank / gp) : 0,
    avgSiege: gp > 0 ? Math.round(totals.siege / gp) : 0,
    totalDamage: totals.damage,
    totalKills: totals.kills,
    totalAssists: totals.assists,
    totalDeaths: totals.deaths,
    totalHeal: totals.heal,
    totalTank: totals.tank,
    totalSiege: totals.siege,
    grades: {
      kda: { value: +kda.toFixed(2), grade: canGrade ? gradeKDA(kda) : null },
      killParticipation: { value: +killParticipation.toFixed(0), grade: canGrade ? gradeKP(killParticipation) : null },
      survivability: { value: +avgDeaths.toFixed(1), grade: canGrade ? gradeSurvival(avgDeaths) : null },
      winRate: { value: +winRate.toFixed(0), grade: canGrade ? gradeWR(winRate) : null },
      damageShare: { value: +damageShare.toFixed(1), grade: damageShareGrade },
      healShare: { value: +healShare.toFixed(1), grade: healShareGrade },
      siegeShare: { value: +siegeShare.toFixed(1), grade: siegeShareGrade },
      activity: { value: +activity.toFixed(0), grade: activityGrade },
      carry: { value: +carryScore.toFixed(0), grade: carryGrade },
    },
    floor,
    activity: { value: +activity.toFixed(0), grade: activityGrade, gamesPlayed: gp, guildMatches: guildMatchesInWindow },
    perDeath: {
      damage: { value: damagePerDeath, grade: dmgPerDeathGrade },
      damageTaken: { value: damageTakenPerDeath, grade: dmgTakenPerDeathGrade },
      healing: { value: healPerDeath, grade: healPerDeathGrade },
    },
    trajectory,
    hasHeal: totals.heal > 0,
    hasSiege: totals.siege > 0,
    hasTank: totals.tank > 0,
    nextHints,
    weakestGrade: weakest,
  };
}

// Helper: weakest grade letter among the report card (returns label + letter)
export function getPlayerWeakestGrade(name) {
  const eff = getPlayerEfficiencyMetrics(name);
  const wr = getPlayerWinRateGrade(name);
  const floor = getPlayerFloorStat(name);
  const entries = [
    { label: 'KDA', grade: eff.kdaGrade.grade },
    { label: 'Kill Part.', grade: eff.killParticipationGrade.grade },
    { label: 'Survival', grade: eff.survivabilityGrade.grade },
    { label: 'Win Rate', grade: wr.grade },
    { label: 'Floor', grade: floor.grade },
  ].filter(e => e.grade);
  if (entries.length === 0) return null;
  const order = { A: 4, B: 3, C: 2, D: 1 };
  return entries.reduce((worst, e) => order[e.grade] < order[worst.grade] ? e : worst, entries[0]);
}
