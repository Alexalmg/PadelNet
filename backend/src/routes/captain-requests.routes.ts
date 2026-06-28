import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { requestCaptain, listPending, getMyRequest, approveRequest, rejectRequest } from '../controllers/captain-requests.controller';
import { UserRole } from '../models';

const router = Router();
router.use(authenticateToken);

router.post('/', requestCaptain);
router.get('/mine', getMyRequest);
router.get('/', requireRole(UserRole.ADMIN), listPending);
router.post('/:id/approve', requireRole(UserRole.ADMIN), approveRequest);
router.post('/:id/reject', requireRole(UserRole.ADMIN), rejectRequest);

export default router;
