import { Router } from 'express';
import { body } from 'express-validator';
import { registerHandler, loginHandler, refreshHandler, profileHandler, verifyEmailHandler, resendVerificationHandler } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/register',
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').notEmpty(),
  body('lastName').notEmpty(),
  registerHandler
);

router.post('/login',
  body('email').isEmail(),
  body('password').notEmpty(),
  loginHandler
);

router.post('/refresh', refreshHandler);
router.get('/profile', authenticateToken, profileHandler);
router.get('/verify/:token', verifyEmailHandler);
router.post('/resend-verification', resendVerificationHandler);

export default router;
