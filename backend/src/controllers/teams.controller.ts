import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Team, TeamPlayer, User, UserRole, Match, MatchResult, Penalty } from '../models';

export async function listTeams(_req: Request, res: Response): Promise<void> {
  const teams = await Team.findAll({
    where: { isActive: true },
    include: [
      { model: User, as: 'captain', attributes: ['id', 'firstName', 'lastName', 'email'] },
      {
        model: TeamPlayer, as: 'players', where: { isActive: true }, required: false,
        include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'role'] }],
      },
    ],
    order: [['name', 'ASC']],
  });
  res.json({ teams });
}

export async function getTeam(req: Request, res: Response): Promise<void> {
  const teamId = parseInt(req.params.id);

  const team = await Team.findByPk(teamId, {
    include: [
      { model: User, as: 'captain', attributes: ['id', 'firstName', 'lastName', 'email'] },
      {
        model: TeamPlayer, as: 'players', where: { isActive: true }, required: false,
        include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'role'] }],
      },
    ],
  });
  if (!team) { res.status(404).json({ error: 'Equipo no encontrado' }); return; }

  // Últimos 5 partidos
  const recentMatches = await Match.findAll({
    where: {
      [Op.or]: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
    },
    include: [
      { model: Team, as: 'homeTeam', attributes: ['id', 'name'] },
      { model: Team, as: 'awayTeam', attributes: ['id', 'name'] },
      { model: MatchResult, as: 'results' },
    ],
    order: [['matchDate', 'DESC']],
    limit: 5,
  });

  // Penalizaciones
  const penalties = await Penalty.findAll({ where: { teamId } });
  const totalPenaltyPoints = penalties.reduce((sum, p) => sum + p.points, 0);

  res.json({ team, recentMatches, penalties, totalPenaltyPoints });
}

export async function createTeam(req: Request, res: Response): Promise<void> {
  const user = req.user!;

  if (user.role === UserRole.PLAYER) {
    res.status(403).json({ error: 'Necesitas ser capitán para crear un equipo. Solicita la capitanía desde tu perfil.' });
    return;
  }

  const { name, description } = req.body;
  if (!name) { res.status(400).json({ error: 'El nombre es obligatorio' }); return; }

  if (user.role === UserRole.CAPTAIN) {
    const existing = await Team.findOne({ where: { captainId: user.id, isActive: true } });
    if (existing) { res.status(400).json({ error: 'Ya eres capitán de un equipo activo' }); return; }
  }

  const team = await Team.create({ name, description, captainId: user.id });
  await TeamPlayer.create({ teamId: team.id, userId: user.id });

  res.status(201).json({ team });
}

export async function addPlayer(req: Request, res: Response): Promise<void> {
  const { userId } = req.body;
  const teamId = parseInt(req.params.id);

  const team = await Team.findByPk(teamId);
  if (!team) { res.status(404).json({ error: 'Equipo no encontrado' }); return; }

  const requestingUser = req.user!;
  if (requestingUser.role === UserRole.CAPTAIN && team.captainId !== requestingUser.id) {
    res.status(403).json({ error: 'Solo puedes gestionar tu propio equipo' });
    return;
  }

  const [membership, created] = await TeamPlayer.findOrCreate({
    where: { teamId, userId },
    defaults: { teamId, userId },
  });
  if (!created) await membership.update({ isActive: true });

  res.json({ message: 'Jugador añadido', membership });
}

export async function removePlayer(req: Request, res: Response): Promise<void> {
  const teamId = parseInt(req.params.id);
  const userId = parseInt(req.params.userId);

  const team = await Team.findByPk(teamId);
  if (!team) { res.status(404).json({ error: 'Equipo no encontrado' }); return; }

  const requestingUser = req.user!;
  if (requestingUser.role === UserRole.CAPTAIN && team.captainId !== requestingUser.id) {
    res.status(403).json({ error: 'Solo puedes gestionar tu propio equipo' });
    return;
  }

  const membership = await TeamPlayer.findOne({ where: { teamId, userId } });
  if (!membership) { res.status(404).json({ error: 'Jugador no encontrado en el equipo' }); return; }

  await membership.update({ isActive: false });
  res.json({ message: 'Jugador eliminado' });
}
