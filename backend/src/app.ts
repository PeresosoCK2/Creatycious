import express from 'express';
import cors from 'cors';
import routes from './routes';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api', routes);
  app.use('/uploads', express.static('uploads'));
  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  return app;
}
