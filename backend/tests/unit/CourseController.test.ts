import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CourseController } from '../../src/controllers/CourseController';
import { CourseService } from '../../src/services/CourseService';

// Mock CourseService
vi.mock('../../src/services/CourseService');

describe('Course Controller', () => {
  let mockReq: any;
  let mockRes: any;

  beforeEach(() => {
    mockReq = { params: {}, query: {}, body: {}, user: { id: 'admin-1', role: 'ADMIN' } };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    vi.clearAllMocks();
  });

  describe('GET /courses', () => {
    it('should return empty array when no courses exist', async () => {
      (CourseService.findAllCoursesPaginated as jest.Mock).mockResolvedValue({
        courses: [],
        pagination: { page: 1, limit: 12, total: 0, pages: 0 },
      });
      await CourseController.getAllCourses(mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalledWith({
        courses: [],
        pagination: { page: 1, limit: 12, total: 0, pages: 0 },
      });
    });
  });
});
