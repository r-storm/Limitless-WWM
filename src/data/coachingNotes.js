// Coaching + Strength advice templates for Report Card grades.
// Returns text using the player's actual numbers, role-aware.
// Tone: specific, WWM-aware, actionable in one sentence.

import { formatNumber } from '../utils/formatters';

function fmt(v) { return formatNumber(v); }

// Metrics that don't apply to a given role (skipped for both coaching + strengths)
const EXCLUDE_FOR_ROLE = {
  Heal: new Set(['killParticipation', 'damageShare', 'carry', 'dmgPerDeath']),
  Tank: new Set(),
  DPS: new Set(),
};

// Coaching templates (C/D grades. areas to improve)
const COACH = {
  kda: {
    DPS: (r) => `KDA ${r.grades.kda.value} (${r.grades.kda.grade}). Dying too often relative to your kills. GvG healing is reduced by 30%. back out at half HP instead of pushing for the finish.`,
    Tank: (r) => `KDA ${r.grades.kda.value} (${r.grades.kda.grade}). Tanks shouldn't farm kills, but repeated deaths cost your team coverage. Stay near a healer and rotate pulls with other tanks through every fight and use Golden Bell and other defensive mystic skills to stay alive longer.`,
    Heal: (r) => `KDA ${r.grades.kda.value} (${r.grades.kda.grade}). Healers shouldn't be in DPS kill range. Position behind tanks and rotate out the moment you're focused.`,
  },
  killParticipation: {
    DPS: (r) => `Kill Part. ${r.grades.killParticipation.value}% (${r.grades.killParticipation.grade}). You only get kills if you're the last one to damage the player. Stack damage with your team during burst windows. Solo damage doesn't always convert to getting credit for kills.`,
    Tank: (r) => `Kill Part. ${r.grades.killParticipation.value}% (${r.grades.killParticipation.grade}). Tanks don't need kills, but target low HP targets in teamfights. Utilise your AoE mystic skills so you register on assists.`,
  },
  survivability: {
    DPS: (r) => `Survival ${r.grades.survivability.value} avg deaths (${r.grades.survivability.grade}). Above guild norms. Heal recovery is reduced by 30% in GvG. once below half HP, disengage to your healer or consume a health potion rather than continuing the fight.`,
    Tank: (r) => `Survival ${r.grades.survivability.value} avg deaths (${r.grades.survivability.grade}). Although it looks bad, You're doing your best, keep it up. Most Stats don't accurately reflect tanks well and you play a strategic role in gvg. We need you!`,
    Heal: (r) => `Survival ${r.grades.survivability.value} avg deaths (${r.grades.survivability.grade}). You're getting picked off. Stay behind your fellow tanks and dps team members and watch for flanks. healers are the priority target list.`,
  },
  damageShare: {
    DPS: (r) => `Dmg Share ${r.grades.damageShare.value}% (${r.grades.damageShare.grade}). Even split for 30 players is 3.3%. you're below the carry threshold. Are you being targeted too aggressively, or getting stuck solo in group fights? Wait for your other team members to catch up and stack damage with other DPS.`,
    Tank: (r) => `Dmg Share ${r.grades.damageShare.value}% (${r.grades.damageShare.grade}). Tanks aren't expected to top damage, but anything under 2% suggests you're tank-busting alone or playing too passive. Stay in melee range during fights.`,
  },
  healShare: {
    Heal: (r) => `Heal Share ${r.grades.healShare.value}% (${r.grades.healShare.grade}). Multiple healers split the share, but consistently low share means you're getting outhealed in coverage. Identify under-healed lanes and commit there. Don't stack with other healers essentially.`,
  },
  activity: {
    _all: (r) => `Activity ${r.grades.activity.value}% (${r.grades.activity.grade}). Only ${r.activity.gamesPlayed} of ${r.activity.guildMatches} guild matches this window. We genuinely need you in GvG, every player on the field is one less hole in our wall and one more chance to win the weekend. Even adding one extra match to your week makes a real difference, and the runs are always better with you in them. Come queue up with us!`,
  },
  carry: {
    DPS: (r) => {
      const order = { A: 4, B: 3, C: 2, D: 1 };
      const drag = order[r.grades.kda.grade] < order[r.grades.killParticipation.grade] ? 'KDA' : 'Kill Participation';
      return `Carry ${r.grades.carry.value} (${r.grades.carry.grade}). Composite of KDA × KP. ${drag} is the bigger lever right now. focus there first.`;
    },
    Tank: (r) => `Carry ${r.grades.carry.value} (${r.grades.carry.grade}). Tanks aren't the carry win-condition, but staying alive longer (Survival) compounds both KDA and KP. start there.`,
  },
  dmgPerDeath: {
    DPS: (r) => `Dmg/Death ${fmt(r.perDeath.damage.value)} (${r.perDeath.damage.grade}). Each life is netting less than expected. Either trading damage 1:1 (don't) or taking risky positions before unloading your rotation. Position better, stay near a healer, and disengage when health runs low`,
    Tank: (r) => `Dmg/Death ${fmt(r.perDeath.damage.value)} (${r.perDeath.damage.grade}). Tanks aren't graded harshly here, so please keep coordinating your pulls with others and stick close to other team members.`,
  },
  dmgTakenPerDeath: {
    Tank: (r) => `Dmg Taken/Death ${fmt(r.perDeath.damageTaken.value)} (${r.perDeath.damageTaken.grade}). This is a weak metric, but it signals who manage to stay alive longer before dying. Sticking by healers, using mystic skills like Golden Bell and disengaging when health runs low is paramount to improving your survivability.`,
    _all: (r) => `Dmg Taken/Death ${fmt(r.perDeath.damageTaken.value)} (${r.perDeath.damageTaken.grade}). This is a weak metric, but it signals who manage to stay alive longer before dying. Sticking by healers, using mystic skills like Golden Bell and disengaging when health runs low is paramount to improving your survivability. `,
  },
  healPerDeath: {
    Heal: (r) => `Heal/Death ${fmt(r.perDeath.healing.value)} (${r.perDeath.healing.grade}). You're not banking enough heals before going down. Stay in the backline longer between heal cycles and rotate out earlier when focused.`,
  },
};

