import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'test_secret';
process.env.JWT_SECRET = JWT_SECRET;
process.env.DB_FILE = `data/ads-test-${process.pid}.db`;

import { createApp } from './app';

describe('Ads routes', () => {
  let app: express.Application;
  let token: string;
  let userId: number;

  beforeAll(async () => {
    app = createApp();

    // Register a user to get a token
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'adsuser@test.com', password: 'pass123', name: 'Ads User' });

    token = res.body.token;
    userId = res.body.user.id;
  });

  describe('Authentication middleware', () => {
    it('should return 401 when no token is provided', async () => {
      const res = await request(app).get('/api/ads');
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('no token provided');
    });

    it('should return 401 when an invalid token is provided', async () => {
      const res = await request(app)
        .get('/api/ads')
        .set('Authorization', 'Bearer invalidtoken123');
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('invalid token');
    });

    it('should return 401 when token is expired', async () => {
      const expiredToken = jwt.sign({ id: userId, email: 'adsuser@test.com' }, JWT_SECRET, { expiresIn: '-1s' });
      const res = await request(app)
        .get('/api/ads')
        .set('Authorization', `Bearer ${expiredToken}`);
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('invalid token');
    });
  });

  describe('POST /api/ads', () => {
    it('should create an ad with title and content_json', async () => {
      const res = await request(app)
        .post('/api/ads')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'My First Ad', content_json: { headline: 'Buy Now' } });

      expect(res.status).toBe(200);
      expect(res.body.id).toBeDefined();
      expect(res.body.title).toBe('My First Ad');
      expect(res.body.content_json).toEqual({ headline: 'Buy Now' });
    });

    it('should create an ad with title only (empty content_json)', async () => {
      const res = await request(app)
        .post('/api/ads')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Title Only Ad' });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Title Only Ad');
    });

    it('should return 400 if title is missing', async () => {
      const res = await request(app)
        .post('/api/ads')
        .set('Authorization', `Bearer ${token}`)
        .send({ content_json: { text: 'no title' } });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('title required');
    });
  });

  describe('GET /api/ads', () => {
    it('should list ads for authenticated user', async () => {
      const res = await request(app)
        .get('/api/ads')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].title).toBeDefined();
      expect(res.body[0].content_json).toBeDefined();
    });

    it('should return ads in descending order by id', async () => {
      const res = await request(app)
        .get('/api/ads')
        .set('Authorization', `Bearer ${token}`);

      const ids = res.body.map((a: any) => a.id);
      for (let i = 1; i < ids.length; i++) {
        expect(ids[i - 1]).toBeGreaterThan(ids[i]);
      }
    });

    it('should not return ads from other users', async () => {
      // Register another user
      const res2 = await request(app)
        .post('/api/auth/register')
        .send({ email: 'other@test.com', password: 'pass123', name: 'Other' });
      const otherToken = res2.body.token;

      const res = await request(app)
        .get('/api/ads')
        .set('Authorization', `Bearer ${otherToken}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(0);
    });
  });

  describe('GET /api/ads/:id', () => {
    let adId: number;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/ads')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Get Test Ad', content_json: { detail: 'info' } });
      adId = res.body.id;
    });

    it('should get a single ad by id', async () => {
      const res = await request(app)
        .get(`/api/ads/${adId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Get Test Ad');
      expect(res.body.content_json).toEqual({ detail: 'info' });
    });

    it('should return 404 for non-existent ad', async () => {
      const res = await request(app)
        .get('/api/ads/99999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('not found');
    });

    it('should return 404 when accessing another users ad', async () => {
      const res2 = await request(app)
        .post('/api/auth/register')
        .send({ email: 'sneaky@test.com', password: 'pass123' });
      const sneakyToken = res2.body.token;

      const res = await request(app)
        .get(`/api/ads/${adId}`)
        .set('Authorization', `Bearer ${sneakyToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/ads/:id', () => {
    let adId: number;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/ads')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Update Me', content_json: { old: true } });
      adId = res.body.id;
    });

    it('should update an ad', async () => {
      const res = await request(app)
        .put(`/api/ads/${adId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated Title', content_json: { new: true } });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Updated Title');
      expect(res.body.content_json).toEqual({ new: true });
    });

    it('should return 404 for non-existent ad', async () => {
      const res = await request(app)
        .put('/api/ads/99999')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Nope' });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('not found or no rights');
    });

    it('should not allow updating another users ad', async () => {
      const res2 = await request(app)
        .post('/api/auth/register')
        .send({ email: 'hacker@test.com', password: 'pass123' });
      const hackerToken = res2.body.token;

      const res = await request(app)
        .put(`/api/ads/${adId}`)
        .set('Authorization', `Bearer ${hackerToken}`)
        .send({ title: 'Hacked' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/ads/:id', () => {
    let adId: number;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/ads')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Delete Me', content_json: {} });
      adId = res.body.id;
    });

    it('should delete an ad', async () => {
      const res = await request(app)
        .delete(`/api/ads/${adId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 when deleting already deleted ad', async () => {
      const res = await request(app)
        .delete(`/api/ads/${adId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('not found');
    });

    it('should return 404 for non-existent ad', async () => {
      const res = await request(app)
        .delete('/api/ads/99999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    it('should not allow deleting another users ad', async () => {
      // Create ad first
      const createRes = await request(app)
        .post('/api/ads')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Protected Ad' });
      const protectedId = createRes.body.id;

      // Try to delete with another user
      const res2 = await request(app)
        .post('/api/auth/register')
        .send({ email: 'deleter@test.com', password: 'pass123' });
      const deleterToken = res2.body.token;

      const res = await request(app)
        .delete(`/api/ads/${protectedId}`)
        .set('Authorization', `Bearer ${deleterToken}`);

      expect(res.status).toBe(404);
    });
  });
});
