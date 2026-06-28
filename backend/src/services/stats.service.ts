import { Match, Team, TeamPlayer, MatchResult, PlayerStats, User, Season } from '../models';
import { evaluateAchievements } from './achievement.service';

async function evaluateAchievementsDeferred(userId: number, stats: PlayerStats) {
  try { await evaluateAchievements(userId, stats); } catch(e) { console.error('Achievement eval error:', e); }
}

function calcElo(ratingA: number, ratingB: number, winnerIsA: boolean) {
  const K = 32;
  const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  const actualA = winnerIsA ? 1 : 0;
  const newA = Math.round(ratingA + K * (actualA - expectedA));
  const newB = Math.round(ratingB + K * ((1 - actualA) - (1 - expectedA)));
  return { newA, newB };
}

export async function updateAfterMatch(matchId: number) {
  const match = await Match.findByPk(matchId, {
    include: [
      { model: Team, as: 'homeTeam' },
      { model: Team, as: 'awayTeam' },
      { model: MatchResult, as: 'results' },
    ],
  });
  if (!match) return;

  const results = (match as any).results as MatchResult[];
  if (!results || results.length === 0) return;

  let homeSetsWon = 0;
  let awaySetsWon = 0;
  let homeTotalGames = 0;
  let awayTotalGames = 0;

  for (const r of results) {
    if ((r as any).homeScore > (r as any).awayScore) homeSetsWon++;
    else if ((r as any).awayScore > (r as any).homeScore) awaySetsWon++;
    homeTotalGames += (r as any).homeScore || 0;
    awayTotalGames += (r as any).awayScore || 0;
  }

  const homeWins = homeSetsWon > awaySetsWon;
  const awayWins = awaySetsWon > homeSetsWon;

  const homeTeam = (match as any).homeTeam as Team;
  const awayTeam = (match as any).awayTeam as Team;

  const homePlayers = await TeamPlayer.findAll({ where: { teamId: homeTeam.id, isActive: true } });
  const awayPlayers = await TeamPlayer.findAll({ where: { teamId: awayTeam.id, isActive: true } });

  // Compute team average ELO
  let homeEloSum = 0, awayEloSum = 0;
  for (const p of homePlayers) {
    const s = await PlayerStats.findOne({ where: { userId: p.userId, seasonId: match.seasonId } });
    homeEloSum += s?.elo ?? 1000;
  }
  for (const p of awayPlayers) {
    const s = await PlayerStats.findOne({ where: { userId: p.userId, seasonId: match.seasonId } });
    awayEloSum += s?.elo ?? 1000;
  }
  const homeAvgElo = homePlayers.length ? Math.round(homeEloSum / homePlayers.length) : 1000;
  const awayAvgElo = awayPlayers.length ? Math.round(awayEloSum / awayPlayers.length) : 1000;
  const { newA: newHomeElo, newB: newAwayElo } = calcElo(homeAvgElo, awayAvgElo, homeWins);

  const homeEloDelta = newHomeElo - homeAvgElo;
  const awayEloDelta = newAwayElo - awayAvgElo;
  const seasonId = match!.seasonId;

  async function updatePlayer(
    userId: number,
    won: boolean,
    setsWon: number,
    setsLost: number,
    eloDelta: number
  ) {
    const [stats] = await PlayerStats.findOrCreate({
      where: { userId, seasonId },
      defaults: { userId, seasonId },
    });

    const newWinStreak = won ? stats.winStreak + 1 : 0;
    const newBestStreak = Math.max(stats.bestWinStreak, newWinStreak);

    await stats.update({
      matchesPlayed: stats.matchesPlayed + 1,
      wins: stats.wins + (won ? 1 : 0),
      losses: stats.losses + (won ? 0 : 1),
      setsWon: stats.setsWon + setsWon,
      setsLost: stats.setsLost + setsLost,
      elo: Math.max(0, stats.elo + eloDelta),
      winStreak: newWinStreak,
      bestWinStreak: newBestStreak,
    });

    return stats;
  }

  for (const p of homePlayers) {
    const s = await updatePlayer(p.userId, homeWins, homeSetsWon, awaySetsWon, homeEloDelta);
    await evaluateAchievementsDeferred(p.userId, s);
  }
  for (const p of awayPlayers) {
    const s = await updatePlayer(p.userId, awayWins, awaySetsWon, homeSetsWon, awayEloDelta);
    await evaluateAchievementsDeferred(p.userId, s);
  }
}

export async function getPlayerStats(userId: number, seasonId?: number) {
  const where: any = { userId };
  if (seasonId) where.seasonId = seasonId;
  return PlayerStats.findAll({
    where,
    include: [{ model: Season, as: 'season', attributes: ['id', 'name'] }],
    order: [['seasonId', 'DESC']],
  });
}

export async function getStandings(seasonId: number) {
  const allStats = await PlayerStats.findAll({
    where: { seasonId },
    include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] }],
    order: [
      ['elo', 'DESC'],
      ['wins', 'DESC'],
      ['matchesPlayed', 'ASC'],
    ],
  });
  return allStats;
}
