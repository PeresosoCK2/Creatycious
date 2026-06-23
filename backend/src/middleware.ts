import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error(
    'JWT_SECRET environment variable is required. ' +
    'Set it to a strong random value (e.g. openssl rand -base64 32).'
  );
}

export interface AuthRequest extends Request {
  user?: { id: number; email: string; name: string };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'no token provided' });

  const token = header.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'malformed authorization header' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET!) as { id: number; email: string; name: string };
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'invalid token' });
  }
}

export { JWT_SECRET };
