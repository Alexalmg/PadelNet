import { Op } from 'sequelize';
import { Season, Match, ActivityLog } from '../models';
import { applyPenalty } from './penalty.service';

export async function checkWeeklyActivity() {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);

  const activeSeason = await Season.findAll({ where: { status: 'active' } });

  for (const season of activeSeason) {
    const matches = await Match.findAll({
      where: {
        seasonId: season.id,
        matchDate: { [Op.between]: [weekStart, now] },
      },
    });

    const teamIds = [...new Set([
      ...matches.map((m) => m.homeTeamId),
      ...matches.map((m) => m.awayTeamId),
    ])];

    const penaltyPoints = parseInt(process.env.ACTIVITY_PENALTY_POINTS || '3');
    const maxInfractions = parseInt(process.env.ACTIVITY_MAX_INFRACTIONS || '3');

    for (const teamId of teamIds) {
      const played = matches.filter(
        (m) => m.status === 'completed' && (m.homeTeamId === teamId || m.awayTeamId === teamId)
      ).length;

      const [log] = await ActivityLog.findOrCreate({
        where: { teamId, seasonId: season.id, weekStartDate: weekStart as unknown as Date },
        defaults: {
          teamId,
          seasonId: season.id,
          weekStartDate: weekStart as unknown as Date,
          weekEndDate: now as unknown as Date,
          matchesPlayed: played,
          infractionCount: 0,
        },
      });

      log.matchesPlayed = played;

      if (played === 0) {
        await applyPenalty({
          teamId,
          seasonId: season.id,
          type: 'automatic',
          reason: 'no_activity',
          points: penaltyPoints,
        });

        log.infractionCount += 1;

        if (log.infractionCount >= maxInfractions) {
          console.warn(`Team ${teamId} has reached max infractions (${maxInfractions}) in season ${season.id}`);
        }
      }

      await log.save();
    }
  }
}
