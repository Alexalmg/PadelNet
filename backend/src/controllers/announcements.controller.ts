import { Request, Response } from 'express';
import * as service from '../services/announcement.service';

export async function listAnnouncements(_req: Request, res: Response): Promise<void> {
  const announcements = await service.listAnnouncements();
  res.json({ announcements });
}

export async function createAnnouncement(req: Request, res: Response): Promise<void> {
  try {
    const { title, content } = req.body;
    if (!title || !content) { res.status(400).json({ error: 'Título y contenido son obligatorios' }); return; }
    const ann = await service.createAnnouncement(title, content, req.user!.id, 'manual');
    res.status(201).json({ announcement: ann });
  } catch (e: any) { res.status(400).json({ error: e.message }); }
}

export async function togglePin(req: Request, res: Response): Promise<void> {
  try {
    const ann = await service.togglePin(parseInt(req.params.id));
    res.json({ announcement: ann });
  } catch (e: any) { res.status(400).json({ error: e.message }); }
}

export async function deleteAnnouncement(req: Request, res: Response): Promise<void> {
  try {
    await service.deleteAnnouncement(parseInt(req.params.id));
    res.json({ message: 'Anuncio eliminado' });
  } catch (e: any) { res.status(400).json({ error: e.message }); }
}
