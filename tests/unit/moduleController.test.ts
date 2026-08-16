import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getModules,
  getModuleById,
  createModuleController,
  updateModuleController,
  deleteModuleController,
} from '../../src/controllers/moduleController';
import {
  findAllModules,
  findModuleById,
  createModule,
  updateModule,
  deleteModule,
} from '../../src/models/module';

// Mock the module model
vi.mock('../../src/models/module', () => {
  return {
    findAllModules: vi.fn(),
    findModuleById: vi.fn(),
    createModule: vi.fn(),
    updateModule: vi.fn(),
    deleteModule: vi.fn(),
  };
});

import {
  findAllModules as findAllModulesMock,
  findModuleById as findModuleByIdMock,
  createModule as createModuleMock,
  updateModule as updateModuleMock,
  deleteModule as deleteModuleMock,
} from '../../src/models/module';

describe('moduleController', () => {
  let mockReq: any;
  let mockRes: any;

  const moduleStub = {
    id: '1',
    title: 'Introduction to Salsa',
    description: 'A beginner module',
    orderIndex: 0,
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
    it('should return a paginated list of modules', async () => {
      (findAllModulesMock as jest.Mock).mockResolvedValue({
        modules: [moduleStub],
        pagination: { page: 1, limit: 10, total: 1, pages: 1 },
      });
      mockReq.query = { page: '1', limit: '10' };

      await getModules(mockReq, mockRes);

      expect(findAllModulesMock).toHaveBeenCalledWith({ page: 1, limit: 10 });
      expect(mockRes.json).toHaveBeenCalledWith({
        modules: [moduleStub],
        pagination: { page: 1, limit: 10, total: 1, pages: 1 },
      });
    });

    it('should return 400 if query validation fails', async () => {
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
      (findModuleByIdMock as jest.Mock).mockResolvedValue({
        ...moduleStub,
        sections: [],
      });
      mockReq.params = { id: '1' };

      await getModuleById(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        ...moduleStub,
        sections: [],
      });
    });

    it('should return 404 when module is not found', async () => {
      (findModuleByIdMock as jest.Mock).mockResolvedValue(null);
      mockReq.params = { id: '1' };

      await getModuleById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Module not found' });
    });

    it('should return 400 if id param is missing', async () => {
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
      (createModuleMock as jest.Mock).mockResolvedValue(moduleStub);
      mockReq.body = {
        title: 'Introduction to Salsa',
        description: 'A beginner module',
        orderIndex: 0,
      };

      await createModuleController(mockReq, mockRes);

      expect(createModuleMock).toHaveBeenCalledWith(mockReq.body);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(moduleStub);
    });

    it('should return 400 if body validation fails', async () => {
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
      (updateModuleMock as jest.Mock).mockResolvedValue(updated);
      mockReq.params = { id: '1' };
      mockReq.body = { title: 'Updated' };

      await updateModuleController(mockReq, mockRes);

      expect(updateModuleMock).toHaveBeenCalledWith('1', { title: 'Updated' });
      expect(mockRes.json).toHaveBeenCalledWith(updated);
    });

    it('should return 404 when module is not found', async () => {
      (updateModuleMock as jest.Mock).mockRejectedValue({ code: 'P2025' });
      mockReq.params = { id: '1' };
      mockReq.body = { title: 'Updated' };

      await updateModuleController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Module not found' });
    });

    it('should return 400 if body validation fails', async () => {
      mockReq.params = { id: '1' };
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
      (deleteModuleMock as jest.Mock).mockResolvedValue(moduleStub);
      mockReq.params = { id: '1' };

      await deleteModuleController(mockReq, mockRes);

      expect(deleteModuleMock).toHaveBeenCalledWith('1');
      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.send).toHaveBeenCalled();
    });

    it('should return 404 when module is not found', async () => {
      (deleteModuleMock as jest.Mock).mockRejectedValue({ code: 'P2025' });
      mockReq.params = { id: '1' };

      await deleteModuleController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Module not found' });
    });
  });
});