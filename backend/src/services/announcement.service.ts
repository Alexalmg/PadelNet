import { Announcement, User } from '../models';

export async function listAnnouncements(limit = 50) {
  return Announcement.findAll({
    include: [{ model: User, as: 'author', attributes: ['id', 'firstName', 'lastName'] }],
    order: [['isPinned', 'DESC'], ['createdAt', 'DESC']],
    limit,
  });
}

export async function createAnnouncement(
  title: string,
  content: string,
  authorId?: number,
  type: 'manual' | 'system' = 'manual'
) {
  return Announcement.create({ title, content, authorId, type });
}

export async function createSystemAnnouncement(title: string, content: string) {
  return Announcement.create({ title, content, type: 'system' });
}

export async function togglePin(id: number) {
  const ann = await Announcement.findByPk(id);
  if (!ann) throw new Error('Anuncio no encontrado');
  await ann.update({ isPinned: !ann.isPinned });
  return ann;
}

export async function deleteAnnouncement(id: number) {
  const ann = await Announcement.findByPk(id);
  if (!ann) throw new Error('Anuncio no encontrado');
  await ann.destroy();
}
