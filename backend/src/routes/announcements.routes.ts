import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { listAnnouncements, createAnnouncement, togglePin, deleteAnnouncement } from '../controllers/announcements.controller';
import { UserRole } from '../models';

const router = Router();
router.use(authenticateToken);
router.get('/', listAnnouncements);
router.post('/', requireRole(UserRole.ADMIN), createAnnouncement);
router.put('/:id/pin', requireRole(UserRole.ADMIN), togglePin);
router.delete('/:id', requireRole(UserRole.ADMIN), deleteAnnouncement);

export default router;
