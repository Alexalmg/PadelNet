import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Club, Match, Team } from '../models';

export async function listClubs(_req: Request, res: Response): Promise<void> {
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const clubs = await Club.findAll({
    where: { isActive: true },
    include: [{
      model: Match,
      as: 'matches',
      required: false,
      where: {
        matchDate: { [Op.between]: [now, nextWeek] },
        status: { [Op.in]: ['scheduled', 'proposed', 'pending_proposal'] },
      },
      include: [
        { model: Team, as: 'homeTeam', attributes: ['id', 'name'] },
        { model: Team, as: 'awayTeam', attributes: ['id', 'name'] },
      ],
      attributes: ['id', 'matchDate', 'status', 'homeTeamId', 'awayTeamId'],
    }],
    order: [['name', 'ASC']],
  });

  res.json({ clubs });
}

export async function createClub(req: Request, res: Response): Promise<void> {
  const { name, address, latitude, longitude, phone } = req.body;
  if (!name || !address || latitude == null || longitude == null) {
    res.status(400).json({ error: 'Nombre, dirección, latitud y longitud son obligatorios' }); return;
  }
  const club = await Club.create({ name, address, latitude: parseFloat(latitude), longitude: parseFloat(longitude), phone });
  res.status(201).json({ club });
}

export async function updateClub(req: Request, res: Response): Promise<void> {
  const club = await Club.findByPk(parseInt(req.params.id));
  if (!club) { res.status(404).json({ error: 'Club no encontrado' }); return; }
  const { name, address, latitude, longitude, phone, isActive } = req.body;
  await club.update({
    ...(name !== undefined && { name }),
    ...(address !== undefined && { address }),
    ...(latitude !== undefined && { latitude: parseFloat(latitude) }),
    ...(longitude !== undefined && { longitude: parseFloat(longitude) }),
    ...(phone !== undefined && { phone }),
    ...(isActive !== undefined && { isActive }),
  });
  res.json({ club });
}

export async function deleteClub(req: Request, res: Response): Promise<void> {
  const club = await Club.findByPk(parseInt(req.params.id));
  if (!club) { res.status(404).json({ error: 'Club no encontrado' }); return; }
  await club.update({ isActive: false });
  res.json({ message: 'Club desactivado' });
}
