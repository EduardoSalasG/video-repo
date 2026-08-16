import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  findAllModules,
  findModuleById,
  createModule,
  updateModule,
  deleteModule,
} from '../../src/models/module';

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
    },
  };
});

import prisma from '../../src/config/database';

describe('module model', () => {
  const moduleStub = {
    id: '1',
    title: 'Introduction to Salsa',
    description: 'A beginner module',
    orderIndex: 0,
    _count: { sections: 2 },
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

      const result = await findAllModules({ page: 1, limit: 10 });

      expect(prisma.module.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { orderIndex: 'asc' },
          skip: 0,
          take: 10,
          include: { _count: { select: { sections: true } } },
        })
      );
      expect(result.modules).toHaveLength(1);
      expect(result.modules[0].sectionCount).toBe(2);
      expect(result.pagination).toEqual({ page: 1, limit: 10, total: 1, pages: 1 });
    });

    it('should apply search filter when provided', async () => {
      (prisma.module.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.module.count as jest.Mock).mockResolvedValue(0);

      await findAllModules({ page: 1, limit: 10, search: 'salsa' });

      expect(prisma.module.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
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

      await findAllModules();

      expect(prisma.module.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 10 })
      );
    });
  });

  describe('findModuleById', () => {
    it('should return a module with its sections', async () => {
      const fullModule = { ...moduleStub, sections: [] };
      (prisma.module.findUnique as jest.Mock).mockResolvedValue(fullModule);

      const result = await findModuleById('1');

      expect(prisma.module.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          sections: {
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
      expect(result).toBe(fullModule);
    });
  });

  describe('createModule', () => {
    it('should create a module with provided data', async () => {
      (prisma.module.create as jest.Mock).mockResolvedValue(moduleStub);

      const result = await createModule({
        title: 'Introduction to Salsa',
        description: 'A beginner module',
        orderIndex: 1,
      });

      expect(prisma.module.create).toHaveBeenCalledWith({
        data: {
          title: 'Introduction to Salsa',
          description: 'A beginner module',
          orderIndex: 1,
        },
      });
      expect(result).toBe(moduleStub);
    });

    it('should default orderIndex to 0 when not provided', async () => {
      (prisma.module.create as jest.Mock).mockResolvedValue(moduleStub);

      await createModule({ title: 'Introduction to Salsa' });

      expect(prisma.module.create).toHaveBeenCalledWith({
        data: {
          title: 'Introduction to Salsa',
          description: undefined,
          orderIndex: 0,
        },
      });
    });
  });

  describe('updateModule', () => {
    it('should update a module by id', async () => {
      (prisma.module.update as jest.Mock).mockResolvedValue(moduleStub);

      const result = await updateModule('1', { title: 'Updated Title' });

      expect(prisma.module.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { title: 'Updated Title', description: undefined, orderIndex: undefined },
      });
      expect(result).toBe(moduleStub);
    });
  });

  describe('deleteModule', () => {
    it('should delete a module by id', async () => {
      (prisma.module.delete as jest.Mock).mockResolvedValue(moduleStub);

      const result = await deleteModule('1');

      expect(prisma.module.delete).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toBe(moduleStub);
    });
  });
});