// Strength templates (A/B grades, what's working).
// Each metric has 3 tiers based on the actual value (not just letter grade):
//   elite       - well above the A threshold; top of guild territory
//   solid       - clean A; consistent strong performance
//   encouraging - low A or B; positive but motivational, "keep pushing"
// This way a borderline B-grade player gets praise without being told they're elite,
// and a true elite player gets recognised distinctly from a "just barely A" player.
const STRENGTH_TIER = {
  kda: (v) => v >= 14 ? 'elite' : v >= 9 ? 'solid' : 'encouraging',
  killParticipation: (v) => v >= 50 ? 'elite' : v >= 45 ? 'solid' : 'encouraging',
  survivability: (v) => v <= 2.5 ? 'elite' : v <= 3 ? 'solid' : 'encouraging', // lower = better
  damageShare: (v) => v >= 6 ? 'elite' : v >= 5 ? 'solid' : 'encouraging',
  healShare: (v) => v >= 16 ? 'elite' : v >= 14 ? 'solid' : 'encouraging',
  activity: (v) => v >= 90 ? 'elite' : v >= 75 ? 'solid' : 'encouraging',
  carry: (v) => v >= 100 ? 'elite' : v >= 60 ? 'solid' : 'encouraging',
  dmgPerDeath: (v) => v >= 1_200_000 ? 'elite' : v >= 800_000 ? 'solid' : 'encouraging',
  dmgTakenPerDeath: (v) => v >= 1_500_000 ? 'elite' : v >= 1_000_000 ? 'solid' : 'encouraging',
  healPerDeath: (v) => v >= 5_000_000 ? 'elite' : v >= 3_500_000 ? 'solid' : 'encouraging',
};

