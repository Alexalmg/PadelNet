import { Request, Response } from 'express';
import { Team } from '../models';
import * as svc from '../services/match-request.service';

async function getMyTeam(userId: number) {
  return Team.findOne({ where: { captainId: userId, isActive: true } });
}

export async function requestMatch(req: Request, res: Response): Promise<void> {
  try {
    const { opposingTeamId, seasonId, weekNumber, proposedDate, message } = req.body;
    const myTeam = await getMyTeam(req.user!.id);
    if (!myTeam) {
      res.status(403).json({ error: 'No tienes un equipo activo como capitán' });
      return;
    }
    const result = await svc.createRequest(
      myTeam.id, opposingTeamId, seasonId, weekNumber, new Date(proposedDate), message,
    );
    res.status(201).json({ request: result });
  } catch (e: unknown) {
    res.status(400).json({ error: e instanceof Error ? e.message : 'Error' });
  }
}

export async function getIncoming(req: Request, res: Response): Promise<void> {
  const myTeam = await getMyTeam(req.user!.id);
  if (!myTeam) { res.json({ requests: [] }); return; }
  const requests = await svc.getIncoming(myTeam.id);
  res.json({ requests });
}

export async function getOutgoing(req: Request, res: Response): Promise<void> {
  const myTeam = await getMyTeam(req.user!.id);
  if (!myTeam) { res.json({ requests: [] }); return; }
  const requests = await svc.getOutgoing(myTeam.id);
  res.json({ requests });
}

export async function acceptRequest(req: Request, res: Response): Promise<void> {
  try {
    const result = await svc.accept(parseInt(req.params.id), req.user!.id);
    res.json({ request: result.req, match: result.match, message: 'Partido programado' });
  } catch (e: unknown) {
    res.status(400).json({ error: e instanceof Error ? e.message : 'Error' });
  }
}

export async function rejectRequest(req: Request, res: Response): Promise<void> {
  try {
    const result = await svc.reject(parseInt(req.params.id), req.user!.id);
    res.json({ request: result, message: 'Solicitud rechazada' });
  } catch (e: unknown) {
    res.status(400).json({ error: e instanceof Error ? e.message : 'Error' });
  }
}
