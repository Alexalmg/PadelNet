import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { listUsers, getUser } from '../controllers/users.controller';
import { UserRole } from '../models';

const router = Router();

router.use(authenticateToken);
router.get('/', requireRole(UserRole.ADMIN), listUsers);
router.get('/:id', getUser);

export default router;
