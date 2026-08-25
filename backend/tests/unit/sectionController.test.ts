import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getSections,
  getSectionById,
  createSectionController,
  updateSectionController,
  deleteSectionController,
} from '../../src/controllers/sectionController';
import {
  findAllSections,
  findSectionById,
  createSection,
  updateSection,
  deleteSection,
} from '../../src/models/section';
import { ModuleService } from '../../src/services/ModuleService';
import { CourseService } from '../../src/services/CourseService';

// Mock the section model
vi.mock('../../src/models/section', () => {
  return {
    findAllSections: vi.fn(),
    findSectionById: vi.fn(),
    createSection: vi.fn(),
    updateSection: vi.fn(),
    deleteSection: vi.fn(),
  };
});

// Mock ModuleService
vi.mock('../../src/services/ModuleService');
// Mock CourseService
vi.mock('../../src/services/CourseService');

import {
  findAllSections as findAllSectionsMock,
  findSectionById as findSectionByIdMock,
  createSection as createSectionMock,
  updateSection as updateSectionMock,
  deleteSection as deleteSectionMock,
} from '../../src/models/section';

describe('sectionController', () => {
  let mockReq: any;
  let mockRes: any;

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
    mockReq = { body: {}, params: {}, query: {} };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };
    vi.clearAllMocks();
  });

  describe('getSections', () => {
    it('should return a paginated list of sections for a module', async () => {
      (findAllSectionsMock as jest.Mock).mockResolvedValue({
        sections: [sectionStub],
        pagination: { page: 1, limit: 10, total: 1, pages: 1 },
      });
      // Mock ModuleService.findModuleById to return a module with the matching courseId
      (ModuleService.findModuleById as jest.Mock).mockResolvedValue({ id: 'module1', courseId: 'course-1' });
      mockReq.params = { courseId: 'course-1', moduleId: 'module1' };
      mockReq.query = { page: '1', limit: '10' };

      await getSections(mockReq, mockRes);

      expect(findAllSectionsMock).toHaveBeenCalledWith('module1', { page: 1, limit: 10 });
      expect(mockRes.json).toHaveBeenCalledWith({
        sections: [sectionStub],
        pagination: { page: 1, limit: 10, total: 1, pages: 1 },
      });
    });

    it('should return 400 if query validation fails', async () => {
      // Mock ModuleService.findModuleById
      (ModuleService.findModuleById as jest.Mock).mockResolvedValue({ id: 'module1', courseId: 'course-1' });
      mockReq.params = { courseId: 'course-1', moduleId: 'module1' };
      mockReq.query = { page: '-1' };

      await getSections(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(Array) })
      );
    });
  });

