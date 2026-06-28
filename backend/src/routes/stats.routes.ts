import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { getStandings, getPlayerStats, getMyStats } from '../controllers/stats.controller';

const router = Router();
router.use(authenticateToken);
router.get('/me', getMyStats);
router.get('/standings/:seasonId', getStandings);
router.get('/player/:userId', getPlayerStats);

export default router;
