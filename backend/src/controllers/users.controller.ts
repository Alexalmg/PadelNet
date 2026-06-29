import { Request, Response } from 'express';
import { User, TeamPlayer, Team, CaptainRequest } from '../models';
import { PadelLevel, PreferredSide } from '../models/user.model';

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

export async function updateMyProfile(req: Request, res: Response): Promise<void> {
  const me = req.user!;
  const { username, profilePhotoUrl, bio, padelLevel, preferredSide, yearsPlaying, preferredCourt, phone } = req.body;

  if (username) {
    const taken = await User.findOne({ where: { username } });
    if (taken && taken.id !== me.id) {
      res.status(409).json({ error: 'Ese nombre de usuario ya está en uso' });
      return;
    }
  }

  await me.update({
    ...(username !== undefined     && { username }),
    ...(profilePhotoUrl !== undefined && { profilePhotoUrl }),
    ...(bio !== undefined          && { bio }),
    ...(padelLevel !== undefined   && { padelLevel: padelLevel as PadelLevel }),
    ...(preferredSide !== undefined && { preferredSide: preferredSide as PreferredSide }),
    ...(yearsPlaying !== undefined && { yearsPlaying: Number(yearsPlaying) }),
    ...(preferredCourt !== undefined && { preferredCourt }),
    ...(phone !== undefined        && { phone }),
    isProfileComplete: true,
  });

  const { password: _, ...safe } = me.toJSON() as unknown as Record<string, unknown>;
  res.json({ user: safe });
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
