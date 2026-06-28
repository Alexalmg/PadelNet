import { UserRole, Team, CaptainRequest, MatchRequest, User, Match, MatchDispute, MatchProposal } from '../models';

export async function getNotifications(userId: number, role: UserRole) {
  if (role === UserRole.ADMIN) {
    const captainReqs = await CaptainRequest.findAll({
      where: { status: 'pending' },
      include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] }],
      order: [['createdAt', 'DESC']],
    });
    const disputes = await MatchDispute.findAll({
      where: { status: 'open' },
      include: [
        { model: Match, as: 'match', include: [
          { model: Team, as: 'homeTeam', attributes: ['id', 'name'] },
          { model: Team, as: 'awayTeam', attributes: ['id', 'name'] },
        ]},
        { model: User, as: 'raisedByUser', attributes: ['id', 'firstName', 'lastName'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    return { type: 'admin', captainRequests: captainReqs, matchRequests: [], disputes };
  }

  if (role === UserRole.CAPTAIN) {
    const team = await Team.findOne({ where: { captainId: userId, isActive: true } });
    if (!team) return { type: 'captain', captainRequests: [], matchRequests: [], proposals: [], disputes: [] };

    const matchReqs = await MatchRequest.findAll({
      where: { opposingTeamId: team.id, status: 'pending' },
      include: [
        { model: Team, as: 'requestingTeam', attributes: ['id', 'name'],
          include: [{ model: User, as: 'captain', attributes: ['id', 'firstName', 'lastName'] }] },
      ],
      order: [['createdAt', 'DESC']],
    });

    // Proposals where this captain needs to respond (other team proposed)
    const myMatches = await Match.findAll({
      where: { status: 'proposed' },
      attributes: ['id', 'homeTeamId', 'awayTeamId'],
    });
    const pendingProposals: MatchProposal[] = [];
    for (const m of myMatches) {
      const isInvolved = m.homeTeamId === team.id || m.awayTeamId === team.id;
      if (!isInvolved) continue;
      const proposal = await MatchProposal.findOne({
        where: { matchId: m.id, status: 'pending' },
      });
      if (proposal && proposal.proposingTeamId !== team.id) {
        pendingProposals.push(proposal);
      }
    }

    return { type: 'captain', captainRequests: [], matchRequests: matchReqs, proposals: pendingProposals, disputes: [] };
  }

  const myReq = await CaptainRequest.findOne({
    where: { userId },
    order: [['createdAt', 'DESC']],
  });
  return { type: 'player', captainRequests: myReq ? [myReq] : [], matchRequests: [], proposals: [], disputes: [] };
}

export async function getCount(userId: number, role: UserRole): Promise<number> {
  if (role === UserRole.ADMIN) {
    const captainCount = await CaptainRequest.count({ where: { status: 'pending' } });
    const disputeCount = await MatchDispute.count({ where: { status: 'open' } });
    return captainCount + disputeCount;
  }

  if (role === UserRole.CAPTAIN) {
    const team = await Team.findOne({ where: { captainId: userId, isActive: true } });
    if (!team) return 0;
    const matchReqCount = await MatchRequest.count({ where: { opposingTeamId: team.id, status: 'pending' } });

    const myMatches = await Match.findAll({
      where: { status: 'proposed' },
      attributes: ['id', 'homeTeamId', 'awayTeamId'],
    });
    let proposalCount = 0;
    for (const m of myMatches) {
      if (m.homeTeamId !== team.id && m.awayTeamId !== team.id) continue;
      const proposal = await MatchProposal.findOne({ where: { matchId: m.id, status: 'pending' } });
      if (proposal && proposal.proposingTeamId !== team.id) proposalCount++;
    }

    return matchReqCount + proposalCount;
  }

  return 0;
}
