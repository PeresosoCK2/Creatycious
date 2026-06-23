import express from 'express';
import db from './db';
import { requireAuth, AuthenticatedRequest } from './middleware/auth';

const router = express.Router();

router.post('/', requireAuth, (req: AuthenticatedRequest, res) => {
  const { title, content_json } = req.body;
  if (!title) return res.status(400).json({ error: 'title required' });

  const stmt = db.prepare(`INSERT INTO ads (user_id, title, content_json) VALUES (?, ?, ?)`);
  const info = stmt.run(req.user!.id, title, JSON.stringify(content_json || {}));

  res.json({ id: info.lastInsertRowid, title, content_json });
});

router.get('/', requireAuth, (req: AuthenticatedRequest, res) => {
  const rows: any[] = db.prepare(
    `SELECT id, title, content_json, created_at, updated_at FROM ads WHERE user_id = ? ORDER BY id DESC`
  ).all(req.user!.id);
  res.json(rows.map(r => ({ ...r, content_json: JSON.parse(r.content_json) })));
});

router.get('/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const row: any = db.prepare(`SELECT * FROM ads WHERE id = ? AND user_id = ?`).get(req.params.id, req.user!.id);
  if (!row) return res.status(404).json({ error: 'not found' });
  row.content_json = JSON.parse(row.content_json);
  res.json(row);
});

router.put('/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const { title, content_json } = req.body;
  const stmt = db.prepare(
    `UPDATE ads SET title = ?, content_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`
  );
  const info = stmt.run(title, JSON.stringify(content_json || {}), req.params.id, req.user!.id);
  if (info.changes === 0) return res.status(404).json({ error: 'not found or no rights' });
  res.json({ id: req.params.id, title, content_json });
});

router.delete('/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const info = db.prepare(`DELETE FROM ads WHERE id = ? AND user_id = ?`).run(req.params.id, req.user!.id);
  if (info.changes === 0) return res.status(404).json({ error: 'not found' });
  res.json({ success: true });
});

export default router;
