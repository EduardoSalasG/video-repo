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
  let testModuleId: string;
  let testSectionId: string;

  beforeEach(async () => {
    // Clear content-related data before each test
    await prisma.section.deleteMany();
    await prisma.module.deleteMany();

    // Create a test module and section to use for content operations
    const module = await prisma.module.create({
      data: { title: 'Test Module', orderIndex: 0 },
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

  describe('GET /modules/:moduleId/sections/:sectionId/content', () => {
    it('should return markdown content for a section when authenticated as student', async () => {
      const token = await createToken('STUDENT');

      const response = await request(app)
        .get(`/modules/${testModuleId}/sections/${testSectionId}/content`)
        .set('Authorization', token)
        .expect(200);

      expect(response.body).toHaveProperty('markdownContent');
      expect(response.body.markdownContent).toBe('# Initial content');
    });

    it('should return 401 when not authenticated', async () => {
      await request(app)
        .get(`/modules/${testModuleId}/sections/${testSectionId}/content`)
        .expect(401);
    });

    it('should return 404 when section does not exist', async () => {
      const token = await createToken('STUDENT');
      const fakeSectionId = '00000000-0000-0000-0000-000000000000';

      await request(app)
        .get(`/modules/${testModuleId}/sections/${fakeSectionId}/content`)
        .set('Authorization', token)
        .expect(404);
    });
  });

  describe('PATCH /modules/:moduleId/sections/:sectionId/content', () => {
    it('should update markdown content when authenticated as instructor', async () => {
      const token = await createToken('INSTRUCTOR');
      const newContent = '# Updated content\\nThis is the updated markdown.';

      const response = await request(app)
        .patch(`/modules/${testModuleId}/sections/${testSectionId}/content`)
        .set('Authorization', token)
        .send({ markdownContent: newContent })
        .expect(200);

      expect(response.body).toHaveProperty('markdownContent');
      expect(response.body.markdownContent).toBe(newContent);
    });

    it('should return 403 when authenticated as student (insufficient permissions)', async () => {
      const token = await createToken('STUDENT');

      await request(app)
        .patch(`/modules/${testModuleId}/sections/${testSectionId}/content`)
        .set('Authorization', token)
        .send({ markdownContent: '# Updated' })
        .expect(403);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app)
        .patch(`/modules/${testModuleId}/sections/${testSectionId}/content`)
        .send({ markdownContent: '# Updated' })
        .expect(401);
    });

    it('should return 400 when markdown content is invalid', async () => {
      const token = await createToken('INSTRUCTOR');

      await request(app)
        .patch(`/modules/${testModuleId}/sections/${testSectionId}/content`)
        .set('Authorization', token)
        .send({ markdownContent: 123 }) // invalid type
        .expect(400);
    });

    it('should return 404 when section does not exist', async () => {
      const token = await createToken('INSTRUCTOR');
      const fakeSectionId = '00000000-0000-0000-0000-000000000000';

      await request(app)
        .patch(`/modules/${testModuleId}/sections/${fakeSectionId}/content`)
        .set('Authorization', token)
        .send({ markdownContent: '# Updated' })
        .expect(404);
    });
  });
});