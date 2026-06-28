import { Request, Response } from 'express';
import * as service from '../services/achievement.service';

export async function getAll(_req: Request, res: Response): Promise<void> {
  const achievements = await service.getAllAchievements();
  res.json({ achievements });
}

export async function getMine(req: Request, res: Response): Promise<void> {
  const achievements = await service.getUserAchievements(req.user!.id);
  res.json({ achievements });
}

export async function getForUser(req: Request, res: Response): Promise<void> {
  const achievements = await service.getUserAchievements(parseInt(req.params.userId));
  res.json({ achievements });
}
