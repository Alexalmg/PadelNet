import { Request, Response } from 'express';
import * as svc from '../services/captain-request.service';

export async function requestCaptain(req: Request, res: Response): Promise<void> {
  try {
    const result = await svc.createRequest(req.user!.id, req.body.message);
    res.status(201).json({ request: result });
  } catch (e: unknown) {
    res.status(400).json({ error: e instanceof Error ? e.message : 'Error' });
  }
}

export async function listPending(_req: Request, res: Response): Promise<void> {
  const requests = await svc.listPending();
  res.json({ requests });
}

export async function getMyRequest(req: Request, res: Response): Promise<void> {
  const request = await svc.getMyRequest(req.user!.id);
  res.json({ request });
}

export async function approveRequest(req: Request, res: Response): Promise<void> {
  try {
    const result = await svc.approve(parseInt(req.params.id), req.user!.id);
    res.json({ request: result, message: 'Capitanía aprobada' });
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
