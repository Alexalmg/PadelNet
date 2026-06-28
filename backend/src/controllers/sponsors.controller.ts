import { Request, Response } from 'express';
import * as service from '../services/sponsor.service';

export async function listSponsors(_req: Request, res: Response): Promise<void> {
  const sponsors = await service.listSponsors(true);
  res.json({ sponsors });
}

export async function listAllSponsors(_req: Request, res: Response): Promise<void> {
  const sponsors = await service.listSponsors(false);
  res.json({ sponsors });
}

export async function createSponsor(req: Request, res: Response): Promise<void> {
  try {
    const { name, logoUrl, websiteUrl, slot } = req.body;
    if (!name) { res.status(400).json({ error: 'El nombre es obligatorio' }); return; }
    const sponsor = await service.createSponsor({ name, logoUrl, websiteUrl, slot });
    res.status(201).json({ sponsor });
  } catch (e: any) { res.status(400).json({ error: e.message }); }
}

export async function updateSponsor(req: Request, res: Response): Promise<void> {
  try {
    const sponsor = await service.updateSponsor(parseInt(req.params.id), req.body);
    res.json({ sponsor });
  } catch (e: any) { res.status(400).json({ error: e.message }); }
}

export async function deleteSponsor(req: Request, res: Response): Promise<void> {
  try {
    await service.deleteSponsor(parseInt(req.params.id));
    res.json({ message: 'Patrocinador desactivado' });
  } catch (e: any) { res.status(400).json({ error: e.message }); }
}
