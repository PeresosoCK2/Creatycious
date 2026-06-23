import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'test_secret';
process.env.JWT_SECRET = JWT_SECRET;
process.env.DB_FILE = `data/uploads-test-${process.pid}.db`;

import { createApp } from './app';

describe('Uploads routes', () => {
  let app: express.Application;
  let token: string;

  beforeAll(async () => {
    app = createApp();

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'uploader@test.com', password: 'pass123', name: 'Uploader' });
    token = res.body.token;
  });

  describe('POST /api/uploads/sign', () => {
    it('should return an upload path and public URL for valid fileName', async () => {
      const res = await request(app)
        .post('/api/uploads/sign')
        .set('Authorization', `Bearer ${token}`)
        .send({ fileName: 'banner.png' });

      expect(res.status).toBe(200);
      expect(res.body.uploadPath).toBeDefined();
      expect(res.body.publicUrl).toBeDefined();
      expect(res.body.uploadPath).toContain('banner.png');
      expect(res.body.publicUrl).toContain('banner.png');
      expect(res.body.publicUrl).toMatch(/^\/uploads\//);
    });

    it('should generate unique paths for same fileName', async () => {
      const res1 = await request(app)
        .post('/api/uploads/sign')
        .set('Authorization', `Bearer ${token}`)
        .send({ fileName: 'duplicate.jpg' });

      const res2 = await request(app)
        .post('/api/uploads/sign')
        .set('Authorization', `Bearer ${token}`)
        .send({ fileName: 'duplicate.jpg' });

      expect(res1.body.uploadPath).not.toBe(res2.body.uploadPath);
      expect(res1.body.publicUrl).not.toBe(res2.body.publicUrl);
    });

    it('should return 400 if fileName is missing', async () => {
      const res = await request(app)
        .post('/api/uploads/sign')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('fileName required');
    });

    it('should return 401 without auth token', async () => {
      const res = await request(app)
        .post('/api/uploads/sign')
        .send({ fileName: 'test.png' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('no token provided');
    });

    it('should return 401 with invalid token', async () => {
      const res = await request(app)
        .post('/api/uploads/sign')
        .set('Authorization', 'Bearer badtoken')
        .send({ fileName: 'test.png' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('invalid token');
    });

    it('should handle filenames with special characters', async () => {
      const res = await request(app)
        .post('/api/uploads/sign')
        .set('Authorization', `Bearer ${token}`)
        .send({ fileName: 'my file (1).png' });

      expect(res.status).toBe(200);
      expect(res.body.publicUrl).toContain('my file (1).png');
    });

    it('should prefix with a random hex string', async () => {
      const res = await request(app)
        .post('/api/uploads/sign')
        .set('Authorization', `Bearer ${token}`)
        .send({ fileName: 'check-prefix.png' });

      // The path format should be: uploads/<32-hex-chars>-check-prefix.png
      const parts = res.body.publicUrl.split('/');
      const filename = parts[parts.length - 1];
      const hexPrefix = filename.split('-')[0];
      expect(hexPrefix).toMatch(/^[0-9a-f]{32}$/);
    });
  });
});
