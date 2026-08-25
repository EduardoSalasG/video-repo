import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getModules,
  getModuleById,
  createModuleController,
  updateModuleController,
  deleteModuleController,
} from '../../src/controllers/moduleController';
import { ModuleService } from '../../src/services/ModuleService';

// Mock ModuleService
vi.mock('../../src/services/ModuleService');

describe('moduleController', () => {
  let mockReq: any;
  let mockRes: any;

  const moduleStub = {
    id: '1',
    title: 'Introduction to Salsa',
    description: 'A beginner module',
    orderIndex: 0,
    courseId: 'course-1',
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
    mockReq = { body: {}, params: {}, query: {} };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };
    vi.clearAllMocks();
  });

  describe('getModules', () => {
    it('should return a paginated list of modules for a course', async () => {
      (ModuleService.findAllModules as jest.Mock).mockResolvedValue({
        modules: [moduleStub],
        pagination: { page: 1, limit: 10, total: 1, pages: 1 },
      });
      mockReq.params = { courseId: 'course-1' };
      mockReq.query = { page: '1', limit: '10' };

      await getModules(mockReq, mockRes);

      expect(ModuleService.findAllModules).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        courseId: 'course-1',
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        modules: [moduleStub],
        pagination: { page: 1, limit: 10, total: 1, pages: 1 },
      });
    });

    it('should return 400 if query validation fails', async () => {
      mockReq.params = { courseId: 'course-1' };
      mockReq.query = { page: '-1' };

      await getModules(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(Array) })
      );
    });
  });

  describe('getModuleById', () => {
    it('should return a module when found', async () => {
      (ModuleService.findModuleById as jest.Mock).mockResolvedValue(moduleStub);
      mockReq.params = { courseId: 'course-1', moduleId: '1' };

      await getModuleById(mockReq, mockRes);

      expect(ModuleService.findModuleById).toHaveBeenCalledWith('1');
      expect(mockRes.json).toHaveBeenCalledWith(moduleStub);
    });

    it('should return 404 when module is not found', async () => {
      (ModuleService.findModuleById as jest.Mock).mockResolvedValue(null);
      mockReq.params = { courseId: 'course-1', moduleId: '1' };

      await getModuleById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Module not found' });
    });

    it('should return 400 if id param is missing', async () => {
      mockReq.params = { courseId: 'course-1' };
      mockReq.params = {};

      await getModuleById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(Array) })
      );
    });
  });

  describe('createModuleController', () => {
    it('should create a module and return 201', async () => {
      (ModuleService.createModule as jest.Mock).mockResolvedValue(moduleStub);
      mockReq.params = { courseId: 'course-1' };
      mockReq.body = {
        title: 'Introduction to Salsa',
        description: 'A beginner module',
        orderIndex: 0,
      };

      await createModuleController(mockReq, mockRes);

      expect(ModuleService.createModule).toHaveBeenCalledWith({
        title: 'Introduction to Salsa',
        description: 'A beginner module',
        orderIndex: 0,
        courseId: 'course-1',
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(moduleStub);
    });

    it('should return 400 if body validation fails', async () => {
      mockReq.params = { courseId: 'course-1' };
      mockReq.body = { title: '' };

      await createModuleController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(Array) })
      );
    });
  });

  describe('updateModuleController', () => {
    it('should update a module and return 200', async () => {
      const updated = { ...moduleStub, title: 'Updated' };
      (ModuleService.updateModule as jest.Mock).mockResolvedValue(updated);
      mockReq.params = { courseId: 'course-1', moduleId: '1' };
      mockReq.body = { title: 'Updated' };

      await updateModuleController(mockReq, mockRes);

      console.log('ModuleService.updateModule mock calls:', (ModuleService.updateModule as jest.Mock).mock.calls);
      console.log('mockRes.status calls:', mockRes.status.mock.calls);
      console.log('mockRes.json calls:', mockRes.json.mock.calls);
      
      expect(ModuleService.updateModule).toHaveBeenCalledWith('1', {
        title: 'Updated',
        courseId: 'course-1',
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(updated);
    });

    it('should return 404 when module is not found', async () => {
      (ModuleService.updateModule as jest.Mock).mockRejectedValue({ code: 'P2025' });
      mockReq.params = { courseId: 'course-1', moduleId: '1' };
      mockReq.body = { title: 'Updated' };

      await updateModuleController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Module not found' });
    });

    it('should return 400 if body validation fails', async () => {
      mockReq.params = { courseId: 'course-1', moduleId: '1' };
      mockReq.body = { title: '' };

      await updateModuleController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(Array) })
      );
    });
  });

  describe('deleteModuleController', () => {
    it('should delete a module and return 204', async () => {
      (ModuleService.deleteModule as jest.Mock).mockResolvedValue(moduleStub);
      mockReq.params = { courseId: 'course-1', moduleId: '1' };

      await deleteModuleController(mockReq, mockRes);

      expect(ModuleService.deleteModule).toHaveBeenCalledWith('1');
      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.send).toHaveBeenCalled();
    });

    it('should return 404 when module is not found', async () => {
      (ModuleService.deleteModule as jest.Mock).mockRejectedValue({ code: 'P2025' });
      mockReq.params = { courseId: 'course-1', moduleId: '1' };

      await deleteModuleController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Module not found' });
    });
  });
});