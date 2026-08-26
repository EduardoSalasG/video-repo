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

describe('Content Routes', () => {
  let testCourseId: string;
  let testModuleId: string;
  let testSectionId: string;

  beforeEach(async () => {
    // Clear content-related data before each test (children before parents
    // to respect FK constraints, plus all related tables for full isolation)
    await prisma.userProgress.deleteMany();
    await prisma.videoMetadata.deleteMany();
    await prisma.section.deleteMany();
    await prisma.module.deleteMany();
    await prisma.course.deleteMany();
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();

    // Create a test course, module and section to use for content operations
    const course = await prisma.course.create({
      data: { name: 'Test Course' },
    });
    testCourseId = course.id;

    const module = await prisma.module.create({
      data: { title: 'Test Module', orderIndex: 0, courseId: course.id },
    });
    testModuleId = module.id;

    const section = await prisma.section.create({
      data: {
        moduleId: module.id,
        title: 'Test Section',
        orderIndex: 0,
        markdownContent: '# Initial content',
      },
    });
    testSectionId = section.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /courses/:courseId/modules/:moduleId/sections/:sectionId/content', () => {
    it('should return markdown content for a section when authenticated as student', async () => {
      const token = await createToken('STUDENT');

      const response = await request(app)
        .get(`/courses/${testCourseId}/modules/${testModuleId}/sections/${testSectionId}/content`)
        .set('Authorization', token)
        .expect(200);

      expect(response.body).toHaveProperty('markdownContent');
      expect(response.body.markdownContent).toBe('# Initial content');
    });

    it('should return 401 when not authenticated', async () => {
      await request(app)
        .get(`/courses/${testCourseId}/modules/${testModuleId}/sections/${testSectionId}/content`)
        .expect(401);
    });

    it('should return 404 when section does not exist', async () => {
      const token = await createToken('STUDENT');
      const fakeSectionId = '00000000-0000-0000-0000-000000000000';

      await request(app)
        .get(`/courses/${testCourseId}/modules/${testModuleId}/sections/${fakeSectionId}/content`)
        .set('Authorization', token)
        .expect(404);
    });
  });

  describe('PATCH /courses/:courseId/modules/:moduleId/sections/:sectionId/content', () => {
    it('should update markdown content when authenticated as instructor', async () => {
      const token = await createToken('INSTRUCTOR');
      const newContent = '# Updated content\nThis is the updated markdown.';

      const response = await request(app)
        .patch(`/courses/${testCourseId}/modules/${testModuleId}/sections/${testSectionId}/content`)
        .set('Authorization', token)
        .send({ markdownContent: newContent })
        .expect(200);

      expect(response.body).toHaveProperty('markdownContent');
      expect(response.body.markdownContent).toBe(newContent);
    });

    it('should return 403 when authenticated as student (insufficient permissions)', async () => {
      const token = await createToken('STUDENT');

      await request(app)
        .patch(`/courses/${testCourseId}/modules/${testModuleId}/sections/${testSectionId}/content`)
        .set('Authorization', token)
        .send({ markdownContent: '# Updated' })
        .expect(403);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app)
        .patch(`/courses/${testCourseId}/modules/${testModuleId}/sections/${testSectionId}/content`)
        .send({ markdownContent: '# Updated' })
        .expect(401);
    });

    it('should return 400 when markdown content is invalid', async () => {
      const token = await createToken('INSTRUCTOR');

      await request(app)
        .patch(`/courses/${testCourseId}/modules/${testModuleId}/sections/${testSectionId}/content`)
        .set('Authorization', token)
        .send({ markdownContent: 123 }) // invalid type
        .expect(400);
    });

    it('should return 404 when section does not exist', async () => {
      const token = await createToken('INSTRUCTOR');
      const fakeSectionId = '00000000-0000-0000-0000-000000000000';

      await request(app)
        .patch(`/courses/${testCourseId}/modules/${testModuleId}/sections/${fakeSectionId}/content`)
        .set('Authorization', token)
        .send({ markdownContent: '# Updated' })
        .expect(404);
    });
  });
});