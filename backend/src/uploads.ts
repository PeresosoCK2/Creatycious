import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

function auth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'no token provided' });
  const token = header.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'malformed authorization header' });
  try {
    const user = jwt.verify(token, JWT_SECRET);
    (req as Record<string, unknown>).user = user;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'token expired' });
    }
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'invalid token' });
    }
    next(err);
  }
}

const UPLOADS_DIR = 'uploads';

try {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
} catch (err) {
  console.error('Failed to create uploads directory:', err);
  process.exit(1);
}

router.post('/sign', auth, (req, res, next) => {
  try {
    const { fileName } = req.body;
    if (!fileName) return res.status(400).json({ error: 'fileName required' });

    const unique = crypto.randomBytes(16).toString('hex');
    const finalFile = `${unique}-${fileName}`;
    const uploadPath = path.join(UPLOADS_DIR, finalFile);

    res.json({ uploadPath, publicUrl: `/uploads/${finalFile}` });
  } catch (err) {
    next(err);
  }
});

export default router;
