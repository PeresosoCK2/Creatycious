import express from 'express';
import db from './db';
import jwt from 'jsonwebtoken';

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

function safeParseJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

router.post('/', auth, (req, res, next) => {
  try {
    const { title, content_json } = req.body;
    const user = (req as Record<string, unknown>).user as { id: number };
    if (!title) return res.status(400).json({ error: 'title required' });

    const stmt = db.prepare('INSERT INTO ads (user_id, title, content_json) VALUES (?, ?, ?)');
    const info = stmt.run(user.id, title, JSON.stringify(content_json || {}));

    res.json({ id: info.lastInsertRowid, title, content_json });
  } catch (err) {
    next(err);
  }
});

router.get('/', auth, (req, res, next) => {
  try {
    const user = (req as Record<string, unknown>).user as { id: number };
    const rows = db.prepare('SELECT id, title, content_json, created_at, updated_at FROM ads WHERE user_id = ? ORDER BY id DESC').all(user.id) as Array<Record<string, unknown>>;
    res.json(rows.map(r => ({
      ...r,
      content_json: safeParseJson(r.content_json as string) ?? r.content_json
    })));
  } catch (err) {
    next(err);
  }
});

router.get('/:id', auth, (req, res, next) => {
  try {
    const user = (req as Record<string, unknown>).user as { id: number };
    const row = db.prepare('SELECT * FROM ads WHERE id = ? AND user_id = ?').get(req.params.id, user.id) as Record<string, unknown> | undefined;
    if (!row) return res.status(404).json({ error: 'not found' });
    row.content_json = safeParseJson(row.content_json as string) ?? row.content_json;
    res.json(row);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', auth, (req, res, next) => {
  try {
    const { title, content_json } = req.body;
    const user = (req as Record<string, unknown>).user as { id: number };
    const stmt = db.prepare('UPDATE ads SET title = ?, content_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?');
    const info = stmt.run(title, JSON.stringify(content_json || {}), req.params.id, user.id);
    if (info.changes === 0) return res.status(404).json({ error: 'not found or no rights' });
    res.json({ id: req.params.id, title, content_json });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', auth, (req, res, next) => {
  try {
    const user = (req as Record<string, unknown>).user as { id: number };
    const info = db.prepare('DELETE FROM ads WHERE id = ? AND user_id = ?').run(req.params.id, user.id);
    if (info.changes === 0) return res.status(404).json({ error: 'not found' });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
