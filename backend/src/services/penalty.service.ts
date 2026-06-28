import { Penalty } from '../models';

interface ApplyPenaltyArgs {
  teamId: number;
  seasonId: number;
  type: 'automatic' | 'manual';
  reason: 'no_activity' | 'late_result' | 'no_show' | 'other';
  points: number;
  description?: string;
  appliedBy?: number;
}

export async function applyPenalty(args: ApplyPenaltyArgs) {
  return Penalty.create(args);
}

export async function getPenaltiesByTeam(teamId: number, seasonId: number) {
  return Penalty.findAll({ where: { teamId, seasonId } });
}

export async function getTotalPenaltyPoints(teamId: number, seasonId: number) {
  const penalties = await Penalty.findAll({ where: { teamId, seasonId } });
  return penalties.reduce((sum, p) => sum + p.points, 0);
}

export async function removePenalty(id: number) {
  const penalty = await Penalty.findByPk(id);
  if (!penalty) throw new Error('Penalty not found');
  if (penalty.type === 'automatic') throw new Error('Cannot remove automatic penalties');
  await penalty.destroy();
}
