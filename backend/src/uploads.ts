import express from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { requireAuth, AuthenticatedRequest } from './middleware/auth';
import { config } from './config';

const router = express.Router();

fs.mkdirSync(config.uploadsDir, { recursive: true });

router.post('/sign', requireAuth, (req: AuthenticatedRequest, res) => {
  const { fileName } = req.body;
  if (!fileName) return res.status(400).json({ error: 'fileName required' });

  const unique = crypto.randomBytes(16).toString('hex');
  const finalFile = `${unique}-${fileName}`;
  const uploadPath = path.join(config.uploadsDir, finalFile);

  res.json({ uploadPath, publicUrl: `/uploads/${finalFile}` });
});

export default router;
