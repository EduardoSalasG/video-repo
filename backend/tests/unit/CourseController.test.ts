import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CourseController } from '../../src/controllers/CourseController';
import { CourseService } from '../../src/services/CourseService';

// Mock CourseService
vi.mock('../../src/services/CourseService');

describe('Course Controller', () => {
  let mockReq: any;
  let mockRes: any;

  beforeEach(() => {
    mockReq = { params: {}, query: {}, body: {} };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    vi.clearAllMocks();
  });

  describe('GET /courses', () => {
    it('should return empty array when no courses exist', async () => {
      (CourseService.findAllCourses as jest.Mock).mockResolvedValue([]);
      await CourseController.getAllCourses(mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalledWith({
        courses: [],
      });
    });
  });
});