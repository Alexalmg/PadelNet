import { Request, Response } from 'express';
import * as service from '../services/payment.service';

export async function listPayments(req: Request, res: Response): Promise<void> {
  const seasonId = req.query.seasonId ? parseInt(req.query.seasonId as string) : undefined;
  const payments = await service.listPayments(seasonId);
  res.json({ payments });
}

export async function setPaid(req: Request, res: Response): Promise<void> {
  try {
    const payment = await service.markPaid(parseInt(req.params.teamId), parseInt(req.params.seasonId));
    res.json({ payment });
  } catch (e: any) { res.status(400).json({ error: e.message }); }
}

export async function setOverdue(req: Request, res: Response): Promise<void> {
  try {
    const payment = await service.markOverdue(parseInt(req.params.teamId), parseInt(req.params.seasonId));
    res.json({ payment });
  } catch (e: any) { res.status(400).json({ error: e.message }); }
}

export async function setPending(req: Request, res: Response): Promise<void> {
  try {
    const payment = await service.markPending(parseInt(req.params.teamId), parseInt(req.params.seasonId));
    res.json({ payment });
  } catch (e: any) { res.status(400).json({ error: e.message }); }
}
