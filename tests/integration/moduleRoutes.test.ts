import { describe, it, expect, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import prisma from '../../src/config/database.ts';
import app from '../../src/index.ts';
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

describe('Module Routes', () => {
  beforeEach(async () => {
    await prisma.module.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Authentication guard', () => {
    it('should return 401 for unauthenticated GET /modules', async () => {
      await request(app).get('/modules').expect(401);
    });

    it('should return 401 for unauthenticated POST /modules', async () => {
      await request(app).post('/modules').send({ title: 'Test' }).expect(401);
    });

    it('should return 401 for unauthenticated PATCH /modules/:id', async () => {
      await request(app).patch('/modules/some-id').send({}).expect(401);
    });

    it('should return 401 for unauthenticated DELETE /modules/:id', async () => {
      await request(app).delete('/modules/some-id').expect(401);
    });
  });

  describe('Role authorization', () => {
    it('should forbid STUDENT from creating a module', async () => {
      const studentToken = await createToken('STUDENT');
      const res = await request(app)
        .post('/modules')
        .set('Authorization', studentToken)
        .send({ title: 'Student module' })
        .expect(403);

      expect(res.body.error).toContain('Forbidden');
    });

    it('should forbid STUDENT from updating a module', async () => {
      const studentToken = await createToken('STUDENT');
      await request(app)
        .patch('/modules/some-id')
        .set('Authorization', studentToken)
        .send({ title: 'Updated' })
        .expect(403);
    });

    it('should forbid STUDENT from deleting a module', async () => {
      const studentToken = await createToken('STUDENT');
      await request(app)
        .delete('/modules/some-id')
        .set('Authorization', studentToken)
        .expect(403);
    });

    it('should allow all authenticated roles to list modules', async () => {
      const studentToken = await createToken('STUDENT');
      const instructorToken = await createToken('INSTRUCTOR');
      const adminToken = await createToken('ADMIN');

      for (const token of [studentToken, instructorToken, adminToken]) {
        await request(app).get('/modules').set('Authorization', token).expect(200);
      }
    });

    it('should allow all authenticated roles to view a module', async () => {
      const studentToken = await createToken('STUDENT');
      const instructorToken = await createToken('INSTRUCTOR');
      const adminToken = await createToken('ADMIN');
      const module = await prisma.module.create({
        data: { title: 'Salsa Basics' },
      });

      for (const token of [studentToken, instructorToken, adminToken]) {
        const res = await request(app)
          .get(`/modules/${module.id}`)
          .set('Authorization', token)
          .expect(200);
        expect(res.body.title).toBe('Salsa Basics');
      }
    });
  });

  describe('POST /modules', () => {
    it('should create a module as INSTRUCTOR', async () => {
      const instructorToken = await createToken('INSTRUCTOR');
      const res = await request(app)
        .post('/modules')
        .set('Authorization', instructorToken)
        .send({ title: 'Intro to Bachata', orderIndex: 1 })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe('Intro to Bachata');
      expect(res.body.orderIndex).toBe(1);
    });

    it('should create a module as ADMIN', async () => {
      const adminToken = await createToken('ADMIN');
      const res = await request(app)
        .post('/modules')
        .set('Authorization', adminToken)
        .send({ title: 'Casino Fundamentals' })
        .expect(201);

      expect(res.body.title).toBe('Casino Fundamentals');
    });

    it('should return 400 for invalid body', async () => {
      const instructorToken = await createToken('INSTRUCTOR');
      const res = await request(app)
        .post('/modules')
        .set('Authorization', instructorToken)
        .send({ title: '' })
        .expect(400);

      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /modules', () => {
    it('should return paginated list of modules', async () => {
      const studentToken = await createToken('STUDENT');
      await prisma.module.create({
        data: { title: 'Module One', orderIndex: 0 },
      });
      await prisma.module.create({
        data: { title: 'Module Two', orderIndex: 1 },
      });

      const res = await request(app)
        .get('/modules')
        .set('Authorization', studentToken)
        .expect(200);

      expect(res.body.modules).toHaveLength(2);
      expect(res.body.pagination.total).toBe(2);
      expect(res.body.modules[0]).toHaveProperty('sectionCount');
    });

    it('should support search query', async () => {
      const studentToken = await createToken('STUDENT');
      await prisma.module.create({
        data: { title: 'Salsa Level 1', orderIndex: 0 },
      });
      await prisma.module.create({
        data: { title: 'Bachata Level 1', orderIndex: 1 },
      });

      const res = await request(app)
        .get('/modules')
        .query({ search: 'salsa' })
        .set('Authorization', studentToken)
        .expect(200);

      expect(res.body.modules).toHaveLength(1);
      expect(res.body.modules[0].title).toBe('Salsa Level 1');
    });
  });

  describe('GET /modules/:id', () => {
    it('should return a module with its sections', async () => {
      const studentToken = await createToken('STUDENT');
      const module = await prisma.module.create({
        data: { title: 'Rueda Basics', orderIndex: 0 },
      });

      const res = await request(app)
        .get(`/modules/${module.id}`)
        .set('Authorization', studentToken)
        .expect(200);

      expect(res.body.id).toBe(module.id);
      expect(res.body.title).toBe('Rueda Basics');
      expect(res.body.sections).toEqual([]);
    });

    it('should return 404 for a non-existent module', async () => {
      const studentToken = await createToken('STUDENT');
      await request(app)
        .get('/modules/non-existent-id')
        .set('Authorization', studentToken)
        .expect(404);
    });
  });

  describe('PATCH /modules/:id', () => {
    it('should update a module as INSTRUCTOR', async () => {
      const instructorToken = await createToken('INSTRUCTOR');
      const module = await prisma.module.create({
        data: { title: 'Original Title', orderIndex: 0 },
      });

      const res = await request(app)
        .patch(`/modules/${module.id}`)
        .set('Authorization', instructorToken)
        .send({ title: 'Updated Title' })
        .expect(200);

      expect(res.body.title).toBe('Updated Title');
    });

    it('should return 404 when updating a non-existent module', async () => {
      const instructorToken = await createToken('INSTRUCTOR');
      await request(app)
        .patch('/modules/non-existent-id')
        .set('Authorization', instructorToken)
        .send({ title: 'Nope' })
        .expect(404);
    });
  });

  describe('DELETE /modules/:id', () => {
    it('should delete a module as INSTRUCTOR', async () => {
      const instructorToken = await createToken('INSTRUCTOR');
      const module = await prisma.module.create({
        data: { title: 'To be deleted', orderIndex: 0 },
      });

      await request(app)
        .delete(`/modules/${module.id}`)
        .set('Authorization', instructorToken)
        .expect(204);

      const deleted = await prisma.module.findUnique({ where: { id: module.id } });
      expect(deleted).toBeNull();
    });

    it('should return 404 when deleting a non-existent module', async () => {
      const instructorToken = await createToken('INSTRUCTOR');
      await request(app)
        .delete('/modules/non-existent-id')
        .set('Authorization', instructorToken)
        .expect(404);
    });
  });
});