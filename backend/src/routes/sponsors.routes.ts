import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { listSponsors, listAllSponsors, createSponsor, updateSponsor, deleteSponsor } from '../controllers/sponsors.controller';
import { UserRole } from '../models';

const router = Router();
router.use(authenticateToken);
router.get('/', listSponsors);
router.get('/all', requireRole(UserRole.ADMIN), listAllSponsors);
router.post('/', requireRole(UserRole.ADMIN), createSponsor);
router.put('/:id', requireRole(UserRole.ADMIN), updateSponsor);
router.delete('/:id', requireRole(UserRole.ADMIN), deleteSponsor);

export default router;
