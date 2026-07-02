import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { listTeams, getTeam, createTeam, addPlayer, removePlayer } from '../controllers/teams.controller';
import { invitePlayer } from '../controllers/team-invitations.controller';
import { requestJoin, respondJoinRequest } from '../controllers/team-join-requests.controller';
import { UserRole } from '../models';

const router = Router();

router.use(authenticateToken);
router.get('/', listTeams);
router.get('/:id', getTeam);
router.post('/', createTeam);
router.post('/:id/invite', requireRole(UserRole.CAPTAIN, UserRole.ADMIN), invitePlayer);
router.post('/:id/join-request', requestJoin);
router.post('/:id/join-request/:reqId/:action(accept|reject)', requireRole(UserRole.CAPTAIN, UserRole.ADMIN), respondJoinRequest);
router.post('/:id/players', requireRole(UserRole.CAPTAIN, UserRole.ADMIN), addPlayer);
router.delete('/:id/players/:userId', requireRole(UserRole.CAPTAIN, UserRole.ADMIN), removePlayer);

export default router;
