import { Request, Response } from 'express';
import { Match, Team, TeamPlayer, Lineup, MatchResult, UserRole } from '../models';

export async function setLineup(req: Request, res: Response): Promise<void> {
  const matchId = parseInt(req.params.id);
  const { player1Id, player2Id, teamId: bodyTeamId } = req.body;

  if (!player1Id || !player2Id) {
    res.status(400).json({ error: 'Se requieren player1Id y player2Id' }); return;
  }
  if (parseInt(player1Id) === parseInt(player2Id)) {
    res.status(400).json({ error: 'Los dos jugadores deben ser distintos' }); return;
  }

  const match = await Match.findByPk(matchId, {
    include: [
      { model: Team, as: 'homeTeam' },
      { model: Team, as: 'awayTeam' },
    ],
  });
  if (!match) { res.status(404).json({ error: 'Partido no encontrado' }); return; }

  const user = req.user!;
  const homeTeam = (match as any).homeTeam as Team;
  const awayTeam = (match as any).awayTeam as Team;

  let teamId: number;
  if (user.role === UserRole.ADMIN) {
    teamId = parseInt(bodyTeamId);
    if (!teamId) { res.status(400).json({ error: 'Admin debe especificar teamId' }); return; }
    if (teamId !== match.homeTeamId && teamId !== match.awayTeamId) {
      res.status(400).json({ error: 'El equipo no participa en este partido' }); return;
    }
  } else if (homeTeam?.captainId === user.id) {
    teamId = match.homeTeamId;
  } else if (awayTeam?.captainId === user.id) {
    teamId = match.awayTeamId;
  } else {
    res.status(403).json({ error: 'Solo el capitán puede asignar la alineación' }); return;
  }

  const members = await TeamPlayer.findAll({ where: { teamId } });
  const memberIds = members.map(m => m.userId);
  const p1 = parseInt(player1Id);
  const p2 = parseInt(player2Id);
  if (!memberIds.includes(p1) || !memberIds.includes(p2)) {
    res.status(400).json({ error: 'Ambos jugadores deben pertenecer al equipo' }); return;
  }

  await Lineup.destroy({ where: { matchId, teamId } });
  const lineup = await Lineup.create({ matchId, teamId, pairNumber: 1, player1Id: p1, player2Id: p2 });

  res.json({ lineup });
}

export async function submitResults(req: Request, res: Response): Promise<void> {
  const matchId = parseInt(req.params.id);
  const { sets } = req.body;

  if (!Array.isArray(sets) || sets.length === 0) {
    res.status(400).json({ error: 'Se requiere al menos un set' }); return;
  }

  const match = await Match.findByPk(matchId, {
    include: [
      { model: Team, as: 'homeTeam' },
      { model: Team, as: 'awayTeam' },
      { model: Lineup, as: 'lineups' },
    ],
  });
  if (!match) { res.status(404).json({ error: 'Partido no encontrado' }); return; }

  if (!['scheduled', 'in_progress'].includes(match.status)) {
    res.status(400).json({ error: `No se pueden enviar resultados con estado "${match.status}"` }); return;
  }

  const user = req.user!;
  const homeTeam = (match as any).homeTeam as Team;
  const awayTeam = (match as any).awayTeam as Team;
  const lineups = ((match as any).lineups || []) as Lineup[];

  const isAdmin = user.role === UserRole.ADMIN;
  const isHomeCap = homeTeam?.captainId === user.id;
  const isAwayCap = awayTeam?.captainId === user.id;
  const lineupPlayerIds = lineups.flatMap((l: Lineup) => [l.player1Id, l.player2Id]);
  const isLineupPlayer = lineupPlayerIds.includes(user.id);

  if (!isAdmin && !isHomeCap && !isAwayCap && !isLineupPlayer) {
    res.status(403).json({ error: 'No tienes permiso para enviar el resultado de este partido' }); return;
  }

  await MatchResult.destroy({ where: { matchId } });
  for (let i = 0; i < sets.length; i++) {
    const { homeScore, awayScore } = sets[i];
    if (homeScore == null || awayScore == null) {
      res.status(400).json({ error: `Set ${i + 1} incompleto` }); return;
    }
    await MatchResult.create({
      matchId,
      gameNumber: i + 1,
      homeTeamScore: parseInt(homeScore),
      awayTeamScore: parseInt(awayScore),
    });
  }

  if (match.status === 'scheduled') {
    await match.update({ status: 'in_progress' });
  }

  res.json({ message: 'Resultado enviado. Los capitanes deben confirmar.' });
}
