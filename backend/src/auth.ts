import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from './db';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

router.post('/register', async (req, res, next) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  try {
    const password_hash = await bcrypt.hash(password, 10);
    const stmt = db.prepare('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)');
    const info = stmt.run(email, password_hash, name || null);
    const user = { id: info.lastInsertRowid, email, name };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user, token });
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'email already exists' });
    }
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  try {
    const row: Record<string, unknown> | undefined = db.prepare('SELECT id, email, password_hash, name FROM users WHERE email = ?').get(email) as Record<string, unknown> | undefined;
    if (!row) return res.status(401).json({ error: 'invalid credentials' });
    const match = await bcrypt.compare(password, row.password_hash as string);
    if (!match) return res.status(401).json({ error: 'invalid credentials' });
    const user = { id: row.id, email: row.email, name: row.name };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user, token });
  } catch (err) {
    next(err);
  }
});

export default router;
