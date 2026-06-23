import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'test_secret';
process.env.JWT_SECRET = JWT_SECRET;
process.env.DB_FILE = `data/auth-test-${process.pid}.db`;

import { createApp } from './app';

describe('Auth routes', () => {
  let app: express.Application;

  beforeAll(() => {
    app = createApp();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user and return token', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'new@test.com', password: 'pass123', name: 'New User' });

      expect(res.status).toBe(200);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe('new@test.com');
      expect(res.body.user.name).toBe('New User');
      expect(res.body.token).toBeDefined();

      const decoded: any = jwt.verify(res.body.token, JWT_SECRET);
      expect(decoded.email).toBe('new@test.com');
    });

    it('should register a user without name', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'noname@test.com', password: 'pass123' });

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe('noname@test.com');
      expect(res.body.token).toBeDefined();
    });

    it('should return 400 if email is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ password: 'pass123' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('email and password required');
    });

    it('should return 400 if password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@test.com' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('email and password required');
    });

    it('should return 400 if both email and password are missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('email and password required');
    });

    it('should return 409 for duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'new@test.com', password: 'pass123', name: 'Dup' });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe('email already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'new@test.com', password: 'pass123' });

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe('new@test.com');
      expect(res.body.token).toBeDefined();

      const decoded: any = jwt.verify(res.body.token, JWT_SECRET);
      expect(decoded.email).toBe('new@test.com');
    });

    it('should return 401 for wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'new@test.com', password: 'wrongpass' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('invalid credentials');
    });

    it('should return 401 for non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@test.com', password: 'pass123' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('invalid credentials');
    });

    it('should return 400 if email is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: 'pass123' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('email and password required');
    });

    it('should return 400 if password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'new@test.com' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('email and password required');
    });

    it('should return a token with 7d expiry', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'new@test.com', password: 'pass123' });

      const decoded: any = jwt.verify(res.body.token, JWT_SECRET);
      const expiresIn = decoded.exp - decoded.iat;
      expect(expiresIn).toBe(7 * 24 * 60 * 60); // 7 days in seconds
    });
  });
});
