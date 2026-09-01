import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ModuleService } from '../../src/services/ModuleService';
import { CourseService } from '../../src/services/CourseService';

// Mock prisma
vi.mock('../../src/config/database', () => {
  return {
    default: {
      module: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        count: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      course: {
        findUnique: vi.fn(),
      },
    },
  };
});

import prisma from '../../src/config/database';

// Mock CourseService
vi.mock('../../src/services/CourseService', () => {
  return {
    CourseService: {
      findCourseById: vi.fn(),
    },
  };
});

import { CourseService } from '../../src/services/CourseService';

describe('ModuleService', () => {
  const moduleStub = {
    id: '1',
    title: 'Introduction to Salsa',
    description: 'A beginner module',
    orderIndex: 0,
    courseId: 'course-1',
    _count: { sections: 2 },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const courseStub = {
    id: 'course-1',
    name: 'Mambo on2',
    description: 'Mambo On2 NY style',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findAllModules', () => {
    it('should return modules with pagination', async () => {
      (prisma.module.findMany as jest.Mock).mockResolvedValue([moduleStub]);
      (prisma.module.count as jest.Mock).mockResolvedValue(1);

      const result = await ModuleService.findAllModules({ page: 1, limit: 10, courseId: 'course-1' });

      expect(prisma.module.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { courseId: 'course-1', isDeleted: false },
          orderBy: { orderIndex: 'asc' },
          skip: 0,
          take: 10,
          include: {
            _count: { select: { sections: true } },
            course: { select: { id: true, name: true } },
          },
        })
      );
      expect(result.modules).toHaveLength(1);
      expect(result.modules[0].sectionCount).toBe(2);
      expect(result.pagination).toEqual({ page: 1, limit: 10, total: 1, pages: 1 });
    });

    it('should apply search filter when provided', async () => {
      (prisma.module.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.module.count as jest.Mock).mockResolvedValue(0);

      await ModuleService.findAllModules({ page: 1, limit: 10, search: 'salsa', courseId: 'course-1' });

      expect(prisma.module.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            courseId: 'course-1',
            isDeleted: false,
            OR: [
              { title: { contains: 'salsa', mode: 'insensitive' } },
              { description: { contains: 'salsa', mode: 'insensitive' } },
            ],
          },
        })
      );
    });

    it('should default to page 1 and limit 10', async () => {
      (prisma.module.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.module.count as jest.Mock).mockResolvedValue(0);

      await ModuleService.findAllModules({ courseId: 'course-1' });

      expect(prisma.module.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 10 })
      );
    });
  });

  describe('findModuleById', () => {
    it('should return a module with its sections', async () => {
      (prisma.module.findUnique as jest.Mock).mockResolvedValue(moduleStub);

      const result = await ModuleService.findModuleById('1');

      expect(prisma.module.findUnique).toHaveBeenCalledWith({
        where: { id: '1', isDeleted: false },
        include: {
          sections: {
            where: { isDeleted: false },
            orderBy: { orderIndex: 'asc' },
            select: {
              id: true,
              title: true,
              description: true,
              orderIndex: true,
              videoUrl: true,
              markdownContent: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });
      expect(result).toBe(moduleStub);
    });
  });

  describe('createModule', () => {
    it('should create a module with valid courseId', async () => {
      (CourseService.findCourseById as jest.Mock).mockResolvedValue(courseStub);
      (prisma.module.create as jest.Mock).mockResolvedValue(moduleStub);

      const result = await ModuleService.createModule({
        title: 'Introduction to Salsa',
        description: 'A beginner module',
        orderIndex: 1,
        courseId: 'course-1',
      });

      expect(CourseService.findCourseById).toHaveBeenCalledWith('course-1');
      expect(prisma.module.create).toHaveBeenCalledWith({
        data: {
          title: 'Introduction to Salsa',
          description: 'A beginner module',
          orderIndex: 1,
          courseId: 'course-1',
        },
      });
      expect(result).toBe(moduleStub);
    });

    it('should throw error when courseId does not exist', async () => {
      (CourseService.findCourseById as jest.Mock).mockResolvedValue(null);

      await expect(
        ModuleService.createModule({
          title: 'Test Module',
          description: 'Test Description',
          courseId: 'non-existent-course-id'
        })
      ).rejects.toThrow('Course not found');
    });
  });

  describe('updateModule', () => {
    it('should update a module by id', async () => {
      (prisma.module.update as jest.Mock).mockResolvedValue(moduleStub);

      const result = await ModuleService.updateModule('1', { title: 'Updated Title' });

      expect(prisma.module.update).toHaveBeenCalledWith({
        where: { id: '1', isDeleted: false },
        data: { title: 'Updated Title', description: undefined, orderIndex: undefined, courseId: undefined },
      });
      expect(result).toBe(moduleStub);
    });

    it('should throw error when updating with invalid courseId', async () => {
      (CourseService.findCourseById as jest.Mock).mockResolvedValue(null);

      await expect(
        ModuleService.updateModule('1', {
          title: 'Updated Title',
          courseId: 'non-existent-course-id'
        })
      ).rejects.toThrow('Course not found');
    });
  });

  describe('deleteModule', () => {
    it('should delete a module by id', async () => {
      (prisma.module.update as jest.Mock).mockResolvedValue(moduleStub);

      const result = await ModuleService.deleteModule('1');

      expect(prisma.module.update).toHaveBeenCalledWith({
        where: { id: '1', isDeleted: false },
        data: { isDeleted: true, deletedAt: expect.any(Date) },
      });
      expect(result).toBe(moduleStub);
    });
  });
});
