import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { listLeagues, getLeague, createLeague } from '../controllers/leagues.controller';
import { UserRole } from '../models';

const router = Router();

router.use(authenticateToken);
router.get('/', listLeagues);
router.get('/:id', getLeague);
router.post('/', requireRole(UserRole.ADMIN), createLeague);

export default router;
