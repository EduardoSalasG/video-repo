import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getContent,
  updateContent,
} from '../../../src/controllers/contentController';
import {
  findSectionById,
  updateSection,
} from '../../../src/models/section';

// Mock the section model
vi.mock('../../src/models/section', () => {
  return {
    findSectionById: vi.fn(),
    updateSection: vi.fn(),
  };
});

import {
  findSectionById as findSectionByIdMock,
  updateSection as updateSectionMock,
} from '../../../src/models/section';

describe('contentController', () => {
  let mockReq: any;
  let mockRes: any;

  const sectionStub = {
    id: '1',
    moduleId: 'module1',
    title: 'Introduction to Steps',
    description: 'A beginner section',
    orderIndex: 0,
    videoUrl: null,
    markdownContent: '# Initial content\\nThis is the initial markdown content.',
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

  describe('getContent', () => {
    it('should return markdown content for a section', async () => {
      (findSectionByIdMock as jest.Mock).mockResolvedValue(sectionStub);
      mockReq.params = { moduleId: 'module1', sectionId: '1' };

      await getContent(mockReq, mockRes);

      expect(findSectionByIdMock).toHaveBeenCalledWith('1', 'module1');
      expect(mockRes.json).toHaveBeenCalledWith({
        markdownContent: sectionStub.markdownContent,
      });
    });

    it('should return 404 when section is not found', async () => {
      (findSectionByIdMock as jest.Mock).mockResolvedValue(null);
      mockReq.params = { moduleId: 'module1', sectionId: '1' };

      await getContent(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Section not found' });
    });

    it('should return 400 if moduleId param is missing', async () => {
      mockReq.params = { sectionId: '1' };

      await getContent(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(Array) })
      );
    });

    it('should return 400 if sectionId param is missing', async () => {
      mockReq.params = { moduleId: 'module1' };

      await getContent(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(Array) })
      );
    });
  });

  describe('updateContent', () => {
    it('should update markdown content and return 200', async () => {
      const updatedSection = { ...sectionStub, markdownContent: '# Updated content' };
      (updateSectionMock as jest.Mock).mockResolvedValue(updatedSection);
      mockReq.params = { moduleId: 'module1', sectionId: '1' };
      mockReq.body = { markdownContent: '# Updated content' };

      await updateContent(mockReq, mockRes);

      expect(updateSectionMock).toHaveBeenCalledWith('1', { markdownContent: '# Updated content' }, 'module1');
      expect(mockRes.json).toHaveBeenCalledWith({ markdownContent: updatedSection.markdownContent });
    });

    it('should return 404 when section is not found', async () => {
      (updateSectionMock as jest.Mock).mockRejectedValue({ code: 'P2025' });
      mockReq.params = { moduleId: 'module1', sectionId: '1' };
      mockReq.body = { markdownContent: '# Updated' };

      await updateContent(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Section not found' });
    });

    it('should return 400 if body validation fails', async () => {
      mockReq.params = { moduleId: 'module1', sectionId: '1' };
      mockReq.body = { markdownContent: 123 }; // invalid type

      await updateContent(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(Array) })
      );
    });

    it('should return 400 if moduleId param is missing', async () => {
      mockReq.params = { sectionId: '1' };
      mockReq.body = { markdownContent: '# Updated' };

      await updateContent(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(Array) })
      );
    });

    it('should return 400 if sectionId param is missing', async () => {
      mockReq.params = { moduleId: 'module1' };
      mockReq.body = { markdownContent: '# Updated' };

      await updateContent(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(Array) })
      );
    });
  });
});