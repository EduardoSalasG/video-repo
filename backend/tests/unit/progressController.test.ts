import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getProgress,
  updateProgress,
  markProgressComplete,
  getAllProgress,
} from '../../src/controllers/progressController';
import {
  upsertUserProgress,
  getUserProgressBySection,
  findAllUserProgress,
} from '../../src/models/userProgress';
import { findSectionById } from '../../src/models/section';
import { findModuleById } from '../../src/models/module';

// Mock the userProgress model
vi.mock('../../src/models/userProgress', () => {
  return {
    upsertUserProgress: vi.fn(),
    getUserProgressBySection: vi.fn(),
    findAllUserProgress: vi.fn(),
  };
});

// Mock prisma client
vi.mock('../../src/config/database', () => ({
  default: {
    section: {
      findUnique: vi.fn(),
    },
  },
}));

import {
  upsertUserProgress as upsertUserProgressMock,
  getUserProgressBySection as getUserProgressBySectionMock,
  findAllUserProgress as findAllUserProgressMock,
} from '../../src/models/userProgress';
import prisma from '../../src/config/database';

describe('progressController', () => {
  let mockReq: any;
  let mockRes: any;

  const progressStub = {
    id: 'p1',
    userId: 'u1',
    sectionId: 's1',
    completedAt: null,
    lastPositionSeconds: 42,
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockReq = { body: {}, params: {}, query: {}, user: { id: 'u1' } };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };
    vi.clearAllMocks();
  });

  describe('getProgress', () => {
    it('should return progress for the current user and section', async () => {
      (getUserProgressBySectionMock as jest.Mock).mockResolvedValue(progressStub);
      // Mock the section query to return a section with module and course
      prisma.section.findUnique.mockResolvedValue({
        module: {
          course: {
            id: 'course-1',
            name: 'Test Course'
          }
        }
      });
      mockReq.params = { sectionId: 's1' };

      await getProgress(mockReq, mockRes);

      expect(getUserProgressBySectionMock).toHaveBeenCalledWith('u1', 's1');
      expect(prisma.section.findUnique).toHaveBeenCalledWith({
        where: { id: 's1' },
        include: {
          module: {
            include: {
              course: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        ...progressStub,
        courseId: 'course-1',
        courseName: 'Test Course'
      });
    });

    it('should return 404 when no progress exists for the section', async () => {
      (getUserProgressBySectionMock as jest.Mock).mockResolvedValue(null);
      mockReq.params = { sectionId: 's1' };

      await getProgress(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Progress not found for this section',
      });
    });

    it('should return 401 when there is no authenticated user', async () => {
      mockReq.user = undefined;
      mockReq.params = { sectionId: 's1' };

      await getProgress(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    it('should return 400 if sectionId param is missing', async () => {
      mockReq.params = {};

      await getProgress(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(Array) })
      );
    });
  });

  describe('updateProgress', () => {
    it('should upsert progress for the current user and return 200', async () => {
      (upsertUserProgressMock as jest.Mock).mockResolvedValue(progressStub);
      mockReq.params = { sectionId: 's1' };
      mockReq.body = { lastPositionSeconds: 42 };

      await updateProgress(mockReq, mockRes);

      expect(upsertUserProgressMock).toHaveBeenCalledWith('u1', 's1', {
        lastPositionSeconds: 42,
      });
      expect(mockRes.json).toHaveBeenCalledWith(progressStub);
    });

    it('should return 401 when there is no authenticated user', async () => {
      mockReq.user = undefined;
      mockReq.params = { sectionId: 's1' };
      mockReq.body = { lastPositionSeconds: 42 };

      await updateProgress(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    it('should return 404 when the section does not exist', async () => {
      (upsertUserProgressMock as jest.Mock).mockRejectedValue({ code: 'P2003' });
      mockReq.params = { sectionId: 'nonexistent' };
      mockReq.body = { lastPositionSeconds: 42 };

      await updateProgress(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Section not found' });
    });

    it('should return 400 if body validation fails', async () => {
      mockReq.params = { sectionId: 's1' };
      mockReq.body = { lastPositionSeconds: -5 };

      await updateProgress(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(Array) })
      );
    });
  });

  describe('markProgressComplete', () => {
    it('should mark progress complete with a default timestamp', async () => {
      (upsertUserProgressMock as jest.Mock).mockResolvedValue({
        ...progressStub,
        completedAt: new Date(),
      });
      mockReq.params = { sectionId: 's1' };
      mockReq.body = {};

      await markProgressComplete(mockReq, mockRes);

      expect(upsertUserProgressMock).toHaveBeenCalledWith(
        'u1',
        's1',
        expect.objectContaining({ completedAt: expect.any(Date) })
      );
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ completedAt: expect.any(Date) })
      );
    });

    it('should use a provided completedAt timestamp', async () => {
      const completedAt = new Date('2024-01-01T00:00:00.000Z');
      (upsertUserProgressMock as jest.Mock).mockResolvedValue({
        ...progressStub,
        completedAt,
      });
      mockReq.params = { sectionId: 's1' };
      mockReq.body = { completedAt: '2024-01-01T00:00:00.000Z' };

      await markProgressComplete(mockReq, mockRes);

      expect(upsertUserProgressMock).toHaveBeenCalledWith('u1', 's1', { completedAt });
    });

    it('should return 401 when there is no authenticated user', async () => {
      mockReq.user = undefined;
      mockReq.params = { sectionId: 's1' };
      mockReq.body = {};

      await markProgressComplete(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    it('should return 400 if completedAt is invalid', async () => {
      mockReq.params = { sectionId: 's1' };
      mockReq.body = { completedAt: 'not-a-date' };

      await markProgressComplete(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(Array) })
      );
    });
  });

  describe('getAllProgress', () => {
    it('should return a paginated list of the current user progress', async () => {
      (findAllUserProgressMock as jest.Mock).mockResolvedValue({
        progress: [progressStub],
        pagination: { page: 1, limit: 10, total: 1, pages: 1 },
      });
      // Mock the section queries for each progress item
      prisma.section.findUnique.mockResolvedValue({
        module: {
          course: {
            id: 'course-1',
            name: 'Test Course'
          }
        }
      });
      mockReq.query = { page: '1', limit: '10' };

      await getAllProgress(mockReq, mockRes);

      expect(findAllUserProgressMock).toHaveBeenCalledWith('u1', {
        page: 1,
        limit: 10,
      });
      expect(prisma.section.findUnique).toHaveBeenCalledWith({
        where: { id: 's1' },
        include: {
          module: {
            include: {
              course: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        progress: [
          {
            ...progressStub,
            courseId: 'course-1',
            courseName: 'Test Course'
          }
        ],
        pagination: { page: 1, limit: 10, total: 1, pages: 1 },
      });
    });

    it('should return 401 when there is no authenticated user', async () => {
      mockReq.user = undefined;
      mockReq.query = {};

      await getAllProgress(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    it('should return 400 if query validation fails', async () => {
      mockReq.query = { page: '-1' };

      await getAllProgress(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(Array) })
      );
    });
  });
});