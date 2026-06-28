import { MatchMessage, User } from '../models';

export async function getMessages(matchId: number) {
  return MatchMessage.findAll({
    where: { matchId },
    include: [{ model: User, as: 'author', attributes: ['id', 'firstName', 'lastName', 'role'] }],
    order: [['createdAt', 'ASC']],
  });
}

export async function addMessage(matchId: number, userId: number, content: string) {
  if (!content?.trim()) throw new Error('El mensaje no puede estar vacío');

  const msg = await MatchMessage.create({ matchId, userId, content: content.trim() });
  const full = await MatchMessage.findByPk(msg.id, {
    include: [{ model: User, as: 'author', attributes: ['id', 'firstName', 'lastName', 'role'] }],
  });
  return full;
}
