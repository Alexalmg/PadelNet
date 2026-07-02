import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { listClubs, createClub, updateClub, deleteClub } from '../controllers/clubs.controller';
import { UserRole } from '../models';

const router = Router();
router.use(authenticateToken);

router.get('/', listClubs);
router.post('/', requireRole(UserRole.ADMIN), createClub);
router.put('/:id', requireRole(UserRole.ADMIN), updateClub);
router.delete('/:id', requireRole(UserRole.ADMIN), deleteClub);

export default router;
