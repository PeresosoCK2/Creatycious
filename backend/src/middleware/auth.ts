import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface AuthenticatedRequest extends Request {
  user?: { id: number; email: string; name: string };
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'no token provided' });

  const token = header.split(' ')[1];
  try {
    const user = jwt.verify(token, config.jwtSecret) as AuthenticatedRequest['user'];
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'invalid token' });
  }
}
