import { describe, expect, it, vi } from 'vitest';
import {
  type SeedDatabaseClient,
  seedDatabase,
} from '../../src/bootstrap/seedDatabase';

function createPrismaStub() {
  return {
    user: { upsert: vi.fn() },
    course: { findFirst: vi.fn(), create: vi.fn() },
    courseUserAccess: { upsert: vi.fn() },
  };
}

describe('seedDatabase', () => {
  it('reuses an active course instead of creating a duplicate', async () => {
    const prisma = createPrismaStub();
    const existingCourse = { id: 'course-1', name: 'Mambo on2' };
    prisma.user.upsert
      .mockResolvedValueOnce({ id: 'admin-1' })
      .mockResolvedValueOnce({ id: 'instructor-1' })
      .mockResolvedValueOnce({ id: 'student-1' });
    prisma.course.findFirst.mockResolvedValue(existingCourse);

    await seedDatabase({
      prisma: prisma as unknown as SeedDatabaseClient,
      hashPassword: vi.fn().mockResolvedValue('hash'),
    });

    expect(prisma.course.findFirst).toHaveBeenCalledWith({
      where: { name: 'Mambo on2', isDeleted: false },
    });
    expect(prisma.course.create).not.toHaveBeenCalled();
    expect(prisma.courseUserAccess.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId_courseId: { userId: 'admin-1', courseId: 'course-1' } },
      })
    );
  });
});
