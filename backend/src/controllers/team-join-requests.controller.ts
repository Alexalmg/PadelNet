import { Request, Response } from 'express';
import { Team, TeamJoinRequest, TeamPlayer, UserRole } from '../models';

export async function requestJoin(req: Request, res: Response): Promise<void> {
  const user = req.user!;
  const teamId = parseInt(req.params.id);

  if (user.role !== UserRole.PLAYER) {
    res.status(403).json({ error: 'Solo los jugadores pueden solicitar unirse a un equipo' }); return;
  }

  const team = await Team.findByPk(teamId);
  if (!team || !team.isActive) { res.status(404).json({ error: 'Equipo no encontrado' }); return; }

  const alreadyMember = await TeamPlayer.findOne({ where: { teamId, userId: user.id, isActive: true } });
  if (alreadyMember) { res.status(400).json({ error: 'Ya eres miembro de este equipo' }); return; }

  const alreadyPending = await TeamJoinRequest.findOne({ where: { teamId, userId: user.id, status: 'pending' } });
  if (alreadyPending) { res.status(400).json({ error: 'Ya tienes una solicitud pendiente para este equipo' }); return; }

  const request = await TeamJoinRequest.create({ teamId, userId: user.id });
  res.status(201).json({ request, message: `Solicitud enviada al equipo ${team.name}` });
}

export async function respondJoinRequest(req: Request, res: Response): Promise<void> {
  const captain = req.user!;
  const teamId = parseInt(req.params.id);
  const reqId = parseInt(req.params.reqId);
  const { action } = req.params;

  const team = await Team.findByPk(teamId);
  if (!team) { res.status(404).json({ error: 'Equipo no encontrado' }); return; }
  if (captain.role === UserRole.CAPTAIN && team.captainId !== captain.id) {
    res.status(403).json({ error: 'Solo puedes gestionar tu propio equipo' }); return;
  }

  const joinReq = await TeamJoinRequest.findOne({ where: { id: reqId, teamId } });
  if (!joinReq) { res.status(404).json({ error: 'Solicitud no encontrada' }); return; }
  if (joinReq.status !== 'pending') { res.status(400).json({ error: 'Esta solicitud ya fue procesada' }); return; }

  if (action === 'accept') {
    await joinReq.update({ status: 'accepted' });
    const [membership, created] = await TeamPlayer.findOrCreate({
      where: { teamId, userId: joinReq.userId },
      defaults: { teamId, userId: joinReq.userId },
    });
    if (!created) await membership.update({ isActive: true });
    res.json({ message: 'Jugador añadido al equipo' });
  } else {
    await joinReq.update({ status: 'rejected' });
    res.json({ message: 'Solicitud rechazada' });
  }
}
