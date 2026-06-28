import { Match, MatchProposal, Team } from '../models';

export async function proposeDate(
  matchId: number,
  userId: number,
  proposedDate: Date,
  location: string,
  message: string
) {
  const match = await Match.findByPk(matchId, {
    include: [
      { model: Team, as: 'homeTeam' },
      { model: Team, as: 'awayTeam' },
    ],
  });
  if (!match) throw new Error('Partido no encontrado');

  const homeTeam = (match as any).homeTeam as Team;
  const awayTeam = (match as any).awayTeam as Team;

  const isHomeCaptain = homeTeam.captainId === userId;
  const isAwayCaptain = awayTeam.captainId === userId;
  if (!isHomeCaptain && !isAwayCaptain) throw new Error('No eres capitán de ninguno de los equipos');

  if (!['pending_proposal', 'proposed'].includes(match.status)) {
    throw new Error(`No se puede proponer fecha en estado "${match.status}"`);
  }

  const proposingTeamId = isHomeCaptain ? homeTeam.id : awayTeam.id;

  if (match.status === 'proposed') {
    const active = await MatchProposal.findOne({ where: { matchId, status: 'pending' } });
    if (active) {
      if (active.proposingTeamId === proposingTeamId) {
        throw new Error('Ya hay una propuesta tuya pendiente de respuesta');
      }
      await active.update({ status: 'countered' });
    }
  }

  const proposal = await MatchProposal.create({
    matchId,
    proposingTeamId,
    proposedBy: userId,
    proposedDate,
    location,
    message,
  });

  await match.update({ status: 'proposed' });
  return proposal;
}

export async function acceptProposal(proposalId: number, userId: number) {
  const proposal = await MatchProposal.findByPk(proposalId, {
    include: [{ model: Match, as: 'match' }],
  });
  if (!proposal) throw new Error('Propuesta no encontrada');
  if (proposal.status !== 'pending') throw new Error('La propuesta ya no está pendiente');

  const match = await Match.findByPk(proposal.matchId, {
    include: [
      { model: Team, as: 'homeTeam' },
      { model: Team, as: 'awayTeam' },
    ],
  });
  if (!match) throw new Error('Partido no encontrado');

  const homeTeam = (match as any).homeTeam as Team;
  const awayTeam = (match as any).awayTeam as Team;
  const respondingTeamId = proposal.proposingTeamId === homeTeam.id ? awayTeam.id : homeTeam.id;
  const respondingTeam = respondingTeamId === homeTeam.id ? homeTeam : awayTeam;

  if (respondingTeam.captainId !== userId) throw new Error('Solo el capitán del otro equipo puede aceptar');

  await proposal.update({ status: 'accepted' });
  await match.update({
    status: 'scheduled',
    matchDate: proposal.proposedDate,
    location: proposal.location,
  });

  return { proposal, match };
}

export async function rejectProposal(proposalId: number, userId: number) {
  const proposal = await MatchProposal.findByPk(proposalId);
  if (!proposal) throw new Error('Propuesta no encontrada');
  if (proposal.status !== 'pending') throw new Error('La propuesta ya no está pendiente');

  const match = await Match.findByPk(proposal.matchId, {
    include: [
      { model: Team, as: 'homeTeam' },
      { model: Team, as: 'awayTeam' },
    ],
  });
  if (!match) throw new Error('Partido no encontrado');

  const homeTeam = (match as any).homeTeam as Team;
  const awayTeam = (match as any).awayTeam as Team;
  const respondingTeamId = proposal.proposingTeamId === homeTeam.id ? awayTeam.id : homeTeam.id;
  const respondingTeam = respondingTeamId === homeTeam.id ? homeTeam : awayTeam;

  if (respondingTeam.captainId !== userId) throw new Error('Solo el capitán del otro equipo puede rechazar');

  await proposal.update({ status: 'rejected' });
  await match.update({ status: 'pending_proposal' });

  return { proposal, match };
}

export async function getProposals(matchId: number) {
  return MatchProposal.findAll({
    where: { matchId },
    include: [
      { model: Team, as: 'proposingTeam', attributes: ['id', 'name'] },
    ],
    order: [['createdAt', 'DESC']],
  });
}
