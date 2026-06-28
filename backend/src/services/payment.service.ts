import { Payment, Team, Season } from '../models';

export async function listPayments(seasonId?: number) {
  const where: any = {};
  if (seasonId) where.seasonId = seasonId;

  return Payment.findAll({
    where,
    include: [
      { model: Team, as: 'team', attributes: ['id', 'name'] },
      { model: Season, as: 'season', attributes: ['id', 'name'] },
    ],
    order: [['status', 'ASC'], ['teamId', 'ASC']],
  });
}

export async function markPaid(teamId: number, seasonId: number) {
  const [payment] = await Payment.findOrCreate({
    where: { teamId, seasonId },
    defaults: { teamId, seasonId, amount: 0 },
  });
  await payment.update({ status: 'paid', paidAt: new Date() });
  return payment;
}

export async function markOverdue(teamId: number, seasonId: number) {
  const [payment] = await Payment.findOrCreate({
    where: { teamId, seasonId },
    defaults: { teamId, seasonId, amount: 0 },
  });
  await payment.update({ status: 'overdue', paidAt: undefined });
  return payment;
}

export async function markPending(teamId: number, seasonId: number) {
  const [payment] = await Payment.findOrCreate({
    where: { teamId, seasonId },
    defaults: { teamId, seasonId, amount: 0 },
  });
  await payment.update({ status: 'pending', paidAt: undefined });
  return payment;
}

export async function getTeamPaymentStatus(teamId: number, seasonId: number) {
  return Payment.findOne({ where: { teamId, seasonId } });
}

export async function isTeamBlocked(teamId: number, seasonId: number): Promise<boolean> {
  const p = await getTeamPaymentStatus(teamId, seasonId);
  return p?.status === 'overdue';
}
