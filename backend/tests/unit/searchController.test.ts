import { describe, it, expect, beforeEach, vi } from 'vitest'
import { searchVideos } from '../../src/controllers/searchController'

vi.mock('../../src/config/database', () => ({
  default: {
    videoMetadata: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}))

import prisma from '../../src/config/database'

describe('searchController', () => {
  let mockReq: any
  let mockRes: any

  const videoMetadataStub = {
    id: 'vm1',
    sectionId: 's1',
    steps: [],
    difficulty: 'BEGINNER',
    primaryStyle: 'MAMBO_ON2',
    influences: [],
    durationCounts: 8,
    videoType: 'STEP_BREAKDOWN',
    tags: ['beginner'],
    fileSize: 1024000,
    durationSeconds: 120,
    filename: 'video1.mp4',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    mockReq = { query: {} }
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    }
    vi.clearAllMocks()
  })

  it('should return matching videos with pagination', async () => {
    ;(prisma.videoMetadata.findMany as jest.Mock).mockResolvedValue([videoMetadataStub])
    ;(prisma.videoMetadata.count as jest.Mock).mockResolvedValue(1)
    mockReq.query = { search: 'basic', page: '1', limit: '10' }

    await searchVideos(mockReq, mockRes)

    expect(prisma.videoMetadata.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ AND: expect.any(Array) }),
        skip: 0,
        take: 10,
      })
    )
    expect(mockRes.json).toHaveBeenCalledWith({
      videoMetadata: [videoMetadataStub],
      pagination: { page: 1, limit: 10, total: 1, pages: 1 },
    })
  })

  it('should build where clause with keyword and all filters', async () => {
    ;(prisma.videoMetadata.findMany as jest.Mock).mockResolvedValue([])
    ;(prisma.videoMetadata.count as jest.Mock).mockResolvedValue(0)
    mockReq.query = {
      search: 'salsa',
      primaryStyle: 'CASINO',
      difficulty: 'INTERMEDIATE',
      videoType: 'COMBINATION',
      page: '2',
      limit: '5',
    }

    await searchVideos(mockReq, mockRes)

    const findCall = (prisma.videoMetadata.findMany as jest.Mock).mock.calls[0][0]
    expect(findCall.skip).toBe(5)
    expect(findCall.take).toBe(5)
    expect(findCall.where.AND).toHaveLength(4)
  })

  it('should omit keyword clause when no search term is provided', async () => {
    ;(prisma.videoMetadata.findMany as jest.Mock).mockResolvedValue([])
    ;(prisma.videoMetadata.count as jest.Mock).mockResolvedValue(0)
    mockReq.query = { primaryStyle: 'MAMBO_ON2' }

    await searchVideos(mockReq, mockRes)

    const findCall = (prisma.videoMetadata.findMany as jest.Mock).mock.calls[0][0]
    expect(findCall.where.AND).toHaveLength(1)
    expect(findCall.where.AND[0]).toEqual({ primaryStyle: 'MAMBO_ON2' })
  })

  it('should use empty where clause when no filters are provided', async () => {
    ;(prisma.videoMetadata.findMany as jest.Mock).mockResolvedValue([])
    ;(prisma.videoMetadata.count as jest.Mock).mockResolvedValue(0)
    mockReq.query = {}

    await searchVideos(mockReq, mockRes)

    const findCall = (prisma.videoMetadata.findMany as jest.Mock).mock.calls[0][0]
    expect(findCall.where).toEqual({})
  })

  it('should return 400 if query validation fails', async () => {
    mockReq.query = { videoType: 'TUTORIAL' }

    await searchVideos(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(Array) })
    )
  })

  it('should return 500 if the database query fails', async () => {
    ;(prisma.videoMetadata.findMany as jest.Mock).mockRejectedValue(
      new Error('db unavailable')
    )
    mockReq.query = {}

    await searchVideos(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(500)
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' })
  })
})