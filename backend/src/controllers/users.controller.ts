import { Request, Response } from 'express';
import { User, TeamPlayer, Team, CaptainRequest } from '../models';

export async function listUsers(_req: Request, res: Response): Promise<void> {
  const users = await User.findAll({
    attributes: { exclude: ['password'] },
    include: [
      {
        model: TeamPlayer, as: 'teamMemberships', where: { isActive: true }, required: false,
        include: [{ model: Team, as: 'team', attributes: ['id', 'name'] }],
      },
    ],
    order: [['createdAt', 'DESC']],
  });
  res.json({ users });
}

export async function getUser(req: Request, res: Response): Promise<void> {
  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: ['password'] },
    include: [
      {
        model: TeamPlayer, as: 'teamMemberships', where: { isActive: true }, required: false,
        include: [{ model: Team, as: 'team', attributes: ['id', 'name', 'description'] }],
      },
      {
        model: CaptainRequest, as: 'captainRequests',
        order: [['createdAt', 'DESC']],
        limit: 1,
        separate: true,
      },
    ],
  });
  if (!user) { res.status(404).json({ error: 'Usuario no encontrado' }); return; }
  res.json({ user });
}
