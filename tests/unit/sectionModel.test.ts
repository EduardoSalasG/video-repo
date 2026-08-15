import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  findAllSections,
  findSectionById,
  createSection,
  updateSection,
  deleteSection,
} from '../../src/models/section';

// Mock prisma
vi.mock('../../src/config/database', () => {
  return {
    default: {
      section: {
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

describe('section model', () => {
  const sectionStub = {
    id: '1',
    moduleId: 'module1',
    title: 'Introduction to Steps',
    description: 'A beginner section',
    orderIndex: 0,
    videoUrl: null,
    markdownContent: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findAllSections', () => {
    it('should return sections with pagination', async () => {
      (prisma.section.findMany as jest.Mock).mockResolvedValue([sectionStub]);
      (prisma.section.count as jest.Mock).mockResolvedValue(1);

      const result = await findAllSections('module1', { page: 1, limit: 10 });

      expect(prisma.section.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { moduleId: 'module1' },
          orderBy: { orderIndex: 'asc' },
          skip: 0,
          take: 10,
        })
      );
      expect(prisma.section.count).toHaveBeenCalledWith({
        where: { moduleId: 'module1' },
      });
      expect(result.sections).toHaveLength(1);
      expect(result.sections[0].id).toBe('1');
      expect(result.pagination).toEqual({ page: 1, limit: 10, total: 1, pages: 1 });
    });

    it('should apply search filter when provided', async () => {
      (prisma.section.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.section.count as jest.Mock).mockResolvedValue(0);

      await findAllSections('module1', { page: 1, limit: 10, search: 'steps' });

      expect(prisma.section.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            moduleId: 'module1',
            OR: [
              { title: { contains: 'steps', mode: 'insensitive' } },
              {
                description: { contains: 'steps', mode: 'insensitive' },
              },
            ],
          },
        })
      );
    });

    it('should default to page 1 and limit 10', async () => {
      (prisma.section.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.section.count as jest.Mock).mockResolvedValue(0);

      await findAllSections('module1');

      expect(prisma.section.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 10, where: { moduleId: 'module1' } })
      );
      expect(prisma.section.count).toHaveBeenCalledWith({
        where: { moduleId: 'module1' },
      });
    });
  });

  describe('findSectionById', () => {
    it('should return a section when found', async () => {
      (prisma.section.findUnique as jest.Mock).mockResolvedValue(sectionStub);

      const result = await findSectionById('1');

      expect(prisma.section.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toBe(sectionStub);
    });
  });

  describe('createSection', () => {
    it('should create a section with provided data', async () => {
      (prisma.section.create as jest.Mock).mockResolvedValue(sectionStub);

      const result = await createSection({
        moduleId: 'module1',
        title: 'Introduction to Steps',
        description: 'A beginner section',
        orderIndex: 1,
        videoUrl: 'https://example.com/video.mp4',
        markdownContent: '# Steps',
      });

      expect(prisma.section.create).toHaveBeenCalledWith({
        data: {
          moduleId: 'module1',
          title: 'Introduction to Steps',
          description: 'A beginner section',
          orderIndex: 1,
          videoUrl: 'https://example.com/video.mp4',
          markdownContent: '# Steps',
        },
      });
      expect(result).toBe(sectionStub);
    });

    it('should default orderIndex to 0 when not provided', async () => {
      (prisma.section.create as jest.Mock).mockResolvedValue(sectionStub);

      await createSection({
        moduleId: 'module1',
        title: 'Introduction to Steps',
      });

      expect(prisma.section.create).toHaveBeenCalledWith({
        data: {
          moduleId: 'module1',
          title: 'Introduction to Steps',
          description: undefined,
          orderIndex: 0,
          videoUrl: undefined,
          markdownContent: undefined,
        },
      });
    });
  });

  describe('updateSection', () => {
    it('should update a section by id', async () => {
      (prisma.section.update as jest.Mock).mockResolvedValue(sectionStub);

      const result = await updateSection('1', {
        title: 'Updated Section',
        description: null,
      });

      expect(prisma.section.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: '1' },
          data: {
            title: 'Updated Section',
            description: null,
            orderIndex: undefined,
            videoUrl: undefined,
            markdownContent: undefined,
          },
        })
      );
      expect(result).toBe(sectionStub);
    });
  });

  describe('deleteSection', () => {
    it('should delete a section by id', async () => {
      (prisma.section.delete as jest.Mock).mockResolvedValue(sectionStub);

      const result = await deleteSection('1');

      expect(prisma.section.delete).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toBe(sectionStub);
    });
  });
});