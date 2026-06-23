import express from 'express';
import db from './db';
import jwt from 'jsonwebtoken';

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

router.post('/', auth, (req: any, res: any) => {
  const { title, content_json } = req.body;
  if (!title) return res.status(400).json({ error: 'title required' });

  const stmt = db.prepare(`INSERT INTO ads (user_id, title, content_json) VALUES (?, ?, ?)`);
  const info = stmt.run(req.user.id, title, JSON.stringify(content_json || {}));

  res.json({ id: info.lastInsertRowid, title, content_json });
});

router.get('/', auth, (req: any, res: any) => {
  const rows: any[] = db.prepare(`SELECT id, title, content_json, created_at, updated_at FROM ads WHERE user_id = ? ORDER BY id DESC`).all(req.user.id);
  res.json(rows.map(r => ({ ...r, content_json: JSON.parse(r.content_json) })));
});

router.get('/:id', auth, (req: any, res: any) => {
  const row: any = db.prepare(`SELECT * FROM ads WHERE id = ? AND user_id = ?`).get(req.params.id, req.user.id);
  if (!row) return res.status(404).json({ error: 'not found' });
  row.content_json = JSON.parse(row.content_json);
  res.json(row);
});

router.put('/:id', auth, (req: any, res: any) => {
  const { title, content_json } = req.body;
  const stmt = db.prepare(`UPDATE ads SET title = ?, content_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`);
  const info = stmt.run(title, JSON.stringify(content_json || {}), req.params.id, req.user.id);
  if (info.changes === 0) return res.status(404).json({ error: 'not found or no rights' });
  res.json({ id: req.params.id, title, content_json });
});

router.delete('/:id', auth, (req: any, res: any) => {
  const info = db.prepare(`DELETE FROM ads WHERE id = ? AND user_id = ?`).run(req.params.id, req.user.id);
  if (info.changes === 0) return res.status(404).json({ error: 'not found' });
  res.json({ success: true });
});

export default router;
