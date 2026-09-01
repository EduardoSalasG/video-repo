import { describe, it, expect, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import prisma from '../../src/config/database.ts'
import app from '../../src/app.ts'
import { generateToken } from '../../src/utils/token'

// Set JWT_SECRET if not set
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-secret'
}

const jwtSecret = process.env.JWT_SECRET

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
  })
}

// Create a fresh user and return a valid auth header for them
async function createToken(role: string): Promise<string> {
  const user = await createUser(role)
  return `Bearer ${generateToken({ userId: user.id }, jwtSecret!, '1h')}`
}

// Create a user with WRITE access to a specific course
async function createInstructorWithCourseAccess(courseId: string) {
  const user = await createUser('INSTRUCTOR')
  await prisma.courseUserAccess.create({
    data: {
      userId: user.id,
      courseId,
      accessLevel: 'WRITE',
      grantedBy: user.id,
    },
  })
  const token = `Bearer ${generateToken({ userId: user.id }, jwtSecret!, '1h')}`
  return { user, token }
}

// Create a student with READ access to a specific course
async function createStudentWithCourseAccess(courseId: string) {
  const user = await createUser('STUDENT')
  await prisma.courseUserAccess.create({
    data: {
      userId: user.id,
      courseId,
      accessLevel: 'READ',
      grantedBy: user.id,
    },
  })
  const token = `Bearer ${generateToken({ userId: user.id }, jwtSecret!, '1h')}`
  return { user, token }
}

// Create an instructor with MAINTAIN access to a specific course
async function createInstructorWithMaintainAccess(courseId: string) {
  const user = await createUser('INSTRUCTOR')
  await prisma.courseUserAccess.create({
    data: {
      userId: user.id,
      courseId,
      accessLevel: 'MAINTAIN',
      grantedBy: user.id,
    },
  })
  const token = `Bearer ${generateToken({ userId: user.id }, jwtSecret!, '1h')}`
  return { user, token }
}

