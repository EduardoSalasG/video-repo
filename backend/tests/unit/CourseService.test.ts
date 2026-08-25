import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CourseService } from '../../src/services/CourseService';

// Mock prisma
vi.mock('../../src/config/database', () => {
  return {
    default: {
      course: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    },
  };
});

import prisma from '../../src/config/database';

describe('CourseService', () => {
  const courseStub = {
    id: '1',
    name: 'Mambo on2',
    description: 'Mambo On2 NY style',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findAllCourses', () => {
    it('should return empty array when no courses exist', async () => {
      (prisma.course.findMany as jest.Mock).mockResolvedValue([]);
      const courses = await CourseService.findAllCourses();
      expect(courses).toEqual([]);
    });
  });

  describe('findCourseById', () => {
    it('should return a course by id', async () => {
      (prisma.course.findUnique as jest.Mock).mockResolvedValue(courseStub);
      const course = await CourseService.findCourseById('1');
      expect(prisma.course.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(course).toBe(courseStub);
    });
  });

  describe('createCourse', () => {
    it('should create a course with provided data', async () => {
      (prisma.course.create as jest.Mock).mockResolvedValue(courseStub);
      const course = await CourseService.createCourse({ name: 'Mambo on2', description: 'Mambo On2 NY style' });
      expect(prisma.course.create).toHaveBeenCalledWith({
        data: { name: 'Mambo on2', description: 'Mambo On2 NY style' },
      });
      expect(course).toBe(courseStub);
    });
  });

  describe('updateCourse', () => {
    it('should update a course by id', async () => {
      (prisma.course.update as jest.Mock).mockResolvedValue(courseStub);
      const course = await CourseService.updateCourse('1', { name: 'Updated Name' });
      expect(prisma.course.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { name: 'Updated Name', description: undefined },
      });
      expect(course).toBe(courseStub);
    });
  });

  describe('deleteCourse', () => {
    it('should delete a course by id', async () => {
      (prisma.course.delete as jest.Mock).mockResolvedValue(courseStub);
      const course = await CourseService.deleteCourse('1');
      expect(prisma.course.delete).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(course).toBe(courseStub);
    });
  });
});