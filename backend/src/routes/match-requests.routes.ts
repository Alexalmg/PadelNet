import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { requestMatch, getIncoming, getOutgoing, acceptRequest, rejectRequest } from '../controllers/match-requests.controller';
import { UserRole } from '../models';

const router = Router();
router.use(authenticateToken);
router.use(requireRole(UserRole.CAPTAIN, UserRole.ADMIN));

router.post('/', requestMatch);
router.get('/incoming', getIncoming);
router.get('/outgoing', getOutgoing);
router.post('/:id/accept', acceptRequest);
router.post('/:id/reject', rejectRequest);

export default router;
