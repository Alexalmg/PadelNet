import { Request, Response } from 'express';
import { getNotifications, getCount } from '../services/notification.service';

export async function listNotifications(req: Request, res: Response): Promise<void> {
  const data = await getNotifications(req.user!.id, req.user!.role);
  res.json(data);
}

export async function countNotifications(req: Request, res: Response): Promise<void> {
  const count = await getCount(req.user!.id, req.user!.role);
  res.json({ count });
}
