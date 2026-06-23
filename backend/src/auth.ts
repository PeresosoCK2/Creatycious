import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import db from './db';
import { JWT_SECRET } from './middleware';

const router = express.Router();

const MIN_PASSWORD_LENGTH = 8;
const MAX_INPUT_LENGTH = 255;

router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password required' });
  }

  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'invalid input types' });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: 'invalid email format' });
  }

  if (email.length > MAX_INPUT_LENGTH) {
    return res.status(400).json({ error: 'email too long' });
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return res.status(400).json({ error: `password must be at least ${MIN_PASSWORD_LENGTH} characters` });
  }

  if (password.length > MAX_INPUT_LENGTH) {
    return res.status(400).json({ error: 'password too long' });
  }

  if (name && (typeof name !== 'string' || name.length > MAX_INPUT_LENGTH)) {
    return res.status(400).json({ error: 'invalid name' });
  }

  const sanitizedEmail = validator.normalizeEmail(email) || email;
  const sanitizedName = name ? validator.escape(validator.trim(name)) : null;

  const password_hash = await bcrypt.hash(password, 10);
  try {
    const stmt = db.prepare('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)');
    const info = stmt.run(sanitizedEmail, password_hash, sanitizedName);
    const user = { id: info.lastInsertRowid as number, email: sanitizedEmail, name: sanitizedName };
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET!, { expiresIn: '7d' });
    res.json({ user, token });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '';
    if (message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'email already exists' });
    }
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password required' });
  }

  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'invalid input types' });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: 'invalid email format' });
  }

  try {
    const row = db.prepare('SELECT id, email, password_hash, name FROM users WHERE email = ?').get(email) as
      | { id: number; email: string; password_hash: string; name: string }
      | undefined;
    if (!row) return res.status(401).json({ error: 'invalid credentials' });
    const match = await bcrypt.compare(password, row.password_hash);
    if (!match) return res.status(401).json({ error: 'invalid credentials' });
    const user = { id: row.id, email: row.email, name: row.name };
    const token = jwt.sign(user, JWT_SECRET!, { expiresIn: '7d' });
    res.json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
});

export default router;
