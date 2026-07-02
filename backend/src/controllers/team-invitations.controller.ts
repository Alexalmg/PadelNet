import { Request, Response } from 'express';
import { Team, TeamInvitation, TeamPlayer, User, UserRole } from '../models';

export async function invitePlayer(req: Request, res: Response): Promise<void> {
  const captain = req.user!;
  const teamId = parseInt(req.params.id);
  const { username } = req.body;

  if (!username) { res.status(400).json({ error: 'El username es obligatorio' }); return; }

  const team = await Team.findByPk(teamId);
  if (!team || team.captainId !== captain.id) {
    res.status(403).json({ error: 'Solo puedes invitar a tu propio equipo' }); return;
  }

  const player = await User.findOne({ where: { username } });
  if (!player) { res.status(404).json({ error: `No existe ningún jugador con username "${username}"` }); return; }
  if (player.id === captain.id) { res.status(400).json({ error: 'No puedes invitarte a ti mismo' }); return; }

  const alreadyMember = await TeamPlayer.findOne({ where: { teamId, userId: player.id, isActive: true } });
  if (alreadyMember) { res.status(400).json({ error: 'Este jugador ya está en tu equipo' }); return; }

  const alreadyInvited = await TeamInvitation.findOne({ where: { teamId, invitedUserId: player.id, status: 'pending' } });
  if (alreadyInvited) { res.status(400).json({ error: 'Ya tienes una invitación pendiente para este jugador' }); return; }

  const invitation = await TeamInvitation.create({ teamId, invitedUserId: player.id, invitedBy: captain.id });
  res.status(201).json({ invitation, message: `Invitación enviada a ${player.firstName} ${player.lastName}` });
}

export async function getMyInvitations(req: Request, res: Response): Promise<void> {
  const invitations = await TeamInvitation.findAll({
    where: { invitedUserId: req.user!.id, status: 'pending' },
    include: [
      { model: Team, as: 'team', attributes: ['id', 'name'] },
      { model: User, as: 'inviter', attributes: ['id', 'firstName', 'lastName'] },
    ],
    order: [['createdAt', 'DESC']],
  });
  res.json({ invitations });
}

export async function respondInvitation(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const id = parseInt(req.params.id);
  const { action } = req.params;

  const inv = await TeamInvitation.findOne({ where: { id, invitedUserId: userId } });
  if (!inv) { res.status(404).json({ error: 'Invitación no encontrada' }); return; }
  if (inv.status !== 'pending') { res.status(400).json({ error: 'Esta invitación ya fue respondida' }); return; }

  if (action === 'accept') {
    await inv.update({ status: 'accepted' });
    const [membership, created] = await TeamPlayer.findOrCreate({
      where: { teamId: inv.teamId, userId },
      defaults: { teamId: inv.teamId, userId },
    });
    if (!created) await membership.update({ isActive: true });
    res.json({ message: 'Te has unido al equipo' });
  } else {
    await inv.update({ status: 'declined' });
    res.json({ message: 'Invitación rechazada' });
  }
}
