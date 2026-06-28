import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { listPayments, setPaid, setOverdue, setPending } from '../controllers/payments.controller';
import { UserRole } from '../models';

const router = Router();
router.use(authenticateToken, requireRole(UserRole.ADMIN));
router.get('/', listPayments);
router.post('/:teamId/season/:seasonId/paid', setPaid);
router.post('/:teamId/season/:seasonId/overdue', setOverdue);
router.post('/:teamId/season/:seasonId/pending', setPending);

export default router;
