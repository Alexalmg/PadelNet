import { Match, MvpVote, Team, User, PlayerStats, TeamPlayer } from '../models';

export async function castVote(
  matchId: number,
  votedBy: number,
  mvpUserId: number,
  ratedTeamId: number,
  fairPlayScore: number
) {
  if (fairPlayScore < 1 || fairPlayScore > 5) throw new Error('La puntuación de Fair Play debe ser entre 1 y 5');

  const match = await Match.findByPk(matchId, {
    include: [
      { model: Team, as: 'homeTeam' },
      { model: Team, as: 'awayTeam' },
    ],
  });
  if (!match) throw new Error('Partido no encontrado');
  if (match.status !== 'completed') throw new Error('Solo se puede votar en partidos completados');

  const homeTeam = (match as any).homeTeam as Team;
  const awayTeam = (match as any).awayTeam as Team;

  const isHomeCaptain = homeTeam.captainId === votedBy;
  const isAwayCaptain = awayTeam.captainId === votedBy;
  if (!isHomeCaptain && !isAwayCaptain) throw new Error('Solo los capitanes pueden votar');

  const existing = await MvpVote.findOne({ where: { matchId, votedBy } });
  if (existing) throw new Error('Ya has votado en este partido');

  const vote = await MvpVote.create({ matchId, votedBy, mvpUserId, ratedTeamId, fairPlayScore });

  // Update fair play avg in player_stats for the rated team's players
  await updateFairPlayStats(ratedTeamId, match.seasonId, fairPlayScore);
  // Update MVP count if both voted
  await checkMvpWinner(matchId, match.seasonId);

  return vote;
}

async function updateFairPlayStats(teamId: number, seasonId: number, score: number) {
  const members = await TeamPlayer.findAll({ where: { teamId, isActive: true } });

  for (const member of members) {
    const [stats] = await PlayerStats.findOrCreate({
      where: { userId: member.userId, seasonId },
      defaults: { userId: member.userId, seasonId },
    });
    const newVotes = stats.fairPlayVotes + 1;
    const newAvg = ((stats.fairPlayAvg * stats.fairPlayVotes) + score) / newVotes;
    await stats.update({ fairPlayVotes: newVotes, fairPlayAvg: parseFloat(newAvg.toFixed(2)) });
  }
}

async function checkMvpWinner(matchId: number, seasonId: number) {
  const votes = await MvpVote.findAll({ where: { matchId } });
  if (votes.length < 2) return;

  const tally: Record<number, number> = {};
  for (const v of votes) {
    tally[v.mvpUserId] = (tally[v.mvpUserId] || 0) + 1;
  }
  const maxVotes = Math.max(...Object.values(tally));
  const mvpIds = Object.keys(tally).filter(id => tally[+id] === maxVotes).map(Number);

  for (const mvpId of mvpIds) {
    const [stats] = await PlayerStats.findOrCreate({
      where: { userId: mvpId, seasonId },
      defaults: { userId: mvpId, seasonId },
    });
    await stats.update({ mvpCount: stats.mvpCount + 1 });
  }
}

export async function getMatchVotes(matchId: number) {
  const votes = await MvpVote.findAll({
    where: { matchId },
    include: [
      { model: User, as: 'voter', attributes: ['id', 'firstName', 'lastName'] },
      { model: User, as: 'mvpPlayer', attributes: ['id', 'firstName', 'lastName'] },
      { model: Team, as: 'ratedTeam', attributes: ['id', 'name'] },
    ],
  });

  const tally: Record<number, { user: any; votes: number }> = {};
  for (const v of votes) {
    const key = v.mvpUserId;
    if (!tally[key]) tally[key] = { user: (v as any).mvpPlayer, votes: 0 };
    tally[key].votes++;
  }

  return { votes, tally: Object.values(tally).sort((a, b) => b.votes - a.votes) };
}

export async function hasVoted(matchId: number, userId: number): Promise<boolean> {
  const v = await MvpVote.findOne({ where: { matchId, votedBy: userId } });
  return !!v;
}
