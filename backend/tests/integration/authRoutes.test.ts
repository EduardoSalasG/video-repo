import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import prisma from '../../src/config/database.ts';
import app from '../../src/app.ts';
import { generateToken } from '../../src/utils/token';

// Set JWT_SECRET if not set
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-secret';
}

async function createUser(role: string) {
  return prisma.user.create({
    data: {
      email: `${role.toLowerCase()}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}@test.com`,
      username: `${role.toLowerCase()}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,
      firstName: role,
      lastName: 'User',
      passwordHash: 'hashed',
      role: role as 'ADMIN' | 'INSTRUCTOR' | 'STUDENT',
    },
  });
}

describe('Auth Routes', () => {
  // Clean up database before each test (children before parents to respect
  // FK constraints, plus all related tables for full isolation)
  beforeEach(async () => {
    await prisma.userProgress.deleteMany();
    await prisma.videoMetadata.deleteMany();
    await prisma.section.deleteMany();
    await prisma.session.deleteMany();
    await prisma.module.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          username: 'testuser',
          firstName: 'Test',
          lastName: 'User',
          password: 'password123',
        })
        .expect(201);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe('test@example.com');
    });

    it('should return 409 if user already exists', async () => {
      // Create a user first
      await prisma.user.create({
        data: {
          email: 'test@example.com',
          username: 'testuser',
          firstName: 'Test',
          lastName: 'User',
          passwordHash: 'hashed',
          role: 'STUDENT',
        },
      });

      const res = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          username: 'testuser2',
          firstName: 'Test2',
          lastName: 'User2',
          password: 'password123',
        })
        .expect(409);

      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      // Create a user with known password
      const { hashPassword } = await import('../../src/utils/password');
      const passwordHash = await hashPassword('password123');

      await prisma.user.create({
        data: {
          email: 'test@example.com',
          username: 'testuser',
          firstName: 'Test',
          lastName: 'User',
          passwordHash,
          role: 'STUDENT',
        },
      });

      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(200);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe('test@example.com');
    });

    it('should return 401 for invalid credentials', async () => {
      await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrong',
        })
        .expect(401);
    });
  });

  describe('POST /auth/magic-link', () => {
    it('should return success message', async () => {
      const res = await request(app)
        .post('/auth/magic-link')
        .send({
          email: 'test@example.com',
        })
        .expect(200);

      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toContain('magic link');
    });
  });

  describe('GET /auth/me', () => {
    it('returns the authenticated user', async () => {
      const user = await createUser('STUDENT');
      const res = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${generateToken({ userId: user.id }, process.env.JWT_SECRET!)}`);
      expect(res.status).toBe(200);
      expect(res.body.user).toMatchObject({
        id: user.id,
        email: user.email,
        role: 'STUDENT',
      });
    });

    it('rejects unauthenticated requests', async () => {
      const res = await request(app).get('/auth/me');
      expect(res.status).toBe(401);
    });
  });
});