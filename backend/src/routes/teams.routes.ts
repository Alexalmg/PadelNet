import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { listTeams, getTeam, createTeam, addPlayer, removePlayer } from '../controllers/teams.controller';
import { UserRole } from '../models';

const router = Router();

router.use(authenticateToken);
router.get('/', listTeams);
router.get('/:id', getTeam);
router.post('/', createTeam);
router.post('/:id/players', requireRole(UserRole.CAPTAIN, UserRole.ADMIN), addPlayer);
router.delete('/:id/players/:userId', requireRole(UserRole.CAPTAIN, UserRole.ADMIN), removePlayer);

export default router;