describe('getSectionById', () => {
      it('should return a section when found', async () => {
        (findSectionByIdMock as jest.Mock).mockResolvedValue(sectionStub);
        // Mock ModuleService.findModuleById
        (ModuleService.findModuleById as jest.Mock).mockResolvedValue({ id: 'module1', courseId: 'course-1' });
        mockReq.params = { courseId: 'course-1', sectionId: '1', moduleId: 'module1' };

        await getSectionById(mockReq, mockRes);

        expect(findSectionByIdMock).toHaveBeenCalledWith('1', 'module1');
        expect(mockRes.json).toHaveBeenCalledWith(sectionStub);
      });

      it('should return 404 when section is not found', async () => {
        (findSectionByIdMock as jest.Mock).mockResolvedValue(null);
        // Mock ModuleService.findModuleById
        (ModuleService.findModuleById as jest.Mock).mockResolvedValue({ id: 'module1', courseId: 'course-1' });
        mockReq.params = { courseId: 'course-1', sectionId: '1', moduleId: 'module1' };

        await getSectionById(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Section not found' });
      });

      it('should return 400 if id param is missing', async () => {
        // Mock ModuleService.findModuleById
        (ModuleService.findModuleById as jest.Mock).mockResolvedValue({ id: 'module1', courseId: 'course-1' });
        mockReq.params = { courseId: 'course-1', moduleId: 'module1' };

        await getSectionById(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith(
          expect.objectContaining({ error: expect.any(Array) })
        );
      });

      it('should return 400 if moduleId param is missing', async () => {
        // Mock ModuleService.findModuleById
        (ModuleService.findModuleById as jest.Mock).mockResolvedValue({ id: 'module1', courseId: 'course-1' });
        mockReq.params = { courseId: 'course-1', sectionId: '1' };

        await getSectionById(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith(
          expect.objectContaining({ error: expect.any(Array) })
        );
      });

      it('should return 400 if courseId param is missing', async () => {
        // Mock ModuleService.findModuleById
        (ModuleService.findModuleById as jest.Mock).mockResolvedValue({ id: 'module1', courseId: 'course-1' });
        mockReq.params = { sectionId: '1', moduleId: 'module1' };

        await getSectionById(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith(
          expect.objectContaining({ error: expect.any(Array) })
        );
      });
    });

describe('createSectionController', () => {
      it('should create a section and return 201', async () => {
        (createSectionMock as jest.Mock).mockResolvedValue(sectionStub);
        // Mock ModuleService.findModuleById
        (ModuleService.findModuleById as jest.Mock).mockResolvedValue({ id: 'module1', courseId: 'course-1' });
        mockReq.params = { courseId: 'course-1', moduleId: 'module1' };
        mockReq.body = {
          title: 'Introduction to Steps',
          description: 'A beginner section',
          orderIndex: 0,
        };

        await createSectionController(mockReq, mockRes);

        expect(createSectionMock).toHaveBeenCalledWith({
          moduleId: 'module1',
          title: 'Introduction to Steps',
          description: 'A beginner section',
          orderIndex: 0,
          videoUrl: undefined,
          markdownContent: undefined,
        });
        expect(mockRes.status).toHaveBeenCalledWith(201);
        expect(mockRes.json).toHaveBeenCalledWith(sectionStub);
      });

      it('should return 400 if body validation fails', async () => {
        // Mock ModuleService.findModuleById
        (ModuleService.findModuleById as jest.Mock).mockResolvedValue({ id: 'module1', courseId: 'course-1' });
        mockReq.params = { courseId: 'course-1', moduleId: 'module1' };
        mockReq.body = { title: '' };

        await createSectionController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith(
          expect.objectContaining({ error: expect.any(Array) })
        );
      });

      it('should return 400 if moduleId param is missing', async () => {
        // Mock ModuleService.findModuleById
        (ModuleService.findModuleById as jest.Mock).mockResolvedValue({ id: 'module1', courseId: 'course-1' });
        mockReq.params = { courseId: 'course-1' };

        await createSectionController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith(
          expect.objectContaining({ error: expect.any(Array) })
        );
      });

      it('should return 400 if courseId param is missing', async () => {
        // Mock ModuleService.findModuleById
        (ModuleService.findModuleById as jest.Mock).mockResolvedValue({ id: 'module1', courseId: 'course-1' });
        mockReq.params = { moduleId: 'module1' };

        await createSectionController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith(
          expect.objectContaining({ error: expect.any(Array) })
        );
      });
    });

describe('updateSectionController', () => {
      it('should update a section and return 200', async () => {
        const updated = { ...sectionStub, title: 'Updated Section' };
        (updateSectionMock as jest.Mock).mockResolvedValue(updated);
        // Mock ModuleService.findModuleById
        (ModuleService.findModuleById as jest.Mock).mockResolvedValue({ id: 'module1', courseId: 'course-1' });
        mockReq.params = { courseId: 'course-1', sectionId: '1', moduleId: 'module1' };
        mockReq.body = { title: 'Updated Section' };

        await updateSectionController(mockReq, mockRes);

        expect(updateSectionMock).toHaveBeenCalledWith('1', { title: 'Updated Section' }, 'module1');
        expect(mockRes.json).toHaveBeenCalledWith(updated);
      });

      it('should return 404 when section is not found', async () => {
        (updateSectionMock as jest.Mock).mockRejectedValue({ code: 'P2025' });
        // Mock ModuleService.findModuleById
        (ModuleService.findModuleById as jest.Mock).mockResolvedValue({ id: 'module1', courseId: 'course-1' });
        mockReq.params = { courseId: 'course-1', sectionId: '1', moduleId: 'module1' };
        mockReq.body = { title: 'Updated' };

        await updateSectionController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Section not found' });
      });

      it('should return 400 if body validation fails', async () => {
        // Mock ModuleService.findModuleById
        (ModuleService.findModuleById as jest.Mock).mockResolvedValue({ id: 'module1', courseId: 'course-1' });
        mockReq.params = { courseId: 'course-1', sectionId: '1', moduleId: 'module1' };
        mockReq.body = { title: '' };

        await updateSectionController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith(
          expect.objectContaining({ error: expect.any(Array) })
        );
      });

      it('should return 400 if id param is missing', async () => {
        // Mock ModuleService.findModuleById
        (ModuleService.findModuleById as jest.Mock).mockResolvedValue({ id: 'module1', courseId: 'course-1' });
        mockReq.params = { courseId: 'course-1', moduleId: 'module1' };

        await updateSectionController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith(
          expect.objectContaining({ error: expect.any(Array) })
        );
      });

      it('should return 400 if moduleId param is missing', async () => {
        // Mock ModuleService.findModuleById
        (ModuleService.findModuleById as jest.Mock).mockResolvedValue({ id: 'module1', courseId: 'course-1' });
        mockReq.params = { courseId: 'course-1', sectionId: '1' };

        await updateSectionController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith(
          expect.objectContaining({ error: expect.any(Array) })
        );
      });

      it('should return 400 if courseId param is missing', async () => {
        // Mock ModuleService.findModuleById
        (ModuleService.findModuleById as jest.Mock).mockResolvedValue({ id: 'module1', courseId: 'course-1' });
        mockReq.params = { sectionId: '1', moduleId: 'module1' };

        await updateSectionController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith(
          expect.objectContaining({ error: expect.any(Array) })
        );
      });
    });

describe('deleteSectionController', () => {
      it('should delete a section and return 204', async () => {
        (deleteSectionMock as jest.Mock).mockResolvedValue(sectionStub);
        mockReq.params = { courseId: 'course-1', sectionId: '1', moduleId: 'module1' };

        await deleteSectionController(mockReq, mockRes);

        expect(deleteSectionMock).toHaveBeenCalledWith('1', 'module1');
        expect(mockRes.status).toHaveBeenCalledWith(204);
        expect(mockRes.send).toHaveBeenCalled();
      });

      it('should return 404 when section is not found', async () => {
        (deleteSectionMock as jest.Mock).mockRejectedValue({ code: 'P2025' });
        mockReq.params = { courseId: 'course-1', sectionId: '1', moduleId: 'module1' };

        await deleteSectionController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Section not found' });
      });

      it('should return 400 if id param is missing', async () => {
        mockReq.params = { courseId: 'course-1', moduleId: 'module1' };

        await deleteSectionController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith(
          expect.objectContaining({ error: expect.any(Array) })
        );
      });

      it('should return 400 if moduleId param is missing', async () => {
        mockReq.params = { courseId: 'course-1', sectionId: '1' };

        await deleteSectionController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith(
          expect.objectContaining({ error: expect.any(Array) })
        );
      });

      it('should return 400 if courseId param is missing', async () => {
        mockReq.params = { sectionId: '1', moduleId: 'module1' };

        await deleteSectionController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith(
          expect.objectContaining({ error: expect.any(Array) })
        );
      });
    });
});