const STRENGTH = {
  kda: {
    DPS: {
      elite: (r) => `KDA ${r.grades.kda.value} (A). Elite trade ratio, almost untouchable. Don't get complacent though, the guild needs your discipline every match.`,
      solid: (r) => `KDA ${r.grades.kda.value} (A). Strong KDA, your trade decisions are winning. Keep the discipline.`,
      encouraging: (r) => `KDA ${r.grades.kda.value} (${r.grades.kda.grade}). Above guild norm and trending the right way. A bit more selective trading and you'll break into A territory.`,
    },
    Tank: {
      elite: (r) => `KDA ${r.grades.kda.value} (A). Exceptional for a tank, you're tanking AND scoring. Rare combination, keep it up.`,
      solid: (r) => `KDA ${r.grades.kda.value} (A). Strong KDA for a tank, holding the line and tagging kills.`,
      encouraging: (r) => `KDA ${r.grades.kda.value} (${r.grades.kda.grade}). Solid for a tank. Push for kills when openings appear without overextending.`,
    },
    Heal: {
      elite: (r) => `KDA ${r.grades.kda.value} (A). Top healer discipline, you're virtually never feeding kills. Set the standard for the team.`,
      solid: (r) => `KDA ${r.grades.kda.value} (A). Not feeding kills. Positioning and cooldown rotation are working.`,
      encouraging: (r) => `KDA ${r.grades.kda.value} (${r.grades.kda.grade}). Solid for a healer. A few less deaths and you're in elite healer territory.`,
    },
  },
  killParticipation: {
    DPS: {
      elite: (r) => `Kill Part. ${r.grades.killParticipation.value}% (A). Almost everywhere kills happen. You ARE the burst window for your team.`,
      solid: (r) => `Kill Part. ${r.grades.killParticipation.value}% (A). Consistently stacked in burst windows. Keep coordinating with your team.`,
      encouraging: (r) => `Kill Part. ${r.grades.killParticipation.value}% (${r.grades.killParticipation.grade}). Reliable presence in teamfights. Tighter rotations to break into A range.`,
    },
    Tank: {
      elite: (r) => `Kill Part. ${r.grades.killParticipation.value}% (A). Elite targeting on top of tank duty. Very rare combination.`,
      solid: (r) => `Kill Part. ${r.grades.killParticipation.value}% (A). Strong tagging while tanking, well-rounded.`,
      encouraging: (r) => `Kill Part. ${r.grades.killParticipation.value}% (${r.grades.killParticipation.grade}). Solid involvement. Keep AoE on cooldown to chase a higher grade.`,
    },
  },
  survivability: {
    DPS: {
      elite: (r) => `Survival ${r.grades.survivability.value} avg deaths (A). Untouchable. Your positioning is the gold standard others should learn from.`,
      solid: (r) => `Survival ${r.grades.survivability.value} avg deaths (A). Hard to kill, disciplined disengages and good awareness.`,
      encouraging: (r) => `Survival ${r.grades.survivability.value} avg deaths (${r.grades.survivability.grade}). Above average. A bit more peel-awareness will tighten this further.`,
    },
    Tank: {
      elite: (r) => `Survival ${r.grades.survivability.value} avg deaths (A). Iron will. The team can't lose you and you almost never go down.`,
      solid: (r) => `Survival ${r.grades.survivability.value} avg deaths (A). Holding ground without overextending. Tank fundamentals on point.`,
      encouraging: (r) => `Survival ${r.grades.survivability.value} avg deaths (${r.grades.survivability.grade}). Decent for a tank. Use defensive cooldowns earlier to extend your uptime.`,
    },
    Heal: {
      elite: (r) => `Survival ${r.grades.survivability.value} avg deaths (A). Top healer survival. Constant uptime on heals for the whole team.`,
      solid: (r) => `Survival ${r.grades.survivability.value} avg deaths (A). Staying alive, keeping the team supplied. Position is dialed in.`,
      encouraging: (r) => `Survival ${r.grades.survivability.value} avg deaths (${r.grades.survivability.grade}). Decent survival. Tighter positioning behind the wall will push you to A.`,
    },
  },
  damageShare: {
    DPS: {
      elite: (r) => `Dmg Share ${r.grades.damageShare.value}% (A). Top-end carry output. You ARE the team's damage backbone.`,
      solid: (r) => `Dmg Share ${r.grades.damageShare.value}% (A). Strong damage contributor, well above the carry threshold.`,
      encouraging: (r) => `Dmg Share ${r.grades.damageShare.value}% (${r.grades.damageShare.grade}). Solid contribution. Tighter rotations or deeper angles will push you to A.`,
    },
    Tank: {
      elite: (r) => `Dmg Share ${r.grades.damageShare.value}% (A). Exceptional damage for a tank, threatening AND tanking.`,
      solid: (r) => `Dmg Share ${r.grades.damageShare.value}% (A). Strong tank damage, melee uptime is paying off.`,
      encouraging: (r) => `Dmg Share ${r.grades.damageShare.value}% (${r.grades.damageShare.grade}). Decent tank damage. More melee uptime will push higher.`,
    },
  },
  healShare: {
    Heal: {
      elite: (r) => `Heal Share ${r.grades.healShare.value}% (A). Carrying the heal load alone. MVP healer territory.`,
      solid: (r) => `Heal Share ${r.grades.healShare.value}% (A). Strong coverage, pulling above your weight in the heal split.`,
      encouraging: (r) => `Heal Share ${r.grades.healShare.value}% (${r.grades.healShare.grade}). Solid share. Find under-healed lanes to push into elite range.`,
    },
  },
  activity: {
    _all: {
      elite: (r) => `Activity ${r.grades.activity.value}% (A). Pillar of the roster, at almost every match. The guild can build around you.`,
      solid: (r) => `Activity ${r.grades.activity.value}% (A). Reliable show-up rate. The roster relies on you.`,
      encouraging: (r) => `Activity ${r.grades.activity.value}% (${r.grades.activity.grade}). Consistent attendance. One more weekend per month and you're elite.`,
    },
  },
  carry: {
    DPS: {
      elite: (r) => `Carry ${r.grades.carry.value} (A). Composite carry score in the stratosphere. You ARE the carry win-condition.`,
      solid: (r) => `Carry ${r.grades.carry.value} (A). Top-tier composite, KDA and KP both firing. Swinging matches.`,
      encouraging: (r) => `Carry ${r.grades.carry.value} (${r.grades.carry.grade}). Strong combined contribution. Tighten the lower of KDA or KP to break elite.`,
    },
    Tank: {
      elite: (r) => `Carry ${r.grades.carry.value} (A). Exceptional composite for a tank, contributing on every axis.`,
      solid: (r) => `Carry ${r.grades.carry.value} (A). Strong combined contribution for a tank. Not just absorbing.`,
      encouraging: (r) => `Carry ${r.grades.carry.value} (${r.grades.carry.grade}). Solid all-around. Survival uptime will compound this further.`,
    },
  },
  dmgPerDeath: {
    DPS: {
      elite: (r) => `Dmg/Death ${fmt(r.perDeath.damage.value)} (A). Maximum value per life, surgical efficiency.`,
      solid: (r) => `Dmg/Death ${fmt(r.perDeath.damage.value)} (A). High damage efficiency per life, well above norm.`,
      encouraging: (r) => `Dmg/Death ${fmt(r.perDeath.damage.value)} (${r.perDeath.damage.grade}). Decent efficiency. One more rotation per life and you're in elite range.`,
    },
    Tank: {
      elite: (r) => `Dmg/Death ${fmt(r.perDeath.damage.value)} (A). Exceptional output per life for a tank.`,
      solid: (r) => `Dmg/Death ${fmt(r.perDeath.damage.value)} (A). Strong rotation discipline before going down.`,
      encouraging: (r) => `Dmg/Death ${fmt(r.perDeath.damage.value)} (${r.perDeath.damage.grade}). Decent for a tank. Push offensive globals before disengaging.`,
    },
  },
  dmgTakenPerDeath: {
    Tank: {
      elite: (r) => `Dmg Taken/Death ${fmt(r.perDeath.damageTaken.value)} (A). Eating damage like a wall, top of the team in absorbed hits.`,
      solid: (r) => `Dmg Taken/Death ${fmt(r.perDeath.damageTaken.value)} (A). Solid mitigation, shields and cooldowns timed well.`,
      encouraging: (r) => `Dmg Taken/Death ${fmt(r.perDeath.damageTaken.value)} (${r.perDeath.damageTaken.grade}). Decent for a tank. Hold cooldowns later in fights to push higher.`,
    },
    _all: {
      elite: (r) => `Dmg Taken/Death ${fmt(r.perDeath.damageTaken.value)} (A). Absorbing significant damage for a non-tank role. Rare, keep it up.`,
      solid: (r) => `Dmg Taken/Death ${fmt(r.perDeath.damageTaken.value)} (A). Strong absorption stats, defensive cooldowns landing.`,
      encouraging: (r) => `Dmg Taken/Death ${fmt(r.perDeath.damageTaken.value)} (${r.perDeath.damageTaken.grade}). Decent absorption. Time defensive cooldowns later in fights.`,
    },
  },
  healPerDeath: {
    Heal: {
      elite: (r) => `Heal/Death ${fmt(r.perDeath.healing.value)} (A). Banking massive heals before going down. Elite efficiency.`,
      solid: (r) => `Heal/Death ${fmt(r.perDeath.healing.value)} (A). Strong heal output between deaths.`,
      encouraging: (r) => `Heal/Death ${fmt(r.perDeath.healing.value)} (${r.perDeath.healing.grade}). Solid heal-per-life. Stay in backline a beat longer to climb higher.`,
    },
  },
};

