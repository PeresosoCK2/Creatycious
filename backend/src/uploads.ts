import express from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { authMiddleware, AuthRequest } from './middleware';

const router = express.Router();

const UPLOADS_DIR = 'uploads';
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']);
const MAX_FILENAME_LENGTH = 200;

router.post('/sign', authMiddleware, (req: AuthRequest, res) => {
  const { fileName } = req.body;
  if (!fileName || typeof fileName !== 'string') {
    return res.status(400).json({ error: 'fileName required' });
  }

  if (fileName.length > MAX_FILENAME_LENGTH) {
    return res.status(400).json({ error: 'fileName too long' });
  }

  const baseName = path.basename(fileName);
  const ext = path.extname(baseName).toLowerCase();

  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return res.status(400).json({ error: 'file type not allowed' });
  }

  const unique = crypto.randomBytes(16).toString('hex');
  const safeFileName = `${unique}${ext}`;
  const uploadPath = path.join(UPLOADS_DIR, safeFileName);

  const resolvedPath = path.resolve(uploadPath);
  const resolvedUploadsDir = path.resolve(UPLOADS_DIR);
  if (!resolvedPath.startsWith(resolvedUploadsDir + path.sep)) {
    return res.status(400).json({ error: 'invalid file path' });
  }

  res.json({ uploadPath, publicUrl: `/uploads/${safeFileName}` });
});

export default router;
