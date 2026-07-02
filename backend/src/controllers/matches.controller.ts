import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Match, Team, MatchResult, UserRole, MatchProposal, Lineup, User, PlayerStats } from '../models';
import { updateAfterMatch } from '../services/stats.service';
import { createSystemAnnouncement } from '../services/announcement.service';

export async function listMatches(req: Request, res: Response): Promise<void> {
  const where: any = {};
  if (req.query.month) {
    const [year, month] = (req.query.month as string).split('-').map(Number);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);
    where.matchDate = { [Op.between]: [start, end] };
  }
  if (req.query.status) where.status = req.query.status;
  if (req.query.teamId) {
    const teamId = parseInt(req.query.teamId as string);
    where[Op.or] = [{ homeTeamId: teamId }, { awayTeamId: teamId }];
  }

  const matches = await Match.findAll({
    where,
    include: [
      { model: Team, as: 'homeTeam', attributes: ['id', 'name', 'captainId'] },
      { model: Team, as: 'awayTeam', attributes: ['id', 'name', 'captainId'] },
      { model: MatchResult, as: 'results' },
    ],
    order: [['weekNumber', 'ASC'], ['matchDate', 'ASC']],
  });
  res.json({ matches });
}

export async function getMatch(req: Request, res: Response): Promise<void> {
  const match = await Match.findByPk(req.params.id, {
    include: [
      { model: Team, as: 'homeTeam', attributes: ['id', 'name', 'captainId'] },
      { model: Team, as: 'awayTeam', attributes: ['id', 'name', 'captainId'] },
      { model: MatchResult, as: 'results' },
      {
        model: MatchProposal, as: 'proposals',
        include: [{ model: Team, as: 'proposingTeam', attributes: ['id', 'name'] }],
        order: [['createdAt', 'DESC']],
        separate: true,
      },
      {
        model: Lineup, as: 'lineups',
        include: [
          {
            model: User, as: 'player1',
            attributes: ['id', 'firstName', 'lastName', 'username', 'padelLevel', 'preferredSide', 'yearsPlaying'],
            include: [{ model: PlayerStats, as: 'stats', separate: true, order: [['createdAt', 'DESC']], limit: 1 }],
          },
          {
            model: User, as: 'player2',
            attributes: ['id', 'firstName', 'lastName', 'username', 'padelLevel', 'preferredSide', 'yearsPlaying'],
            include: [{ model: PlayerStats, as: 'stats', separate: true, order: [['createdAt', 'DESC']], limit: 1 }],
          },
        ],
      },
    ],
  });
  if (!match) {
    res.status(404).json({ error: 'Partido no encontrado' });
    return;
  }
  res.json({ match });
}

export async function confirmMatch(req: Request, res: Response): Promise<void> {
  const match = await Match.findByPk(req.params.id, {
    include: [
      { model: Team, as: 'homeTeam' },
      { model: Team, as: 'awayTeam' },
      { model: MatchResult, as: 'results' },
    ],
  });
  if (!match) {
    res.status(404).json({ error: 'Partido no encontrado' });
    return;
  }

  if (!['scheduled', 'in_progress'].includes(match.status)) {
    res.status(400).json({ error: `No se puede confirmar un partido en estado "${match.status}"` });
    return;
  }

  const user = req.user!;
  const homeTeam = (match as any).homeTeam as Team;
  const awayTeam = (match as any).awayTeam as Team;

  if (user.role === UserRole.ADMIN) {
    await match.update({ homeTeamConfirmed: true, awayTeamConfirmed: true, status: 'completed' });
  } else if (homeTeam?.captainId === user.id) {
    await match.update({ homeTeamConfirmed: true });
  } else if (awayTeam?.captainId === user.id) {
    await match.update({ awayTeamConfirmed: true });
  } else {
    res.status(403).json({ error: 'No eres capitán de ninguno de los dos equipos' });
    return;
  }

  await match.reload();
  if (match.homeTeamConfirmed && match.awayTeamConfirmed && match.status !== 'completed') {
    await match.update({ status: 'completed' });
  }

  if (match.status === 'completed') {
    try {
      await updateAfterMatch(match.id);
      const results = (match as any).results as MatchResult[];
      let homeScore = 0, awayScore = 0;
      if (results) {
        for (const r of results) {
          if ((r as any).homeScore > (r as any).awayScore) homeScore++;
          else awayScore++;
        }
      }
      const scoreStr = results?.length ? `(${homeScore}-${awayScore})` : '';
      await createSystemAnnouncement(
        `Partido completado`,
        `${homeTeam.name} vs ${awayTeam.name} ${scoreStr} - resultado confirmado.`
      );
    } catch (e) {
      console.error('Error post-match processing:', e);
    }
  }

  res.json({ match });
}
