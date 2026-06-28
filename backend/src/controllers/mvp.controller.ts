import { Request, Response } from 'express';
import * as service from '../services/mvp.service';

export async function castVote(req: Request, res: Response): Promise<void> {
  try {
    const { mvpUserId, ratedTeamId, fairPlayScore } = req.body;
    if (!mvpUserId || !ratedTeamId || !fairPlayScore) {
      res.status(400).json({ error: 'Faltan campos obligatorios' }); return;
    }
    const vote = await service.castVote(
      parseInt(req.params.id), req.user!.id, mvpUserId, ratedTeamId, fairPlayScore
    );
    res.status(201).json({ vote });
  } catch (e: any) { res.status(400).json({ error: e.message }); }
}

export async function getVotes(req: Request, res: Response): Promise<void> {
  const result = await service.getMatchVotes(parseInt(req.params.id));
  res.json(result);
}

export async function checkVoted(req: Request, res: Response): Promise<void> {
  const voted = await service.hasVoted(parseInt(req.params.id), req.user!.id);
  res.json({ voted });
}