// Pull the raw value used for tiering (matches what each grade card displays)
function strengthValue(report, metric) {
  switch (metric) {
    case 'kda': return report.grades.kda.value;
    case 'killParticipation': return report.grades.killParticipation.value;
    case 'survivability': return report.grades.survivability.value;
    case 'damageShare': return report.grades.damageShare.value;
    case 'healShare': return report.grades.healShare.value;
    case 'activity': return report.grades.activity.value;
    case 'carry': return report.grades.carry.value;
    case 'dmgPerDeath': return report.perDeath.damage.value;
    case 'dmgTakenPerDeath': return report.perDeath.damageTaken.value;
    case 'healPerDeath': return report.perDeath.healing.value;
    default: return 0;
  }
}

const ORDER = { D: 1, C: 2, B: 3, A: 4 };

function pickTemplate(table, metric, role) {
  const tmpl = table[metric];
  if (!tmpl) return null;
  return tmpl[role] || tmpl._all || null;
}

// Strength templates are nested by tier; resolve role bucket then tier.
function pickStrengthTemplate(metric, role, value) {
  const tmpl = STRENGTH[metric];
  if (!tmpl) return null;
  const bucket = tmpl[role] || tmpl._all;
  if (!bucket) return null;
  const tierFn = STRENGTH_TIER[metric];
  const tier = tierFn ? tierFn(value) : 'solid';
  return bucket[tier] || bucket.solid || bucket.encouraging || null;
}

