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
let testCourseId: string
let testModuleId: string

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
async function createToken(
  role: string,
  accessLevel: 'READ' | 'WRITE' | 'MAINTAIN' = role === 'STUDENT'
    ? 'READ'
    : 'WRITE'
): Promise<string> {
  const user = await createUser(role)
  if (role !== 'ADMIN') {
    await prisma.courseUserAccess.create({
      data: {
        userId: user.id,
        courseId: testCourseId,
        accessLevel,
        grantedBy: user.id,
      },
    })
  }
  return `Bearer ${generateToken({ userId: user.id }, jwtSecret!, '1h')}`
}

// Helper to create a course and module for testing
async function createCourseAndModule() {
  const course = await prisma.course.create({
    data: { name: 'Test Course' },
  })
  const module = await prisma.module.create({
    data: { title: 'Test Module', orderIndex: 0, courseId: course.id },
  })

  return { courseId: course.id, moduleId: module.id }
}

describe('Section Routes', () => {
  beforeEach(async () => {
    // Clear sections and modules before each test (children before parents
    // to respect FK constraints, plus all related tables for full isolation)
    await prisma.userProgress.deleteMany()
    await prisma.videoMetadata.deleteMany()
    await prisma.section.deleteMany()
    await prisma.session.deleteMany()
    await prisma.courseUserAccess.deleteMany()
    await prisma.module.deleteMany()
    await prisma.course.deleteMany()
    await prisma.user.deleteMany()

    // Create a test course and module to use for section operations
    const { courseId, moduleId } = await createCourseAndModule()
    testCourseId = courseId
    testModuleId = moduleId
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('Authentication guard', () => {
    it('should return 401 for unauthenticated GET /courses/:courseId/modules/:moduleId/sections', async () => {
      await request(app)
        .get(`/courses/${testCourseId}/modules/${testModuleId}/sections`)
        .expect(401)
    })

    it('should return 401 for unauthenticated POST /courses/:courseId/modules/:moduleId/sections', async () => {
      await request(app)
        .post(`/courses/${testCourseId}/modules/${testModuleId}/sections`)
        .send({ title: 'Test Section', orderIndex: 0 })
        .expect(401)
    })

    it('should return 401 for unauthenticated GET /courses/:courseId/modules/:moduleId/sections/:sectionId', async () => {
      await request(app)
        .get(
          `/courses/${testCourseId}/modules/${testModuleId}/sections/non-existent`
        )
        .expect(401)
    })

    it('should return 401 for unauthenticated PATCH /courses/:courseId/modules/:moduleId/sections/:sectionId', async () => {
      await request(app)
        .patch(
          `/courses/${testCourseId}/modules/${testModuleId}/sections/non-existent`
        )
        .send({})
        .expect(401)
    })

    it('should return 401 for unauthenticated DELETE /courses/:courseId/modules/:moduleId/sections/:sectionId', async () => {
      await request(app)
        .delete(
          `/courses/${testCourseId}/modules/${testModuleId}/sections/non-existent`
        )
        .expect(401)
    })
  })

  describe('Role authorization', () => {
    it('should allow STUDENT to read sections', async () => {
      const studentToken = await createToken('STUDENT')
      // First create a section as admin to test reading
      const adminToken = await createToken('ADMIN')
      const sectionRes = await request(app)
        .post(`/courses/${testCourseId}/modules/${testModuleId}/sections`)
        .set('Authorization', adminToken)
        .send({ title: 'Test Section', orderIndex: 0 })
        .expect(201)
      const sectionId = sectionRes.body.id

      // Now test that student can read
      await request(app)
        .get(`/courses/${testCourseId}/modules/${testModuleId}/sections`)
        .set('Authorization', studentToken)
        .expect(200)

      await request(app)
        .get(
          `/courses/${testCourseId}/modules/${testModuleId}/sections/${sectionId}`
        )
        .set('Authorization', studentToken)
        .expect(200)
    })

    it('should forbid STUDENT from creating a section', async () => {
      const studentToken = await createToken('STUDENT')
      const res = await request(app)
        .post(`/courses/${testCourseId}/modules/${testModuleId}/sections`)
        .set('Authorization', studentToken)
        .send({ title: 'Student section', orderIndex: 0 })
        .expect(403)

      expect(res.body.error).toContain('Forbidden')
    })

    it('should forbid STUDENT from updating a section', async () => {
      // First create a section as admin
      const adminToken = await createToken('ADMIN')
      const sectionRes = await request(app)
        .post(`/courses/${testCourseId}/modules/${testModuleId}/sections`)
        .set('Authorization', adminToken)
        .send({ title: 'Test Section', orderIndex: 0 })
        .expect(201)
      const sectionId = sectionRes.body.id

      const studentToken = await createToken('STUDENT')
      await request(app)
        .patch(
          `/courses/${testCourseId}/modules/${testModuleId}/sections/${sectionId}`
        )
        .set('Authorization', studentToken)
        .send({ title: 'Updated' })
        .expect(403)
    })

    it('should forbid STUDENT from deleting a section', async () => {
      // First create a section as admin
      const adminToken = await createToken('ADMIN')
      const sectionRes = await request(app)
        .post(`/courses/${testCourseId}/modules/${testModuleId}/sections`)
        .set('Authorization', adminToken)
        .send({ title: 'Test Section', orderIndex: 0 })
        .expect(201)
      const sectionId = sectionRes.body.id

      const studentToken = await createToken('STUDENT')
      await request(app)
        .delete(
          `/courses/${testCourseId}/modules/${testModuleId}/sections/${sectionId}`
        )
        .set('Authorization', studentToken)
        .expect(403)
    })

    it('should allow INSTRUCTOR and ADMIN to perform write operations', async () => {
      const instructorToken = await createToken('INSTRUCTOR', 'MAINTAIN')
      const adminToken = await createToken('ADMIN')

      // Test creation
      for (const token of [instructorToken, adminToken]) {
        const res = await request(app)
          .post(`/courses/${testCourseId}/modules/${testModuleId}/sections`)
          .set('Authorization', token)
          .send({ title: 'Test Section', orderIndex: 0 })
          .expect(201)
        expect(res.body).toHaveProperty('id')
        // Clean up the created section for next iteration
        await prisma.section.delete({ where: { id: res.body.id } })
      }

      // For update and delete, we need a section to operate on
      const sectionRes = await request(app)
        .post(`/courses/${testCourseId}/modules/${testModuleId}/sections`)
        .set('Authorization', instructorToken)
        .send({ title: 'Test Section', orderIndex: 0 })
        .expect(201)
      const sectionId = sectionRes.body.id

      // Test update
      for (const token of [instructorToken, adminToken]) {
        await request(app)
          .patch(
            `/courses/${testCourseId}/modules/${testModuleId}/sections/${sectionId}`
          )
          .set('Authorization', token)
          .send({ title: 'Updated Section' })
          .expect(200)
      }

      // Test delete
      for (const token of [instructorToken, adminToken]) {
        // Recreate section for each delete test
        const secRes = await request(app)
          .post(`/courses/${testCourseId}/modules/${testModuleId}/sections`)
          .set('Authorization', instructorToken)
          .send({ title: 'To Delete', orderIndex: 0 })
          .expect(201)
        const delId = secRes.body.id
        await request(app)
          .delete(
            `/courses/${testCourseId}/modules/${testModuleId}/sections/${delId}`
          )
          .set('Authorization', token)
          .expect(204)
      }
    })
  })

  describe('POST /courses/:courseId/modules/:moduleId/sections', () => {
    it('should create a section as INSTRUCTOR', async () => {
      const instructorToken = await createToken('INSTRUCTOR', 'MAINTAIN')
      const res = await request(app)
        .post(`/courses/${testCourseId}/modules/${testModuleId}/sections`)
        .set('Authorization', instructorToken)
        .send({ title: 'Intro to Bachata', orderIndex: 1 })
        .expect(201)

      expect(res.body).toHaveProperty('id')
      expect(res.body.title).toBe('Intro to Bachata')
      expect(res.body.orderIndex).toBe(1)
      expect(res.body.moduleId).toBe(testModuleId)
    })

    it('should create a section as ADMIN', async () => {
      const adminToken = await createToken('ADMIN')
      const res = await request(app)
        .post(`/courses/${testCourseId}/modules/${testModuleId}/sections`)
        .set('Authorization', adminToken)
        .send({ title: 'Intro to Salsa', orderIndex: 0 })
        .expect(201)

      expect(res.body.title).toBe('Intro to Salsa')
      expect(res.body.moduleId).toBe(testModuleId)
    })

    it('should return 400 for invalid body', async () => {
      const instructorToken = await createToken('INSTRUCTOR')
      const res = await request(app)
        .post(`/courses/${testCourseId}/modules/${testModuleId}/sections`)
        .set('Authorization', instructorToken)
        .send({ title: '' })
        .expect(400)

      expect(res.body).toHaveProperty('error')
    })
  })

  describe('GET /courses/:courseId/modules/:moduleId/sections', () => {
    it('should return paginated list of sections for a module', async () => {
      const studentToken = await createToken('STUDENT')
      // Create two sections
      await prisma.section.create({
        data: {
          title: 'Section One',
          orderIndex: 0,
          moduleId: testModuleId,
        },
      })
      await prisma.section.create({
        data: {
          title: 'Section Two',
          orderIndex: 1,
          moduleId: testModuleId,
        },
      })

      const res = await request(app)
        .get(`/courses/${testCourseId}/modules/${testModuleId}/sections`)
        .set('Authorization', studentToken)
        .expect(200)

      expect(res.body.sections).toHaveLength(2)
      expect(res.body.pagination.total).toBe(2)
      expect(res.body.sections[0]).toHaveProperty('id')
    })

    it('should support search query', async () => {
      const studentToken = await createToken('STUDENT')
      await prisma.section.create({
        data: {
          title: 'Introduction to Dance',
          orderIndex: 0,
          moduleId: testModuleId,
        },
      })
      await prisma.section.create({
        data: {
          title: 'Advanced Techniques',
          orderIndex: 1,
          moduleId: testModuleId,
        },
      })

      const res = await request(app)
        .get(`/courses/${testCourseId}/modules/${testModuleId}/sections`)
        .query({ search: 'introduction' })
        .set('Authorization', studentToken)
        .expect(200)

      expect(res.body.sections).toHaveLength(1)
      expect(res.body.sections[0].title).toBe('Introduction to Dance')
    })

    it('should support orderBy and sortOrder queries', async () => {
      const studentToken = await createToken('STUDENT')
      await prisma.section.create({
        data: {
          title: 'Z Section',
          orderIndex: 0,
          moduleId: testModuleId,
        },
      })
      await prisma.section.create({
        data: {
          title: 'A Section',
          orderIndex: 1,
          moduleId: testModuleId,
        },
      })

      const res = await request(app)
        .get(`/courses/${testCourseId}/modules/${testModuleId}/sections`)
        .query({ orderBy: 'title', sortOrder: 'asc' })
        .set('Authorization', studentToken)
        .expect(200)

      expect(res.body.sections).toHaveLength(2)
      expect(res.body.sections[0].title).toBe('A Section')
      expect(res.body.sections[1].title).toBe('Z Section')
    })
  })

  describe('GET /courses/:courseId/modules/:moduleId/sections/:sectionId', () => {
    it('should return a section with its details', async () => {
      const studentToken = await createToken('STUDENT')
      const section = await prisma.section.create({
        data: {
          title: 'Warm Up',
          orderIndex: 0,
          moduleId: testModuleId,
          markdownContent: 'Stretching exercises',
          videoUrl: 'https://example.com/video.mp4',
        },
      })

      const res = await request(app)
        .get(
          `/courses/${testCourseId}/modules/${testModuleId}/sections/${section.id}`
        )
        .set('Authorization', studentToken)
        .expect(200)

      expect(res.body.id).toBe(section.id)
      expect(res.body.title).toBe('Warm Up')
      expect(res.body.markdownContent).toBe('Stretching exercises')
      expect(res.body.videoUrl).toBe('https://example.com/video.mp4')
    })

    it('should return 404 for a non-existent section', async () => {
      const studentToken = await createToken('STUDENT')
      await request(app)
        .get(
          `/courses/${testCourseId}/modules/${testModuleId}/sections/non-existent-id`
        )
        .set('Authorization', studentToken)
        .expect(404)
    })

    it('should return 404 for a section belonging to another module', async () => {
      const studentToken = await createToken('STUDENT')
      // Create another module and a section in it
      const otherCourse = await prisma.course.create({
        data: { name: 'Other Course' },
      })
      const otherModule = await prisma.module.create({
        data: {
          title: 'Other Module',
          orderIndex: 1,
          courseId: otherCourse.id,
        },
      })
      const otherSection = await prisma.section.create({
        data: {
          title: 'Other Section',
          orderIndex: 0,
          moduleId: otherModule.id,
        },
      })

      await request(app)
        .get(
          `/courses/${testCourseId}/modules/${testModuleId}/sections/${otherSection.id}`
        )
        .set('Authorization', studentToken)
        .expect(404)
    })
  })

  describe('PATCH /courses/:courseId/modules/:moduleId/sections/:sectionId', () => {
    it('should update a section as INSTRUCTOR', async () => {
      const instructorToken = await createToken('INSTRUCTOR')
      const section = await prisma.section.create({
        data: {
          title: 'Original Title',
          orderIndex: 0,
          moduleId: testModuleId,
        },
      })

      const res = await request(app)
        .patch(
          `/courses/${testCourseId}/modules/${testModuleId}/sections/${section.id}`
        )
        .set('Authorization', instructorToken)
        .send({ title: 'Updated Title', orderIndex: 5 })
        .expect(200)

      expect(res.body.title).toBe('Updated Title')
      expect(res.body.orderIndex).toBe(5)
    })

    it('should return 404 when updating a non-existent section', async () => {
      const instructorToken = await createToken('INSTRUCTOR')
      await request(app)
        .patch(
          `/courses/${testCourseId}/modules/${testModuleId}/sections/non-existent-id`
        )
        .set('Authorization', instructorToken)
        .send({ title: 'Nope' })
        .expect(404)
    })

    it('should return 404 when updating a section from another module', async () => {
      const instructorToken = await createToken('INSTRUCTOR')
      // Create another module and a section in it
      const otherCourse = await prisma.course.create({
        data: { name: 'Other Course' },
      })
      const otherModule = await prisma.module.create({
        data: {
          title: 'Other Module',
          orderIndex: 1,
          courseId: otherCourse.id,
        },
      })
      const otherSection = await prisma.section.create({
        data: {
          title: 'Other Section',
          orderIndex: 0,
          moduleId: otherModule.id,
        },
      })

      await request(app)
        .patch(
          `/courses/${testCourseId}/modules/${testModuleId}/sections/${otherSection.id}`
        )
        .set('Authorization', instructorToken)
        .send({ title: 'Hacked' })
        .expect(404)
    })
  })

  describe('DELETE /courses/:courseId/modules/:moduleId/sections/:sectionId', () => {
    it('should delete a section as INSTRUCTOR', async () => {
      const instructorToken = await createToken('INSTRUCTOR', 'MAINTAIN')
      const section = await prisma.section.create({
        data: {
          title: 'To be deleted',
          orderIndex: 0,
          moduleId: testModuleId,
        },
      })

      await request(app)
        .delete(
          `/courses/${testCourseId}/modules/${testModuleId}/sections/${section.id}`
        )
        .set('Authorization', instructorToken)
        .expect(204)

      const deleted = await prisma.section.findUnique({
        where: { id: section.id },
      })
      expect(deleted).toMatchObject({ isDeleted: true })
    })

    it('should return 404 when deleting a non-existent section', async () => {
      const instructorToken = await createToken('INSTRUCTOR', 'MAINTAIN')
      await request(app)
        .delete(
          `/courses/${testCourseId}/modules/${testModuleId}/sections/non-existent-id`
        )
        .set('Authorization', instructorToken)
        .expect(404)
    })

    it('should return 404 when deleting a section from another module', async () => {
      const instructorToken = await createToken('INSTRUCTOR', 'MAINTAIN')
      // Create another module and a section in it
      const otherCourse = await prisma.course.create({
        data: { name: 'Other Course' },
      })
      const otherModule = await prisma.module.create({
        data: {
          title: 'Other Module',
          orderIndex: 1,
          courseId: otherCourse.id,
        },
      })
      const otherSection = await prisma.section.create({
        data: {
          title: 'Other Section',
          orderIndex: 0,
          moduleId: otherModule.id,
        },
      })

      await request(app)
        .delete(
          `/courses/${testCourseId}/modules/${testModuleId}/sections/${otherSection.id}`
        )
        .set('Authorization', instructorToken)
        .expect(404)
    })
  })
})
