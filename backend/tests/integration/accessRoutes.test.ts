import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import prisma from '../../src/config/database'
import app from '../../src/app'
import { generateToken } from '../../src/utils/token'

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-secret'
}

const jwtSecret = process.env.JWT_SECRET

async function createUser(role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT') {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  return prisma.user.create({
    data: {
      email: `${role.toLowerCase()}-${unique}@test.com`,
      username: `${role.toLowerCase()}-${unique}`,
      firstName: role,
      lastName: 'User',
      passwordHash: 'hashed',
      role,
    },
  })
}

function tokenFor(userId: string): string {
  return `Bearer ${generateToken({ userId }, jwtSecret!, '1h')}`
}

describe('Course access routes', () => {
  beforeEach(async () => {
    await prisma.courseUserAccess.deleteMany()
    await prisma.course.deleteMany()
    await prisma.user.deleteMany()
  })

  afterAll(async () => {
    await prisma.courseUserAccess.deleteMany()
    await prisma.course.deleteMany()
    await prisma.user.deleteMany()
    await prisma.$disconnect()
  })

  it('allows a MAINTAIN user to grant course access', async () => {
    const course = await prisma.course.create({
      data: { name: 'Maintained course' },
    })
    const maintainer = await createUser('INSTRUCTOR')
    const recipient = await createUser('STUDENT')
    await prisma.courseUserAccess.create({
      data: {
        courseId: course.id,
        userId: maintainer.id,
        accessLevel: 'MAINTAIN',
        grantedBy: maintainer.id,
      },
    })

    const response = await request(app)
      .post(`/courses/${course.id}/access`)
      .set('Authorization', tokenFor(maintainer.id))
      .send({ userId: recipient.id, accessLevel: 'READ' })
      .expect(201)

    expect(response.body).toMatchObject({
      courseId: course.id,
      userId: recipient.id,
      accessLevel: 'READ',
    })
  })
})
