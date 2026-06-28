import { Request, Response } from 'express';
import { League, User, Division, Season } from '../models';

export async function listLeagues(_req: Request, res: Response): Promise<void> {
  const leagues = await League.findAll({
    where: { isActive: true },
    include: [{ model: User, as: 'admin', attributes: ['id', 'firstName', 'lastName', 'email'] }],
    order: [['createdAt', 'DESC']],
  });
  res.json({ leagues });
}

export async function getLeague(req: Request, res: Response): Promise<void> {
  const league = await League.findByPk(req.params.id, {
    include: [
      { model: User, as: 'admin', attributes: ['id', 'firstName', 'lastName', 'email'] },
      {
        model: Division, as: 'divisions',
        include: [{ model: Season, as: 'seasons' }],
      },
    ],
  });
  if (!league) { res.status(404).json({ error: 'Liga no encontrada' }); return; }
  res.json({ league });
}

export async function createLeague(req: Request, res: Response): Promise<void> {
  const { name, description } = req.body;
  if (!name) { res.status(400).json({ error: 'El nombre es obligatorio' }); return; }
  const league = await League.create({ name, description, adminId: req.user!.id });
  res.status(201).json({ league });
}
