import express from 'express';
import auth from './auth';
import ads from './ads';
import uploads from './uploads';

const router = express.Router();

router.use('/auth', auth);
router.use('/ads', ads);
router.use('/uploads', uploads);

router.get('/me', (req, res) => {
  res.json({ message: 'implement JWT middleware to return user info' });
});

export default router;
