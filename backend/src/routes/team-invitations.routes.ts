import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { getMyInvitations, respondInvitation } from '../controllers/team-invitations.controller';

const router = Router();
router.use(authenticateToken);

router.get('/mine', getMyInvitations);
router.post('/:id/:action(accept|decline)', respondInvitation);

export default router;
