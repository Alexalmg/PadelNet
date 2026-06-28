import { Request, Response } from 'express';
import * as service from '../services/dispute.service';

export async function raiseDispute(req: Request, res: Response): Promise<void> {
  try {
    const { reason } = req.body;
    if (!reason) { res.status(400).json({ error: 'La razón es obligatoria' }); return; }
    const dispute = await service.raiseDispute(parseInt(req.params.id), req.user!.id, reason);
    res.status(201).json({ dispute });
  } catch (e: any) { res.status(400).json({ error: e.message }); }
}

export async function listDisputes(_req: Request, res: Response): Promise<void> {
  const disputes = await service.listOpenDisputes();
  res.json({ disputes });
}

export async function resolveDispute(req: Request, res: Response): Promise<void> {
  try {
    const { resolution, restoreStatus } = req.body;
    if (!resolution) { res.status(400).json({ error: 'La resolución es obligatoria' }); return; }
    const dispute = await service.resolveDispute(parseInt(req.params.id), req.user!.id, resolution, restoreStatus);
    res.json({ dispute });
  } catch (e: any) { res.status(400).json({ error: e.message }); }
}

export async function getMatchDispute(req: Request, res: Response): Promise<void> {
  const dispute = await service.getMatchDispute(parseInt(req.params.id));
  res.json({ dispute });
}
