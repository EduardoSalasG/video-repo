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

interface VideoSeed {
  difficulty: string
  primaryStyle: string
  videoType: string
  tags: string[]
  filename: string
}

// Helper to create a section with searchable metadata
async function createSection(title: string, description: string) {
  const module = await prisma.module.create({
    data: { title: 'Search Test Module', orderIndex: 0 },
  })

  return prisma.section.create({
    data: {
      title,
      description,
      orderIndex: 0,
      moduleId: module.id,
    },
  })
}

// Each video metadata record requires a unique sectionId, so each helper call
// creates its own section along with the video metadata record.
async function createVideoWithSection(
  title: string,
  description: string,
  data: VideoSeed
) {
  const section = await createSection(title, description)
  return prisma.videoMetadata.create({
    data: {
      sectionId: section.id,
      steps: [{ step: 'basic step', count: 4 }],
      difficulty: data.difficulty as
        | 'BEGINNER'
        | 'INTERMEDIATE'
        | 'ADVANCED',
      primaryStyle: data.primaryStyle as
        | 'MAMBO_ON2'
        | 'CASINO'
        | 'SENSUAL_BACHATA',
      influences: ['afro-cuban'],
      durationCounts: 8,
      videoType: data.videoType as
        | 'STEP_BREAKDOWN'
        | 'COMBINATION'
        | 'FULL_PATTERN'
        | 'SHINES_SEQUENCE',
      tags: data.tags,
      fileSize: 1024000,
      durationSeconds: 120,
      filename: data.filename,
    },
  })
}

