import express from 'express';
import auth from './auth';
import ads from './ads';
import uploads from './uploads';
import { authMiddleware, AuthRequest } from './middleware';

const router = express.Router();

router.use('/auth', auth);
router.use('/ads', ads);
router.use('/uploads', uploads);

router.get('/me', authMiddleware, (req: AuthRequest, res) => {
  res.json({ user: req.user });
});

export default router;