// Metrics in evaluation order
function candidateMetrics(report) {
  return [
    { metric: 'kda', grade: report.grades.kda.grade },
    { metric: 'killParticipation', grade: report.grades.killParticipation.grade },
    { metric: 'survivability', grade: report.grades.survivability.grade },
    { metric: 'damageShare', grade: report.grades.damageShare.grade },
    { metric: 'healShare', grade: report.grades.healShare.grade },
    { metric: 'activity', grade: report.grades.activity.grade },
    { metric: 'carry', grade: report.grades.carry.grade },
    { metric: 'dmgPerDeath', grade: report.perDeath.damage.grade },
    { metric: 'dmgTakenPerDeath', grade: report.perDeath.damageTaken.grade },
    { metric: 'healPerDeath', grade: report.perDeath.healing.grade },
  ];
}

function normaliseRole(role) {
  return role === 'Heal' || role === 'Tank' || role === 'DPS' ? role : 'DPS';
}

// Returns up to `limit` weakest-grade coaching notes (C/D), role-aware.
export function getCoachingNotes(report, primaryRole, limit = 3) {
  if (!report || !report.canGrade) return [];
  const role = normaliseRole(primaryRole);
  const exclude = EXCLUDE_FOR_ROLE[role];

  const weak = candidateMetrics(report)
    .filter(c => (c.grade === 'C' || c.grade === 'D') && !exclude.has(c.metric))
    .sort((a, b) => ORDER[a.grade] - ORDER[b.grade]);

  const notes = [];
  for (const c of weak) {
    if (notes.length >= limit) break;
    const fn = pickTemplate(COACH, c.metric, role);
    if (!fn) continue;
    notes.push({ metric: c.metric, grade: c.grade, text: fn(report) });
  }
  return notes;
}

// Returns up to `limit` strongest-grade strength callouts (A/B), role-aware.
// A grades preferred; B grades fill remaining slots.
export function getStrengthNotes(report, primaryRole, limit = 2) {
  if (!report || !report.canGrade) return [];
  const role = normaliseRole(primaryRole);
  const exclude = EXCLUDE_FOR_ROLE[role];

  const strong = candidateMetrics(report)
    .filter(c => (c.grade === 'A' || c.grade === 'B') && !exclude.has(c.metric))
    .sort((a, b) => ORDER[b.grade] - ORDER[a.grade]);

  const notes = [];
  for (const c of strong) {
    if (notes.length >= limit) break;
    const value = strengthValue(report, c.metric);
    const fn = pickStrengthTemplate(c.metric, role, value);
    if (!fn) continue;
    notes.push({ metric: c.metric, grade: c.grade, text: fn(report) });
  }
  return notes;
}
