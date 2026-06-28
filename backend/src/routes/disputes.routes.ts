import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { listDisputes, resolveDispute } from '../controllers/disputes.controller';
import { UserRole } from '../models';

const router = Router();
router.use(authenticateToken);
router.get('/', requireRole(UserRole.ADMIN), listDisputes);
router.post('/:id/resolve', requireRole(UserRole.ADMIN), resolveDispute);

export default router;
