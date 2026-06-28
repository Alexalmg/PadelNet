import { Sponsor } from '../models';

export async function listSponsors(activeOnly = true) {
  const where: any = activeOnly ? { isActive: true } : {};
  return Sponsor.findAll({ where, order: [['slot', 'ASC'], ['name', 'ASC']] });
}

export async function createSponsor(data: {
  name: string;
  logoUrl?: string;
  websiteUrl?: string;
  slot?: string;
}) {
  return Sponsor.create(data);
}

export async function updateSponsor(id: number, data: Partial<{ name: string; logoUrl: string; websiteUrl: string; slot: string; isActive: boolean }>) {
  const sponsor = await Sponsor.findByPk(id);
  if (!sponsor) throw new Error('Patrocinador no encontrado');
  await sponsor.update(data);
  return sponsor;
}

export async function deleteSponsor(id: number) {
  const sponsor = await Sponsor.findByPk(id);
  if (!sponsor) throw new Error('Patrocinador no encontrado');
  await sponsor.update({ isActive: false });
}
