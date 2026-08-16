import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  upsertUserProgress,
  getUserProgressBySection,
  findAllUserProgress,
} from '../../src/models/userProgress';

// Mock prisma
vi.mock('../../src/config/database', () => {
  return {
    default: {
      userProgress: {
        upsert: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
      },
    },
  };
});

import prisma from '../../src/config/database';

describe('userProgress model', () => {
  const progressStub = {
    id: 'p1',
    userId: 'u1',
    sectionId: 's1',
    completedAt: null,
    lastPositionSeconds: 42,
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('upsertUserProgress', () => {
    it('should upsert progress for a user and section', async () => {
      (prisma.userProgress.upsert as jest.Mock).mockResolvedValue(progressStub);

      const result = await upsertUserProgress('u1', 's1', {
        completedAt: null,
        lastPositionSeconds: 42,
      });

      expect(prisma.userProgress.upsert).toHaveBeenCalledWith({
        where: { userId_sectionId: { userId: 'u1', sectionId: 's1' } },
        create: {
          userId: 'u1',
          sectionId: 's1',
          completedAt: null,
          lastPositionSeconds: 42,
        },
        update: {
          completedAt: null,
          lastPositionSeconds: 42,
        },
      });
      expect(result).toBe(progressStub);
    });

    it('should default omitted fields to null on create', async () => {
      (prisma.userProgress.upsert as jest.Mock).mockResolvedValue(progressStub);

      await upsertUserProgress('u1', 's1', {});

      expect(prisma.userProgress.upsert).toHaveBeenCalledWith({
        where: { userId_sectionId: { userId: 'u1', sectionId: 's1' } },
        create: {
          userId: 'u1',
          sectionId: 's1',
          completedAt: null,
          lastPositionSeconds: null,
        },
        update: {
          completedAt: undefined,
          lastPositionSeconds: undefined,
        },
      });
    });
  });

  describe('getUserProgressBySection', () => {
    it('should return progress when found', async () => {
      (prisma.userProgress.findUnique as jest.Mock).mockResolvedValue(progressStub);

      const result = await getUserProgressBySection('u1', 's1');

      expect(prisma.userProgress.findUnique).toHaveBeenCalledWith({
        where: { userId_sectionId: { userId: 'u1', sectionId: 's1' } },
      });
      expect(result).toBe(progressStub);
    });

    it('should return null when not found', async () => {
      (prisma.userProgress.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await getUserProgressBySection('u1', 'nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findAllUserProgress', () => {
    it('should return user progress with pagination', async () => {
      (prisma.userProgress.findMany as jest.Mock).mockResolvedValue([progressStub]);
      (prisma.userProgress.count as jest.Mock).mockResolvedValue(1);

      const result = await findAllUserProgress('u1', { page: 1, limit: 10 });

      expect(prisma.userProgress.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'u1' },
          orderBy: { updatedAt: 'desc' },
          skip: 0,
          take: 10,
        })
      );
      expect(prisma.userProgress.count).toHaveBeenCalledWith({
        where: { userId: 'u1' },
      });
      expect(result.progress).toHaveLength(1);
      expect(result.progress[0].id).toBe('p1');
      expect(result.pagination).toEqual({ page: 1, limit: 10, total: 1, pages: 1 });
    });

    it('should default to page 1 and limit 10', async () => {
      (prisma.userProgress.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.userProgress.count as jest.Mock).mockResolvedValue(0);

      await findAllUserProgress('u1');

      expect(prisma.userProgress.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 10, where: { userId: 'u1' } })
      );
      expect(prisma.userProgress.count).toHaveBeenCalledWith({
        where: { userId: 'u1' },
      });
    });
  });
});