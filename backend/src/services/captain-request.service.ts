import { CaptainRequest, User, UserRole } from '../models';

export async function createRequest(userId: number, message?: string) {
  const existing = await CaptainRequest.findOne({ where: { userId, status: 'pending' } });
  if (existing) throw new Error('Ya tienes una solicitud pendiente');

  const user = await User.findByPk(userId);
  if (!user) throw new Error('Usuario no encontrado');
  if (user.role !== UserRole.PLAYER) throw new Error('Solo los jugadores pueden solicitar capitanía');

  return CaptainRequest.create({ userId, message });
}

export async function listPending() {
  return CaptainRequest.findAll({
    where: { status: 'pending' },
    include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] }],
    order: [['createdAt', 'ASC']],
  });
}

export async function getMyRequest(userId: number) {
  return CaptainRequest.findOne({
    where: { userId },
    order: [['createdAt', 'DESC']],
  });
}

export async function approve(id: number, adminId: number) {
  const req = await CaptainRequest.findByPk(id, {
    include: [{ model: User, as: 'user' }],
  });
  if (!req) throw new Error('Solicitud no encontrada');
  if (req.status !== 'pending') throw new Error('Esta solicitud ya fue procesada');

  await req.update({ status: 'approved', reviewedBy: adminId });
  await User.update({ role: UserRole.CAPTAIN }, { where: { id: req.userId } });

  return req;
}

export async function reject(id: number, adminId: number) {
  const req = await CaptainRequest.findByPk(id);
  if (!req) throw new Error('Solicitud no encontrada');
  if (req.status !== 'pending') throw new Error('Esta solicitud ya fue procesada');

  await req.update({ status: 'rejected', reviewedBy: adminId });
  return req;
}
