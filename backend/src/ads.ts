import express from 'express';
import validator from 'validator';
import db from './db';
import { authMiddleware, AuthRequest } from './middleware';

const router = express.Router();

const MAX_TITLE_LENGTH = 200;
const MAX_CONTENT_LENGTH = 10000;

router.post('/', authMiddleware, (req: AuthRequest, res) => {
  const { title, content_json } = req.body;

  if (!title || typeof title !== 'string') {
    return res.status(400).json({ error: 'title required' });
  }

  if (title.length > MAX_TITLE_LENGTH) {
    return res.status(400).json({ error: 'title too long' });
  }

  const sanitizedTitle = validator.escape(validator.trim(title));
  const contentStr = JSON.stringify(content_json || {});

  if (contentStr.length > MAX_CONTENT_LENGTH) {
    return res.status(400).json({ error: 'content too large' });
  }

  const stmt = db.prepare('INSERT INTO ads (user_id, title, content_json) VALUES (?, ?, ?)');
  const info = stmt.run(req.user!.id, sanitizedTitle, contentStr);

  res.json({ id: info.lastInsertRowid, title: sanitizedTitle, content_json });
});

router.get('/', authMiddleware, (req: AuthRequest, res) => {
  const rows = db.prepare(
    'SELECT id, title, content_json, created_at, updated_at FROM ads WHERE user_id = ? ORDER BY id DESC'
  ).all(req.user!.id) as Array<{ id: number; title: string; content_json: string; created_at: string; updated_at: string }>;
  res.json(rows.map(r => ({ ...r, content_json: JSON.parse(r.content_json) })));
});

router.get('/:id', authMiddleware, (req: AuthRequest, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'invalid id' });

  const row = db.prepare('SELECT * FROM ads WHERE id = ? AND user_id = ?').get(id, req.user!.id) as
    | { id: number; title: string; content_json: string; [key: string]: unknown }
    | undefined;
  if (!row) return res.status(404).json({ error: 'not found' });
  row.content_json = JSON.parse(row.content_json as string);
  res.json(row);
});

router.put('/:id', authMiddleware, (req: AuthRequest, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'invalid id' });

  const { title, content_json } = req.body;

  if (title && typeof title !== 'string') {
    return res.status(400).json({ error: 'invalid title' });
  }

  if (title && title.length > MAX_TITLE_LENGTH) {
    return res.status(400).json({ error: 'title too long' });
  }

  const sanitizedTitle = title ? validator.escape(validator.trim(title)) : undefined;
  const contentStr = JSON.stringify(content_json || {});

  if (contentStr.length > MAX_CONTENT_LENGTH) {
    return res.status(400).json({ error: 'content too large' });
  }

  const stmt = db.prepare(
    'UPDATE ads SET title = ?, content_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?'
  );
  const info = stmt.run(sanitizedTitle, contentStr, id, req.user!.id);
  if (info.changes === 0) return res.status(404).json({ error: 'not found or no rights' });
  res.json({ id, title: sanitizedTitle, content_json });
});

router.delete('/:id', authMiddleware, (req: AuthRequest, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'invalid id' });

  const info = db.prepare('DELETE FROM ads WHERE id = ? AND user_id = ?').run(id, req.user!.id);
  if (info.changes === 0) return res.status(404).json({ error: 'not found' });
  res.json({ success: true });
});

export default router;
