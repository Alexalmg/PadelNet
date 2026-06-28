import { Request, Response } from 'express';
import * as service from '../services/match-proposal.service';

export async function propose(req: Request, res: Response): Promise<void> {
  try {
    const { proposedDate, location, message } = req.body;
    if (!proposedDate) { res.status(400).json({ error: 'La fecha propuesta es obligatoria' }); return; }
    const proposal = await service.proposeDate(
      parseInt(req.params.id), req.user!.id, new Date(proposedDate), location, message
    );
    res.status(201).json({ proposal });
  } catch (e: any) { res.status(400).json({ error: e.message }); }
}

export async function accept(req: Request, res: Response): Promise<void> {
  try {
    const result = await service.acceptProposal(parseInt(req.params.proposalId), req.user!.id);
    res.json(result);
  } catch (e: any) { res.status(400).json({ error: e.message }); }
}

export async function reject(req: Request, res: Response): Promise<void> {
  try {
    const result = await service.rejectProposal(parseInt(req.params.proposalId), req.user!.id);
    res.json(result);
  } catch (e: any) { res.status(400).json({ error: e.message }); }
}

export async function getProposals(req: Request, res: Response): Promise<void> {
  const proposals = await service.getProposals(parseInt(req.params.id));
  res.json({ proposals });
}
