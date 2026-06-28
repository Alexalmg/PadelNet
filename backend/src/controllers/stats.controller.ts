import { Request, Response } from 'express';
import * as service from '../services/stats.service';

export async function getStandings(req: Request, res: Response): Promise<void> {
  const seasonId = parseInt(req.params.seasonId);
  const standings = await service.getStandings(seasonId);
  res.json({ standings });
}

export async function getPlayerStats(req: Request, res: Response): Promise<void> {
  const userId = parseInt(req.params.userId);
  const seasonId = req.query.seasonId ? parseInt(req.query.seasonId as string) : undefined;
  const stats = await service.getPlayerStats(userId, seasonId);
  res.json({ stats });
}

export async function getMyStats(req: Request, res: Response): Promise<void> {
  const seasonId = req.query.seasonId ? parseInt(req.query.seasonId as string) : undefined;
  const stats = await service.getPlayerStats(req.user!.id, seasonId);
  res.json({ stats });
}
