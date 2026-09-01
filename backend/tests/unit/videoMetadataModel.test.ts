import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  findAllVideoMetadata,
  findVideoMetadataById,
  findVideoMetadataBySectionId,
  createVideoMetadata,
  updateVideoMetadataBySectionId,
  deleteVideoMetadataBySectionId,
} from '../../src/models/videoMetadata';

// Mock prisma
vi.mock('../../src/config/database', () => {
  return {
    default: {
      videoMetadata: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        count: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    },
  };
});

import prisma from '../../src/config/database';

describe('videoMetadata model', () => {
  const videoMetadataStub = {
    id: 'vm1',
    sectionId: 's1',
    steps: [{ step: 'basic step', count: 4 }],
    difficulty: 'BEGINNER',
    primaryStyle: 'MAMBO_ON2',
    influences: ['afro-cuban'],
    durationCounts: 8,
    videoType: 'STEP_BREAKDOWN',
    tags: ['beginner', 'steps'],
    fileSize: 1024000,
    durationSeconds: 120,
    filename: 'video1.mp4',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findAllVideoMetadata', () => {
    it('should return video metadata with pagination', async () => {
      (prisma.videoMetadata.findMany as jest.Mock).mockResolvedValue([videoMetadataStub]);
      (prisma.videoMetadata.count as jest.Mock).mockResolvedValue(1);

      const result = await findAllVideoMetadata({ page: 1, limit: 10 });

      expect(prisma.videoMetadata.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isDeleted: false },
          orderBy: { createdAt: 'desc' },
          skip: 0,
          take: 10,
        })
      );
      expect(prisma.videoMetadata.count).toHaveBeenCalledWith({
        where: { isDeleted: false },
      });
      expect(result.videoMetadata).toHaveLength(1);
      expect(result.videoMetadata[0].id).toBe('vm1');
      expect(result.pagination).toEqual({ page: 1, limit: 10, total: 1, pages: 1 });
    });

    it('should apply search filter when provided', async () => {
      (prisma.videoMetadata.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.videoMetadata.count as jest.Mock).mockResolvedValue(0);

      await findAllVideoMetadata({ page: 1, limit: 10, search: 's1' });

      expect(prisma.videoMetadata.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            isDeleted: false,
            OR: [
              { sectionId: { contains: 's1', mode: 'insensitive' } },
            ],
          },
          orderBy: { createdAt: 'desc' },
          skip: 0,
          take: 10,
        })
      );
      expect(prisma.videoMetadata.count).toHaveBeenCalledWith({
        where: {
          isDeleted: false,
          OR: [
            { sectionId: { contains: 's1', mode: 'insensitive' } },
          ],
        },
      });
    });

    it('should default to page 1 and limit 10', async () => {
      (prisma.videoMetadata.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.videoMetadata.count as jest.Mock).mockResolvedValue(0);

      await findAllVideoMetadata();

      expect(prisma.videoMetadata.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 10, where: { isDeleted: false } })
      );
      expect(prisma.videoMetadata.count).toHaveBeenCalledWith({
        where: { isDeleted: false },
      });
    });
  });

  describe('findVideoMetadataById', () => {
    it('should return video metadata when found', async () => {
      (prisma.videoMetadata.findUnique as jest.Mock).mockResolvedValue(videoMetadataStub);

      const result = await findVideoMetadataById('vm1');

      expect(prisma.videoMetadata.findUnique).toHaveBeenCalledWith({
        where: { id: 'vm1', isDeleted: false },
      });
      expect(result).toBe(videoMetadataStub);
    });

    it('should return null when not found', async () => {
      (prisma.videoMetadata.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await findVideoMetadataById('nonexistent');

      expect(prisma.videoMetadata.findUnique).toHaveBeenCalledWith({
        where: { id: 'nonexistent', isDeleted: false },
      });
      expect(result).toBeNull();
    });
  });

  describe('findVideoMetadataBySectionId', () => {
    it('should return video metadata when found', async () => {
      (prisma.videoMetadata.findUnique as jest.Mock).mockResolvedValue(videoMetadataStub);

      const result = await findVideoMetadataBySectionId('s1');

      expect(prisma.videoMetadata.findUnique).toHaveBeenCalledWith({
        where: { sectionId: 's1', isDeleted: false },
      });
      expect(result).toBe(videoMetadataStub);
    });

    it('should return null when not found', async () => {
      (prisma.videoMetadata.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await findVideoMetadataBySectionId('nonexistent');

      expect(prisma.videoMetadata.findUnique).toHaveBeenCalledWith({
        where: { sectionId: 'nonexistent', isDeleted: false },
      });
      expect(result).toBeNull();
    });
  });

  describe('createVideoMetadata', () => {
    it('should create video metadata with provided data', async () => {
      (prisma.videoMetadata.create as jest.Mock).mockResolvedValue(videoMetadataStub);

      const result = await createVideoMetadata({
        sectionId: 's1',
        steps: [{ step: 'basic step', count: 4 }],
        difficulty: 'BEGINNER',
        primaryStyle: 'MAMBO_ON2',
        influences: ['afro-cuban'],
        durationCounts: 8,
        videoType: 'STEP_BREAKDOWN',
        tags: ['beginner', 'steps'],
        fileSize: 1024000,
        durationSeconds: 120,
        filename: 'video1.mp4',
      });

      expect(prisma.videoMetadata.create).toHaveBeenCalledWith({
        data: {
          sectionId: 's1',
          steps: [{ step: 'basic step', count: 4 }],
          difficulty: 'BEGINNER',
          primaryStyle: 'MAMBO_ON2',
          influences: ['afro-cuban'],
          durationCounts: 8,
          videoType: 'STEP_BREAKDOWN',
          tags: ['beginner', 'steps'],
          fileSize: 1024000,
          durationSeconds: 120,
          filename: 'video1.mp4',
        },
      });
      expect(result).toBe(videoMetadataStub);
    });

    it('should default optional fields to null when not provided', async () => {
      (prisma.videoMetadata.create as jest.Mock).mockResolvedValue(videoMetadataStub);

      await createVideoMetadata({
        sectionId: 's1',
        steps: [{ step: 'basic step', count: 4 }],
        difficulty: 'BEGINNER',
        primaryStyle: 'MAMBO_ON2',
        influences: ['afro-cuban'],
        durationCounts: 8,
        videoType: 'STEP_BREAKDOWN',
        tags: ['beginner', 'steps'],
      });

      expect(prisma.videoMetadata.create).toHaveBeenCalledWith({
        data: {
          sectionId: 's1',
          steps: [{ step: 'basic step', count: 4 }],
          difficulty: 'BEGINNER',
          primaryStyle: 'MAMBO_ON2',
          influences: ['afro-cuban'],
          durationCounts: 8,
          videoType: 'STEP_BREAKDOWN',
          tags: ['beginner', 'steps'],
          fileSize: null,
          durationSeconds: null,
          filename: null,
        },
      });
    });
  });

  describe('updateVideoMetadataBySectionId', () => {
    it('should update video metadata by section id', async () => {
      (prisma.videoMetadata.update as jest.Mock).mockResolvedValue(videoMetadataStub);

      const result = await updateVideoMetadataBySectionId('s1', {
        title: 'Updated Video Metadata',
        description: null,
      });

      expect(prisma.videoMetadata.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { sectionId: 's1', isDeleted: false },
          data: {
            steps: undefined,
            difficulty: undefined,
            primaryStyle: undefined,
            influences: undefined,
            durationCounts: undefined,
            videoType: undefined,
            tags: undefined,
            fileSize: undefined,
            durationSeconds: undefined,
            filename: undefined,
          },
        })
      );
      expect(result).toBe(videoMetadataStub);
    });
  });

  describe('deleteVideoMetadataBySectionId', () => {
    it('should delete video metadata by section id', async () => {
      (prisma.videoMetadata.update as jest.Mock).mockResolvedValue(videoMetadataStub);

      const result = await deleteVideoMetadataBySectionId('s1');

      expect(prisma.videoMetadata.update).toHaveBeenCalledWith({
        where: { sectionId: 's1', isDeleted: false },
        data: { isDeleted: true, deletedAt: expect.any(Date) },
      });
      expect(result).toBe(videoMetadataStub);
    });
  });
});
