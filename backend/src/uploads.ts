import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

function auth(req: any, res: any, next: any) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'no token provided' });
  const token = header.split(' ')[1];
  try {
    const user = jwt.verify(token, JWT_SECRET);
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'invalid token' });
  }
}

const UPLOADS_DIR = 'uploads';
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

router.post('/sign', auth, (req, res) => {
  const { fileName } = req.body;
  if (!fileName) return res.status(400).json({ error: 'fileName required' });

  const unique = crypto.randomBytes(16).toString('hex');
  const finalFile = `${unique}-${fileName}`;
  const uploadPath = path.join(UPLOADS_DIR, finalFile);

  res.json({ uploadPath, publicUrl: `/uploads/${finalFile}` });
});

export default router;