describe('Search Routes', () => {
  beforeEach(async () => {
    // Clear data before each test (children before parents to respect FK
    // constraints, plus all related tables for full isolation)
    await prisma.userProgress.deleteMany()
    await prisma.videoMetadata.deleteMany()
    await prisma.section.deleteMany()
    await prisma.session.deleteMany()
    await prisma.module.deleteMany()
    await prisma.user.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('Authentication guard', () => {
    it('should return 401 for unauthenticated GET /search', async () => {
      await request(app).get('/search').expect(401)
    })
  })

  describe('GET /search', () => {
    it('should return all video metadata when no filters are provided', async () => {
      const studentToken = await createToken('STUDENT')
      await createVideoWithSection('Beginner Mambo', 'Learn the basics', {
        difficulty: 'BEGINNER',
        primaryStyle: 'MAMBO_ON2',
        videoType: 'STEP_BREAKDOWN',
        tags: ['beginner', 'steps'],
        filename: 'a.mp4',
      })
      await createVideoWithSection('Intermediate Casino', 'Casino combos', {
        difficulty: 'INTERMEDIATE',
        primaryStyle: 'CASINO',
        videoType: 'COMBINATION',
        tags: ['intermediate'],
        filename: 'b.mp4',
      })

      const res = await request(app)
        .get('/search')
        .set('Authorization', studentToken)
        .expect(200)

      expect(res.body.videoMetadata).toHaveLength(2)
      expect(res.body.pagination.total).toBe(2)
      expect(res.body.pagination.pages).toBe(1)
    })

    it('should search by keyword matching a section title', async () => {
      const studentToken = await createToken('STUDENT')
      const videoA = await createVideoWithSection(
        'Sensual Bachata Basics',
        'Body movement',
        {
          difficulty: 'BEGINNER',
          primaryStyle: 'SENSUAL_BACHATA',
          videoType: 'STEP_BREAKDOWN',
          tags: ['basics'],
          filename: 'a.mp4',
        }
      )
      await createVideoWithSection('Casino Turns', 'Partner work', {
        difficulty: 'INTERMEDIATE',
        primaryStyle: 'CASINO',
        videoType: 'COMBINATION',
        tags: ['turns'],
        filename: 'b.mp4',
      })

      const res = await request(app)
        .get('/search')
        .query({ search: 'Sensual' })
        .set('Authorization', studentToken)
        .expect(200)

      expect(res.body.videoMetadata).toHaveLength(1)
      expect(res.body.videoMetadata[0].sectionId).toBe(videoA.sectionId)
    })

    it('should search by keyword matching a section description', async () => {
      const studentToken = await createToken('STUDENT')
      const videoA = await createVideoWithSection('On2 Basics', 'Footwork patterns', {
        difficulty: 'BEGINNER',
        primaryStyle: 'MAMBO_ON2',
        videoType: 'STEP_BREAKDOWN',
        tags: ['basics'],
        filename: 'a.mp4',
      })
      await createVideoWithSection('Casino Basics', 'Circular movement', {
        difficulty: 'INTERMEDIATE',
        primaryStyle: 'CASINO',
        videoType: 'COMBINATION',
        tags: ['basics'],
        filename: 'b.mp4',
      })

      const res = await request(app)
        .get('/search')
        .query({ search: 'Footwork' })
        .set('Authorization', studentToken)
        .expect(200)

      expect(res.body.videoMetadata).toHaveLength(1)
      expect(res.body.videoMetadata[0].sectionId).toBe(videoA.sectionId)
    })

    it('should search by keyword matching a tag', async () => {
      const studentToken = await createToken('STUDENT')
      const videoA = await createVideoWithSection(
        'Shines Sequence',
        'Solo footwork',
        {
          difficulty: 'ADVANCED',
          primaryStyle: 'MAMBO_ON2',
          videoType: 'SHINES_SEQUENCE',
          tags: ['partnerwork', 'shines'],
          filename: 'a.mp4',
        }
      )
      await createVideoWithSection('Combo Drills', 'Partner patterns', {
        difficulty: 'BEGINNER',
        primaryStyle: 'CASINO',
        videoType: 'COMBINATION',
        tags: ['solo'],
        filename: 'b.mp4',
      })

      const res = await request(app)
        .get('/search')
        .query({ search: 'partnerwork' })
        .set('Authorization', studentToken)
        .expect(200)

      expect(res.body.videoMetadata).toHaveLength(1)
      expect(res.body.videoMetadata[0].sectionId).toBe(videoA.sectionId)
    })

    it('should filter by primaryStyle', async () => {
      const studentToken = await createToken('STUDENT')
      await createVideoWithSection('Mambo Video', 'On2 style', {
        difficulty: 'BEGINNER',
        primaryStyle: 'MAMBO_ON2',
        videoType: 'STEP_BREAKDOWN',
        tags: [],
        filename: 'a.mp4',
      })
      await createVideoWithSection('Casino Video', 'Casino style', {
        difficulty: 'BEGINNER',
        primaryStyle: 'CASINO',
        videoType: 'STEP_BREAKDOWN',
        tags: [],
        filename: 'b.mp4',
      })

      const res = await request(app)
        .get('/search')
        .query({ primaryStyle: 'CASINO' })
        .set('Authorization', studentToken)
        .expect(200)

      expect(res.body.videoMetadata).toHaveLength(1)
      expect(res.body.videoMetadata[0].primaryStyle).toBe('CASINO')
    })

    it('should filter by difficulty', async () => {
      const studentToken = await createToken('STUDENT')
      await createVideoWithSection('Beginner Video', 'All levels', {
        difficulty: 'BEGINNER',
        primaryStyle: 'MAMBO_ON2',
        videoType: 'STEP_BREAKDOWN',
        tags: [],
        filename: 'a.mp4',
      })
      await createVideoWithSection('Advanced Video', 'All levels', {
        difficulty: 'ADVANCED',
        primaryStyle: 'MAMBO_ON2',
        videoType: 'STEP_BREAKDOWN',
        tags: [],
        filename: 'b.mp4',
      })

      const res = await request(app)
        .get('/search')
        .query({ difficulty: 'ADVANCED' })
        .set('Authorization', studentToken)
        .expect(200)

      expect(res.body.videoMetadata).toHaveLength(1)
      expect(res.body.videoMetadata[0].difficulty).toBe('ADVANCED')
    })

    it('should filter by videoType', async () => {
      const studentToken = await createToken('STUDENT')
      await createVideoWithSection('Breakdown Video', 'Many kinds', {
        difficulty: 'BEGINNER',
        primaryStyle: 'MAMBO_ON2',
        videoType: 'STEP_BREAKDOWN',
        tags: [],
        filename: 'a.mp4',
      })
      await createVideoWithSection('Pattern Video', 'Many kinds', {
        difficulty: 'BEGINNER',
        primaryStyle: 'MAMBO_ON2',
        videoType: 'FULL_PATTERN',
        tags: [],
        filename: 'b.mp4',
      })

      const res = await request(app)
        .get('/search')
        .query({ videoType: 'FULL_PATTERN' })
        .set('Authorization', studentToken)
        .expect(200)

      expect(res.body.videoMetadata).toHaveLength(1)
      expect(res.body.videoMetadata[0].videoType).toBe('FULL_PATTERN')
    })

    it('should combine keyword search with filters', async () => {
      const studentToken = await createToken('STUDENT')
      const videoA = await createVideoWithSection('Advanced Casino', 'Complex turns', {
        difficulty: 'ADVANCED',
        primaryStyle: 'CASINO',
        videoType: 'COMBINATION',
        tags: ['turns'],
        filename: 'a.mp4',
      })
      await createVideoWithSection('Advanced Casino', 'Complex turns', {
        difficulty: 'BEGINNER',
        primaryStyle: 'CASINO',
        videoType: 'COMBINATION',
        tags: ['turns'],
        filename: 'b.mp4',
      })

      const res = await request(app)
        .get('/search')
        .query({
          search: 'Complex',
          primaryStyle: 'CASINO',
          difficulty: 'ADVANCED',
          videoType: 'COMBINATION',
        })
        .set('Authorization', studentToken)
        .expect(200)

      expect(res.body.videoMetadata).toHaveLength(1)
      expect(res.body.videoMetadata[0].sectionId).toBe(videoA.sectionId)
    })

    it('should return empty results when nothing matches', async () => {
      const studentToken = await createToken('STUDENT')
      await createVideoWithSection('Whatever', 'Description', {
        difficulty: 'BEGINNER',
        primaryStyle: 'MAMBO_ON2',
        videoType: 'STEP_BREAKDOWN',
        tags: ['beginner'],
        filename: 'a.mp4',
      })

      const res = await request(app)
        .get('/search')
        .query({ search: 'nonexistent-keyword' })
        .set('Authorization', studentToken)
        .expect(200)

      expect(res.body.videoMetadata).toHaveLength(0)
      expect(res.body.pagination.total).toBe(0)
    })

    it('should paginate results using page and limit', async () => {
      const studentToken = await createToken('STUDENT')
      for (let i = 0; i < 3; i++) {
        await createVideoWithSection(`Paginated Video ${i}`, 'Many videos', {
          difficulty: 'BEGINNER',
          primaryStyle: 'MAMBO_ON2',
          videoType: 'STEP_BREAKDOWN',
          tags: [],
          filename: `video-${i}.mp4`,
        })
      }

      const pageOne = await request(app)
        .get('/search')
        .query({ page: '1', limit: '2' })
        .set('Authorization', studentToken)
        .expect(200)

      expect(pageOne.body.videoMetadata).toHaveLength(2)
      expect(pageOne.body.pagination.total).toBe(3)
      expect(pageOne.body.pagination.pages).toBe(2)

      const pageTwo = await request(app)
        .get('/search')
        .query({ page: '2', limit: '2' })
        .set('Authorization', studentToken)
        .expect(200)

      expect(pageTwo.body.videoMetadata).toHaveLength(1)
    })

    it('should return 400 for invalid filter values', async () => {
      const studentToken = await createToken('STUDENT')

      const res = await request(app)
        .get('/search')
        .query({ videoType: 'TUTORIAL' })
        .set('Authorization', studentToken)
        .expect(400)

      expect(res.body).toHaveProperty('error')
    })
  })
})