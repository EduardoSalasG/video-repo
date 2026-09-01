import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CourseService } from '../../src/services/CourseService';

vi.mock('../../src/config/database', () => ({
  default: {
    course: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import prisma from '../../src/config/database';

describe('CourseService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lists only active courses with pagination and search', async () => {
    const courses = [{ id: 'course-1', name: 'Mambo', description: null }];
    (prisma.course.findMany as jest.Mock).mockResolvedValue(courses);
    (prisma.course.count as jest.Mock).mockResolvedValue(1);

    await expect(
      CourseService.findAllCoursesPaginated({ page: 2, limit: 5, search: 'mambo' })
    ).resolves.toEqual({
      courses,
      pagination: { page: 2, limit: 5, total: 1, pages: 1 },
    });

    expect(prisma.course.findMany).toHaveBeenCalledWith({
      where: {
        isDeleted: false,
        OR: [
          { name: { contains: 'mambo', mode: 'insensitive' } },
          { description: { contains: 'mambo', mode: 'insensitive' } },
        ],
      },
      skip: 5,
      take: 5,
      orderBy: { createdAt: 'desc' },
    });
  });

  it('soft-deletes an active course', async () => {
    (prisma.course.update as jest.Mock).mockResolvedValue({ id: 'course-1' });

    await CourseService.deleteCourse('course-1');

    expect(prisma.course.update).toHaveBeenCalledWith({
      where: { id: 'course-1', isDeleted: false },
      data: { isDeleted: true, deletedAt: expect.any(Date) },
    });
  });
});
