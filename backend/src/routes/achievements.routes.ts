import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { getAll, getMine, getForUser } from '../controllers/achievements.controller';

const router = Router();
router.use(authenticateToken);
router.get('/', getAll);
router.get('/mine', getMine);
router.get('/user/:userId', getForUser);

export default router;
