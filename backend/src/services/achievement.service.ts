import { Achievement, UserAchievement, PlayerStats } from '../models';

const CONDITIONS: Record<string, (s: PlayerStats) => boolean> = {
  primera_victoria: (s) => s.wins >= 1,
  diez_victorias:   (s) => s.wins >= 10,
  veinte_victorias: (s) => s.wins >= 20,
  rey_pista:        (s) => s.wins >= 30,
  mvp_x3:          (s) => s.mvpCount >= 3,
  racha_5:          (s) => s.bestWinStreak >= 5,
  veterano:         (s) => s.matchesPlayed >= 50,
  fair_play_star:   (s) => s.fairPlayAvg >= 4.5 && s.fairPlayVotes >= 5,
};

export async function evaluateAchievements(userId: number, stats: PlayerStats) {
  const allAchievements = await Achievement.findAll();
  const earned = await UserAchievement.findAll({ where: { userId } });
  const earnedSlugs = new Set(
    await Promise.all(earned.map(async (ua) => {
      const a = await Achievement.findByPk(ua.achievementId);
      return a?.slug;
    }))
  );

  for (const achievement of allAchievements) {
    if (earnedSlugs.has(achievement.slug)) continue;
    const check = CONDITIONS[achievement.slug];
    if (check && check(stats)) {
      await UserAchievement.create({ userId, achievementId: achievement.id });
    }
  }
}

export async function getUserAchievements(userId: number) {
  return UserAchievement.findAll({
    where: { userId },
    include: [{ model: Achievement, as: 'achievement' }],
    order: [['awardedAt', 'DESC']],
  });
}

export async function getAllAchievements() {
  return Achievement.findAll({ order: [['name', 'ASC']] });
}
