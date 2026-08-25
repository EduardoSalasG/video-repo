import { describe, it, expect, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import prisma from '../../src/config/database.ts';
import app from '../../src/app.ts';
import { generateToken } from '../../src/utils/token';

// Set JWT_SECRET if not set
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-secret';
}

const jwtSecret = process.env.JWT_SECRET;

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

// Create a fresh user and return a valid auth header for them
async function createToken(role: string): Promise<string> {
  const user = await createUser(role);
  return `Bearer ${generateToken({ userId: user.id }, jwtSecret!, '1h')}`;
}

describe('Progress Routes', () => {
  let testModuleId: string;
  let testSectionId: string;

  beforeEach(async () => {
    // Clear progress-related data before each test (children before parents
    // to respect FK constraints, plus all related tables for full isolation)
    await prisma.userProgress.deleteMany();
    await prisma.videoMetadata.deleteMany();
    await prisma.section.deleteMany();
    await prisma.module.deleteMany();
    await prisma.course.deleteMany();
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();

    // Create a test module and section to use for progress operations
    const course = await prisma.course.create({
      data: { name: 'Test Course' }
    });
    const module = await prisma.module.create({
      data: { title: 'Test Module', orderIndex: 0, courseId: course.id },
    });
    testModuleId = module.id;

    const section = await prisma.section.create({
      data: {
        moduleId: module.id,
        title: 'Test Section',
        orderIndex: 0,
      },
    });
    testSectionId = section.id;
  });

  afterAll(async () => {
    await prisma.userProgress.deleteMany();
    await prisma.$disconnect();
  });

  describe('GET /sections/:sectionId/progress', () => {
    it('should return progress for a section when it exists', async () => {
      const token = await createToken('STUDENT');

      await request(app)
        .patch(`/sections/${testSectionId}/progress`)
        .set('Authorization', token)
        .send({ lastPositionSeconds: 42 })
        .expect(200);

      const response = await request(app)
        .get(`/sections/${testSectionId}/progress`)
        .set('Authorization', token)
        .expect(200);

      expect(response.body).toHaveProperty('sectionId');
      expect(response.body.sectionId).toBe(testSectionId);
      expect(response.body.lastPositionSeconds).toBe(42);
    });

    it('should return 404 when the user has no progress for the section', async () => {
      const token = await createToken('STUDENT');

      await request(app)
        .get(`/sections/${testSectionId}/progress`)
        .set('Authorization', token)
        .expect(404);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app)
        .get(`/sections/${testSectionId}/progress`)
        .expect(401);
    });
  });

  describe('PATCH /sections/:sectionId/progress', () => {
    it('should create progress on first update', async () => {
      const token = await createToken('STUDENT');

      const response = await request(app)
        .patch(`/sections/${testSectionId}/progress`)
        .set('Authorization', token)
        .send({ lastPositionSeconds: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.sectionId).toBe(testSectionId);
      expect(response.body.lastPositionSeconds).toBe(10);
    });

    it('should update existing progress', async () => {
      const token = await createToken('STUDENT');

      await request(app)
        .patch(`/sections/${testSectionId}/progress`)
        .set('Authorization', token)
        .send({ lastPositionSeconds: 10 })
        .expect(200);

      const response = await request(app)
        .patch(`/sections/${testSectionId}/progress`)
        .set('Authorization', token)
        .send({ lastPositionSeconds: 25 })
        .expect(200);

      expect(response.body.lastPositionSeconds).toBe(25);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app)
        .patch(`/sections/${testSectionId}/progress`)
        .send({ lastPositionSeconds: 10 })
        .expect(401);
    });

    it('should return 400 when the body is invalid', async () => {
      const token = await createToken('STUDENT');

      await request(app)
        .patch(`/sections/${testSectionId}/progress`)
        .set('Authorization', token)
        .send({ lastPositionSeconds: -5 }) // invalid: negative
        .expect(400);
    });

    it('should return 404 when the section does not exist', async () => {
      const token = await createToken('STUDENT');
      const fakeSectionId = '00000000-0000-0000-0000-000000000000';

      await request(app)
        .patch(`/sections/${fakeSectionId}/progress`)
        .set('Authorization', token)
        .send({ lastPositionSeconds: 10 })
        .expect(404);
    });
  });

  describe('PATCH /sections/:sectionId/progress/complete', () => {
    it('should mark progress complete', async () => {
      const token = await createToken('STUDENT');

      const response = await request(app)
        .patch(`/sections/${testSectionId}/progress/complete`)
        .set('Authorization', token)
        .send({})
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.sectionId).toBe(testSectionId);
      expect(response.body.completedAt).toBeTruthy();
    });

    it('should return 401 when not authenticated', async () => {
      await request(app)
        .patch(`/sections/${testSectionId}/progress/complete`)
        .send({})
        .expect(401);
    });

    it('should return 400 when the body is invalid', async () => {
      const token = await createToken('STUDENT');

      await request(app)
        .patch(`/sections/${testSectionId}/progress/complete`)
        .set('Authorization', token)
        .send({ completedAt: 'not-a-date' })
        .expect(400);
    });

    it('should return 404 when the section does not exist', async () => {
      const token = await createToken('STUDENT');
      const fakeSectionId = '00000000-0000-0000-0000-000000000000';

      await request(app)
        .patch(`/sections/${fakeSectionId}/progress/complete`)
        .set('Authorization', token)
        .send({})
        .expect(404);
    });
  });

  describe('GET /progress', () => {
    it('should return a paginated list of the user progress', async () => {
      const token = await createToken('STUDENT');

      await request(app)
        .patch(`/sections/${testSectionId}/progress`)
        .set('Authorization', token)
        .send({ lastPositionSeconds: 10 })
        .expect(200);

      const response = await request(app)
        .get('/progress')
        .set('Authorization', token)
        .expect(200);

      expect(response.body).toHaveProperty('progress');
      expect(response.body.progress).toHaveLength(1);
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination.total).toBe(1);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app)
        .get('/progress')
        .expect(401);
    });
  });
});