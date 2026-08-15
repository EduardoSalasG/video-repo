import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  findAllVideoMetadata,
  findVideoMetadataById,
  findVideoMetadataBySectionId,
  createVideoMetadata,
  updateVideoMetadata,
  deleteVideoMetadata,
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
          where: {},
          orderBy: { createdAt: 'desc' },
          skip: 0,
          take: 10,
        })
      );
      expect(prisma.videoMetadata.count).toHaveBeenCalledWith({
        where: {},
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
        expect.objectContaining({ skip: 0, take: 10, where: {} })
      );
      expect(prisma.videoMetadata.count).toHaveBeenCalledWith({
        where: {},
      });
    });
  });

  describe('findVideoMetadataById', () => {
    it('should return video metadata when found', async () => {
      (prisma.videoMetadata.findUnique as jest.Mock).mockResolvedValue(videoMetadataStub);

      const result = await findVideoMetadataById('vm1');

      expect(prisma.videoMetadata.findUnique).toHaveBeenCalledWith({
        where: { id: 'vm1' },
      });
      expect(result).toBe(videoMetadataStub);
    });

    it('should return null when not found', async () => {
      (prisma.videoMetadata.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await findVideoMetadataById('nonexistent');

      expect(prisma.videoMetadata.findUnique).toHaveBeenCalledWith({
        where: { id: 'nonexistent' },
      });
      expect(result).toBeNull();
    });
  });

  describe('findVideoMetadataBySectionId', () => {
    it('should return video metadata when found', async () => {
      (prisma.videoMetadata.findUnique as jest.Mock).mockResolvedValue(videoMetadataStub);

      const result = await findVideoMetadataBySectionId('s1');

      expect(prisma.videoMetadata.findUnique).toHaveBeenCalledWith({
        where: { sectionId: 's1' },
      });
      expect(result).toBe(videoMetadataStub);
    });

    it('should return null when not found', async () => {
      (prisma.videoMetadata.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await findVideoMetadataBySectionId('nonexistent');

      expect(prisma.videoMetadata.findUnique).toHaveBeenCalledWith({
        where: { sectionId: 'nonexistent' },
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

  describe('updateVideoMetadata', () => {
    it('should update video metadata by id', async () => {
      (prisma.videoMetadata.update as jest.Mock).mockResolvedValue(videoMetadataStub);

      const result = await updateVideoMetadata('vm1', {
        title: 'Updated Video Metadata',
        description: null,
      });

      expect(prisma.videoMetadata.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'vm1' },
          data: {
            steps: undefined,
            difficulty: undefined,
            primaryStyle: undefined,
            influences: undefined,
            durationCounts: undefined,
            videoType: undefined,
            tags: undefined,
            fileSize: null,
            durationSeconds: null,
            filename: null,
          },
        })
      );
      expect(result).toBe(videoMetadataStub);
    });
  });

  describe('deleteVideoMetadata', () => {
    it('should delete video metadata by id', async () => {
      (prisma.videoMetadata.delete as jest.Mock).mockResolvedValue(videoMetadataStub);

      const result = await deleteVideoMetadata('vm1');

      expect(prisma.videoMetadata.delete).toHaveBeenCalledWith({ where: { id: 'vm1' } });
      expect(result).toBe(videoMetadataStub);
    });
  });
});