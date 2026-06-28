import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { listNotifications, countNotifications } from '../controllers/notifications.controller';

const router = Router();
router.use(authenticateToken);
router.get('/', listNotifications);
router.get('/count', countNotifications);

export default router;
