import { Request, Response } from 'express';
import * as service from '../services/chat.service';

export async function getMessages(req: Request, res: Response): Promise<void> {
  const messages = await service.getMessages(parseInt(req.params.id));
  res.json({ messages });
}

export async function sendMessage(req: Request, res: Response): Promise<void> {
  try {
    const { content } = req.body;
    const message = await service.addMessage(parseInt(req.params.id), req.user!.id, content);
    res.status(201).json({ message });
  } catch (e: any) { res.status(400).json({ error: e.message }); }
}
