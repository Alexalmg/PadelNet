import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { listUsers, getUser, updateMyProfile } from '../controllers/users.controller';
import { UserRole } from '../models';

const router = Router();

router.use(authenticateToken);
router.get('/', requireRole(UserRole.ADMIN), listUsers);
router.put('/me', updateMyProfile);
router.get('/:id', getUser);

export default router;
