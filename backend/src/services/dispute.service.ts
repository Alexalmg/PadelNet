import { Match, MatchDispute, Team, User } from '../models';

export async function raiseDispute(matchId: number, userId: number, reason: string) {
  const match = await Match.findByPk(matchId, {
    include: [
      { model: Team, as: 'homeTeam' },
      { model: Team, as: 'awayTeam' },
    ],
  });
  if (!match) throw new Error('Partido no encontrado');

  const homeTeam = (match as any).homeTeam as Team;
  const awayTeam = (match as any).awayTeam as Team;

  if (homeTeam.captainId !== userId && awayTeam.captainId !== userId) {
    throw new Error('Solo los capitanes de los equipos pueden abrir una disputa');
  }

  if (!['completed', 'scheduled'].includes(match.status)) {
    throw new Error('Solo se puede disputar un partido completado o programado');
  }

  const existing = await MatchDispute.findOne({ where: { matchId, status: 'open' } });
  if (existing) throw new Error('Ya hay una disputa abierta para este partido');

  const dispute = await MatchDispute.create({ matchId, raisedBy: userId, reason });
  await match.update({ status: 'disputed' });

  return dispute;
}

export async function resolveDispute(disputeId: number, resolvedBy: number, resolution: string, restoreStatus: string = 'completed') {
  const dispute = await MatchDispute.findByPk(disputeId);
  if (!dispute) throw new Error('Disputa no encontrada');
  if (dispute.status !== 'open') throw new Error('La disputa ya está resuelta');

  await dispute.update({ status: 'resolved', resolution, resolvedBy, resolvedAt: new Date() });
  await Match.update({ status: restoreStatus as any }, { where: { id: dispute.matchId } });

  return dispute;
}

export async function listOpenDisputes() {
  return MatchDispute.findAll({
    where: { status: 'open' },
    include: [
      { model: Match, as: 'match', include: [
        { model: Team, as: 'homeTeam', attributes: ['id', 'name'] },
        { model: Team, as: 'awayTeam', attributes: ['id', 'name'] },
      ]},
      { model: User, as: 'raisedByUser', attributes: ['id', 'firstName', 'lastName'] },
    ],
    order: [['createdAt', 'DESC']],
  });
}

export async function getMatchDispute(matchId: number) {
  return MatchDispute.findOne({
    where: { matchId },
    include: [
      { model: User, as: 'raisedByUser', attributes: ['id', 'firstName', 'lastName'] },
      { model: User, as: 'resolvedByUser', attributes: ['id', 'firstName', 'lastName'] },
    ],
    order: [['createdAt', 'DESC']],
  });
}