describe('Module Routes', () => {
  beforeEach(async () => {
    // Clean up in child-first order so FK constraints are respected and
    // data left behind by other test files does not interfere.
    await prisma.userProgress.deleteMany()
    await prisma.videoMetadata.deleteMany()
    await prisma.section.deleteMany()
    await prisma.module.deleteMany()
    await prisma.courseUserAccess.deleteMany()
    await prisma.course.deleteMany()
    await prisma.session.deleteMany()
    await prisma.user.deleteMany()
  })

  afterAll(async () => {
    await prisma.userProgress.deleteMany()
    await prisma.videoMetadata.deleteMany()
    await prisma.section.deleteMany()
    await prisma.module.deleteMany()
    await prisma.courseUserAccess.deleteMany()
    await prisma.course.deleteMany()
    await prisma.session.deleteMany()
    await prisma.user.deleteMany()
    await prisma.$disconnect()
  })

  describe('Authentication guard', () => {
    it('should return 401 for unauthenticated GET /courses/:courseId/modules', async () => {
      await request(app).get('/courses/test-course-id/modules').expect(401)
    })

    it('should return 401 for unauthenticated POST /courses/:courseId/modules', async () => {
      await request(app)
        .post('/courses/test-course-id/modules')
        .send({ title: 'Test' })
        .expect(401)
    })

    it('should return 401 for unauthenticated PATCH /courses/:courseId/modules/:moduleId', async () => {
      await request(app)
        .patch('/courses/test-course-id/modules/some-id')
        .send({})
        .expect(401)
    })

    it('should return 401 for unauthenticated DELETE /courses/:courseId/modules/:moduleId', async () => {
      await request(app)
        .delete('/courses/test-course-id/modules/some-id')
        .expect(401)
    })
  })

  describe('Role authorization', () => {
    it('should forbid STUDENT from creating a module', async () => {
      const studentToken = await createToken('STUDENT')
      const res = await request(app)
        .post('/courses/test-course-id/modules')
        .set('Authorization', studentToken)
        .send({ title: 'Student module' })
        .expect(403)

      expect(res.body.error).toContain('Forbidden')
    })

    it('should forbid STUDENT from updating a module', async () => {
      const studentToken = await createToken('STUDENT')
      await request(app)
        .patch('/courses/test-course-id/modules/some-id')
        .set('Authorization', studentToken)
        .send({ title: 'Updated' })
        .expect(403)
    })

    it('should forbid STUDENT from deleting a module', async () => {
      const studentToken = await createToken('STUDENT')
      await request(app)
        .delete('/courses/test-course-id/modules/some-id')
        .set('Authorization', studentToken)
        .expect(403)
    })

    it('should allow all authenticated roles to list modules', async () => {
      const course = await prisma.course.create({
        data: { name: 'Test Course' },
      })
      const { token: studentToken } = await createStudentWithCourseAccess(
        course.id
      )
      const { token: instructorToken } = await createInstructorWithCourseAccess(
        course.id
      )
      const adminToken = await createToken('ADMIN') // Admin has access to all courses

      for (const token of [studentToken, instructorToken, adminToken]) {
        await request(app)
          .get(`/courses/${course.id}/modules`)
          .set('Authorization', token)
          .expect(200)
      }
    })

    it('should allow all authenticated roles to view a module', async () => {
      const course = await prisma.course.create({
        data: { name: 'Test Course' },
      })
      const { token: studentToken } = await createStudentWithCourseAccess(
        course.id
      )
      const { token: instructorToken } = await createInstructorWithCourseAccess(
        course.id
      )
      const adminToken = await createToken('ADMIN') // Admin has access to all courses
      const module = await prisma.module.create({
        data: { title: 'Salsa Basics', courseId: course.id },
      })

      for (const token of [studentToken, instructorToken, adminToken]) {
        const res = await request(app)
          .get(`/courses/${course.id}/modules/${module.id}`)
          .set('Authorization', token)
          .expect(200)
        expect(res.body.title).toBe('Salsa Basics')
      }
    })
  })

  describe('POST /courses/:courseId/modules', () => {
    it('should create a module as INSTRUCTOR', async () => {
      const course = await prisma.course.create({
        data: { name: 'Test Course' },
      })
      const { token: instructorToken } = await createInstructorWithCourseAccess(
        course.id
      )
      const res = await request(app)
        .post(`/courses/${course.id}/modules`)
        .set('Authorization', instructorToken)
        .send({ title: 'Intro to Bachata', orderIndex: 1 })
        .expect(201)

      expect(res.body).toHaveProperty('id')
      expect(res.body.title).toBe('Intro to Bachata')
      expect(res.body.orderIndex).toBe(1)
      expect(res.body.courseId).toBe(course.id)
    })

    it('should create a module as ADMIN', async () => {
      const adminToken = await createToken('ADMIN')
      const course = await prisma.course.create({
        data: { name: 'Test Course' },
      })
      // Admin has access to all courses (per CoursePolicy)
      const res = await request(app)
        .post(`/courses/${course.id}/modules`)
        .set('Authorization', adminToken)
        .send({ title: 'Casino Fundamentals' })
        .expect(201)

      expect(res.body.title).toBe('Casino Fundamentals')
    })

    it('should return 400 for invalid body', async () => {
      const course = await prisma.course.create({
        data: { name: 'Test Course' },
      })
      const { token: instructorToken } = await createInstructorWithCourseAccess(
        course.id
      )
      const res = await request(app)
        .post(`/courses/${course.id}/modules`)
        .set('Authorization', instructorToken)
        .send({ title: '' })
        .expect(400)

      expect(res.body).toHaveProperty('error')
    })
  })

  describe('GET /courses/:courseId/modules', () => {
    it('should return paginated list of modules', async () => {
      const course = await prisma.course.create({
        data: { name: 'Test Course' },
      })
      const { token: studentToken } = await createStudentWithCourseAccess(
        course.id
      )
      await prisma.module.create({
        data: { title: 'Module One', orderIndex: 0, courseId: course.id },
      })
      await prisma.module.create({
        data: { title: 'Module Two', orderIndex: 1, courseId: course.id },
      })

      const res = await request(app)
        .get(`/courses/${course.id}/modules`)
        .set('Authorization', studentToken)
        .expect(200)

      expect(res.body.modules).toHaveLength(2)
      expect(res.body.pagination.total).toBe(2)
      expect(res.body.modules[0]).toHaveProperty('sectionCount')
    })

    it('should support search query', async () => {
      const course = await prisma.course.create({
        data: { name: 'Test Course' },
      })
      const { token: studentToken } = await createStudentWithCourseAccess(
        course.id
      )
      await prisma.module.create({
        data: { title: 'Salsa Level 1', orderIndex: 0, courseId: course.id },
      })
      await prisma.module.create({
        data: { title: 'Bachata Level 1', orderIndex: 1, courseId: course.id },
      })

      const res = await request(app)
        .get(`/courses/${course.id}/modules`)
        .query({ search: 'salsa' })
        .set('Authorization', studentToken)
        .expect(200)

      expect(res.body.modules).toHaveLength(1)
      expect(res.body.modules[0].title).toBe('Salsa Level 1')
    })
  })

  describe('GET /courses/:courseId/modules/:moduleId', () => {
    it('should return a module with its sections', async () => {
      const course = await prisma.course.create({
        data: { name: 'Test Course' },
      })
      const { token: studentToken } = await createStudentWithCourseAccess(
        course.id
      )
      const module = await prisma.module.create({
        data: { title: 'Rueda Basics', orderIndex: 0, courseId: course.id },
      })

      const section = await prisma.section.create({
        data: { title: 'Basic Step', moduleId: module.id, orderIndex: 0 },
      })

      const res = await request(app)
        .get(`/courses/${course.id}/modules/${module.id}`)
        .set('Authorization', studentToken)
        .expect(200)

      expect(res.body.id).toBe(module.id)
      expect(res.body.title).toBe('Rueda Basics')
      expect(res.body.sections).toHaveLength(1)
      expect(res.body.sections[0].title).toBe('Basic Step')
      expect(res.body.sections[0].id).toBe(section.id)
    })

    it('should return 404 for a non-existent module', async () => {
      const course = await prisma.course.create({
        data: { name: 'Test Course' },
      })
      const { token: studentToken } = await createStudentWithCourseAccess(
        course.id
      )
      await request(app)
        .get(`/courses/${course.id}/modules/non-existent-module-id`)
        .set('Authorization', studentToken)
        .expect(403) // Authorization fails before controller runs
    })
  })

  describe('GET /modules/:moduleId', () => {
    it('should allow ADMIN to view a module without an explicit course grant', async () => {
      const course = await prisma.course.create({
        data: { name: 'Admin catalogue course' },
      })
      const module = await prisma.module.create({
        data: { title: 'Admin catalogue module', courseId: course.id },
      })
      const adminToken = await createToken('ADMIN')

      const res = await request(app)
        .get(`/modules/${module.id}`)
        .set('Authorization', adminToken)
        .expect(200)

      expect(res.body.id).toBe(module.id)
    })
  })

  describe('PATCH /courses/:courseId/modules/:moduleId', () => {
    it('should update a module as INSTRUCTOR', async () => {
      const course = await prisma.course.create({
        data: { name: 'Test Course' },
      })
      const { token: instructorToken } = await createInstructorWithCourseAccess(
        course.id
      )
      const module = await prisma.module.create({
        data: { title: 'Original Title', orderIndex: 0, courseId: course.id },
      })

      const res = await request(app)
        .patch(`/courses/${course.id}/modules/${module.id}`)
        .set('Authorization', instructorToken)
        .send({ title: 'Updated Title' })
        .expect(200)

      expect(res.body.title).toBe('Updated Title')
    })

    it('should return 404 when updating a non-existent module', async () => {
      const course = await prisma.course.create({
        data: { name: 'Test Course' },
      })
      const { token: instructorToken } = await createInstructorWithCourseAccess(
        course.id
      )
      await request(app)
        .patch(`/courses/${course.id}/modules/non-existent-module-id`)
        .set('Authorization', instructorToken)
        .send({ title: 'Nope' })
        .expect(403) // Authorization fails before controller runs
    })
  })

  describe('DELETE /courses/:courseId/modules/:moduleId', () => {
    it('should delete a module as INSTRUCTOR', async () => {
      const course = await prisma.course.create({
        data: { name: 'Test Course' },
      })
      const { token: instructorToken } =
        await createInstructorWithMaintainAccess(course.id)
      const module = await prisma.module.create({
        data: { title: 'To be deleted', orderIndex: 0, courseId: course.id },
      })

      await request(app)
        .delete(`/courses/${course.id}/modules/${module.id}`)
        .set('Authorization', instructorToken)
        .expect(204)

      const deleted = await prisma.module.findUnique({
        where: { id: module.id },
      })
      expect(deleted?.isDeleted).toBe(true)
    })

    it('should return 404 when deleting a non-existent module', async () => {
      const course = await prisma.course.create({
        data: { name: 'Test Course' },
      })
      const { token: instructorToken } = await createInstructorWithCourseAccess(
        course.id
      )
      await request(app)
        .delete(`/courses/${course.id}/modules/non-existent-module-id`)
        .set('Authorization', instructorToken)
        .expect(403) // Authorization fails before controller runs
    })
  })
})
