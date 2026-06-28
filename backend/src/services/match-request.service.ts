import { MatchRequest, Match, Team, User } from '../models';

export async function createRequest(
  requestingTeamId: number,
  opposingTeamId: number,
  seasonId: number,
  weekNumber: number,
  proposedDate: Date,
  message?: string,
) {
  if (requestingTeamId === opposingTeamId) throw new Error('No puedes solicitar partido contra tu propio equipo');

  const existing = await MatchRequest.findOne({
    where: { requestingTeamId, opposingTeamId, seasonId, weekNumber, status: 'pending' },
  });
  if (existing) throw new Error('Ya existe una solicitud pendiente para esta jornada contra ese equipo');

  return MatchRequest.create({
    requestingTeamId,
    opposingTeamId,
    seasonId,
    weekNumber,
    proposedDate,
    message,
  });
}

export async function getIncoming(teamId: number) {
  return MatchRequest.findAll({
    where: { opposingTeamId: teamId, status: 'pending' },
    include: [
      { model: Team, as: 'requestingTeam', attributes: ['id', 'name'],
        include: [{ model: User, as: 'captain', attributes: ['id', 'firstName', 'lastName'] }] },
      { model: Team, as: 'opposingTeam', attributes: ['id', 'name'] },
    ],
    order: [['createdAt', 'DESC']],
  });
}

export async function getOutgoing(teamId: number) {
  return MatchRequest.findAll({
    where: { requestingTeamId: teamId },
    include: [
      { model: Team, as: 'requestingTeam', attributes: ['id', 'name'] },
      { model: Team, as: 'opposingTeam', attributes: ['id', 'name'],
        include: [{ model: User, as: 'captain', attributes: ['id', 'firstName', 'lastName'] }] },
    ],
    order: [['createdAt', 'DESC']],
  });
}

export async function accept(id: number, userId: number) {
  const req = await MatchRequest.findByPk(id);
  if (!req) throw new Error('Solicitud no encontrada');
  if (req.status !== 'pending') throw new Error('Esta solicitud ya fue procesada');

  // Verificar que el usuario es capitán del equipo opuesto
  const opposingTeam = await Team.findByPk(req.opposingTeamId);
  if (!opposingTeam || opposingTeam.captainId !== userId) {
    throw new Error('No eres el capitán del equipo receptor');
  }

  await req.update({ status: 'accepted' });

  // Crear el partido
  const match = await Match.create({
    seasonId: req.seasonId,
    homeTeamId: req.requestingTeamId,
    awayTeamId: req.opposingTeamId,
    matchDate: req.proposedDate,
    weekNumber: req.weekNumber,
    status: 'scheduled',
  });

  return { req, match };
}

export async function reject(id: number, userId: number) {
  const req = await MatchRequest.findByPk(id);
  if (!req) throw new Error('Solicitud no encontrada');
  if (req.status !== 'pending') throw new Error('Esta solicitud ya fue procesada');

  const opposingTeam = await Team.findByPk(req.opposingTeamId);
  if (!opposingTeam || opposingTeam.captainId !== userId) {
    throw new Error('No eres el capitán del equipo receptor');
  }

  await req.update({ status: 'rejected' });
  return req;
}
