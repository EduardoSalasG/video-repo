import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getVideoMetadata,
  getVideoMetadataById,
  getVideoMetadataBySectionId,
  createVideoMetadataController,
  updateVideoMetadataController,
  deleteVideoMetadataController,
  uploadVideoController,
} from '../../src/controllers/videoController';
import {
  findAllVideoMetadata,
  findVideoMetadataById,
  findVideoMetadataBySectionId,
  createVideoMetadata,
  updateVideoMetadataBySectionId,
  deleteVideoMetadataBySectionId,
} from '../../src/models/videoMetadata';

// Mock the videoMetadata model
vi.mock('../../src/models/videoMetadata', () => {
  return {
    findAllVideoMetadata: vi.fn(),
    findVideoMetadataById: vi.fn(),
    findVideoMetadataBySectionId: vi.fn(),
    createVideoMetadata: vi.fn(),
    updateVideoMetadataBySectionId: vi.fn(),
    deleteVideoMetadataBySectionId: vi.fn(),
  };
});

// Mock video processor and storage utilities
vi.mock('../../src/utils/videoProcessor', () => ({
  extractVideoMetadata: vi.fn(),
}));

vi.mock('../../src/utils/storage', () => ({
  getVideoFilePath: vi.fn(),
}));

import {
  findAllVideoMetadata as findAllVideoMetadataMock,
  findVideoMetadataById as findVideoMetadataByIdMock,
  findVideoMetadataBySectionId as findVideoMetadataBySectionIdMock,
  createVideoMetadata as createVideoMetadataMock,
  updateVideoMetadataBySectionId as updateVideoMetadataBySectionIdMock,
  deleteVideoMetadataBySectionId as deleteVideoMetadataBySectionIdMock,
} from '../../src/models/videoMetadata';
import { extractVideoMetadata } from '../../src/utils/videoProcessor';
import { getVideoFilePath } from '../../src/utils/storage';

describe('videoController', () => {
  let mockReq: any;
  let mockRes: any;

  const videoMetadataStub = {
    id: 'vm1',
    sectionId: 's1',
    steps: [{ step: 'basic step', count: 4 }],
    difficulty: 'BEGINNER',
    primaryStyle: 'MAMBO_ON2',
    influences: ['afro-cuban'],
    durationCounts: 8,
    videoType: 'STEP_BREAKDOWN',
    tags: ['beginner', 'steps'],
    fileSize: 1024000,
    durationSeconds: 120,
    filename: 'video1.mp4',
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

  describe('getVideoMetadata', () => {
    it('should return a paginated list of video metadata', async () => {
      (findAllVideoMetadataMock as jest.Mock).mockResolvedValue({
        videoMetadata: [videoMetadataStub],
        pagination: { page: 1, limit: 10, total: 1, pages: 1 },
      });
      mockReq.query = { page: '1', limit: '10' };

      await getVideoMetadata(mockReq, mockRes);

      expect(findAllVideoMetadataMock).toHaveBeenCalledWith({ page: 1, limit: 10 });
      expect(mockRes.json).toHaveBeenCalledWith({
        videoMetadata: [videoMetadataStub],
        pagination: { page: 1, limit: 10, total: 1, pages: 1 },
      });
    });

    it('should return 400 if query validation fails', async () => {
      mockReq.query = { page: '-1' };

      await getVideoMetadata(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(Array) })
      );
    });
  });

  describe('getVideoMetadataById', () => {
    it('should return video metadata when found', async () => {
      (findVideoMetadataByIdMock as jest.Mock).mockResolvedValue(videoMetadataStub);
      mockReq.params = { id: 'vm1' };

      await getVideoMetadataById(mockReq, mockRes);

      expect(findVideoMetadataByIdMock).toHaveBeenCalledWith('vm1');
      expect(mockRes.json).toHaveBeenCalledWith(videoMetadataStub);
    });

    it('should return 404 when video metadata is not found', async () => {
      (findVideoMetadataByIdMock as jest.Mock).mockResolvedValue(null);
      mockReq.params = { id: 'vm1' };

      await getVideoMetadataById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Video metadata not found' });
    });

    it('should return 400 if id param is missing', async () => {
      mockReq.params = {};

      await getVideoMetadataById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(Array) })
      );
    });
  });

  describe('getVideoMetadataBySectionId', () => {
    it('should return video metadata when found', async () => {
      (findVideoMetadataBySectionIdMock as jest.Mock).mockResolvedValue(videoMetadataStub);
      mockReq.params = { sectionId: 's1' };

      await getVideoMetadataBySectionId(mockReq, mockRes);

      expect(findVideoMetadataBySectionIdMock).toHaveBeenCalledWith('s1');
      expect(mockRes.json).toHaveBeenCalledWith(videoMetadataStub);
    });

    it('should return 404 when video metadata is not found for section', async () => {
      (findVideoMetadataBySectionIdMock as jest.Mock).mockResolvedValue(null);
      mockReq.params = { sectionId: 's1' };

      await getVideoMetadataBySectionId(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Video metadata not found for this section' });
    });

    it('should return 400 if id param is missing', async () => {
      mockReq.params = {};

      await getVideoMetadataBySectionId(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(Array) })
      );
    });
  });

  describe('createVideoMetadataController', () => {
    it('should create video metadata and return 201', async () => {
      (createVideoMetadataMock as jest.Mock).mockResolvedValue(videoMetadataStub);
      mockReq.params = { sectionId: 's1' };
      mockReq.body = {
        steps: [{ step: 'basic step', count: 4 }],
        difficulty: 'BEGINNER',
        primaryStyle: 'MAMBO_ON2',
        influences: ['afro-cuban'],
        durationCounts: 8,
        videoType: 'STEP_BREAKDOWN',
        tags: ['beginner', 'steps'],
        fileSize: 1024000,
        durationSeconds: 120,
        filename: 'video1.mp4',
      };

      await createVideoMetadataController(mockReq, mockRes);

      expect(createVideoMetadataMock).toHaveBeenCalledWith({
        sectionId: 's1',
        steps: [{ step: 'basic step', count: 4 }],
        difficulty: 'BEGINNER',
        primaryStyle: 'MAMBO_ON2',
        influences: ['afro-cuban'],
        durationCounts: 8,
        videoType: 'STEP_BREAKDOWN',
        tags: ['beginner', 'steps'],
        fileSize: 1024000,
        durationSeconds: 120,
        filename: 'video1.mp4',
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(videoMetadataStub);
    });

    it('should return 400 if body validation fails', async () => {
      mockReq.params = {};
      mockReq.body = { sectionId: '' }; // Invalid: empty sectionId

      await createVideoMetadataController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(Array) })
      );
    });
  });

  describe('updateVideoMetadataController', () => {
    it('should update video metadata and return 200', async () => {
      const updated = { ...videoMetadataStub, steps: [{ step: 'updated', count: 6 }] };
      (updateVideoMetadataBySectionIdMock as jest.Mock).mockResolvedValue(updated);
      mockReq.params = { sectionId: 's1' };
      mockReq.body = { steps: [{ step: 'updated', count: 6 }] };

      await updateVideoMetadataController(mockReq, mockRes);

      expect(updateVideoMetadataBySectionIdMock).toHaveBeenCalledWith('s1', { steps: [{ step: 'updated', count: 6 }] });
      expect(mockRes.json).toHaveBeenCalledWith(updated);
    });

    it('should return 404 when video metadata is not found', async () => {
      (updateVideoMetadataBySectionIdMock as jest.Mock).mockRejectedValue({ code: 'P2025' });
      mockReq.params = { sectionId: 's1' };
      mockReq.body = { steps: [{ step: 'updated', count: 6 }] };

      await updateVideoMetadataController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Video metadata not found' });
    });

    it('should return 400 if body validation fails', async () => {
      mockReq.params = { sectionId: 's1' };
      mockReq.body = { difficulty: 'EXPERT' }; // Invalid difficulty

      await updateVideoMetadataController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(Array) })
      );
    });

    it('should return 400 if sectionId param is missing', async () => {
      mockReq.params = {};
      mockReq.body = { steps: [{ step: 'updated', count: 6 }] };

      await updateVideoMetadataController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(Array) })
      );
    });
  });

  describe('deleteVideoMetadataController', () => {
    it('should delete video metadata and return 204', async () => {
      (deleteVideoMetadataBySectionIdMock as jest.Mock).mockResolvedValue(videoMetadataStub);
      mockReq.params = { sectionId: 's1' };

      await deleteVideoMetadataController(mockReq, mockRes);

      expect(deleteVideoMetadataBySectionIdMock).toHaveBeenCalledWith('s1');
      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.send).toHaveBeenCalled();
    });

    it('should return 404 when video metadata is not found', async () => {
      (deleteVideoMetadataBySectionIdMock as jest.Mock).mockRejectedValue({ code: 'P2025' });
      mockReq.params = { sectionId: 's1' };

      await deleteVideoMetadataController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Video metadata not found' });
    });

    it('should return 400 if sectionId param is missing', async () => {
      mockReq.params = {};

      await deleteVideoMetadataController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(Array) })
      );
    });
  });

  describe('uploadVideoController', () => {
    const videoMetadataStub = {
      id: 'vm1',
      sectionId: 's1',
      steps: [{ step: 'basic step', count: 4 }],
      difficulty: 'BEGINNER',
      primaryStyle: 'MAMBO_ON2',
      influences: ['afro-cuban'],
      durationCounts: 8,
      videoType: 'STEP_BREAKDOWN',
      tags: ['beginner', 'steps'],
      fileSize: 1024000,
      durationSeconds: 120,
      filename: 'video1.mp4',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    beforeEach(() => {
      mockReq = { body: {}, params: {}, query: {}, file: null };
      mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
      };
      vi.clearAllMocks();
    });

    it('should upload video and return 201', async () => {
      (extractVideoMetadata as jest.Mock).mockResolvedValue({
        duration: 120,
        size: 1024000,
        format: 'mp4',
        bitrate: 1000
      });
      (getVideoFilePath as jest.Mock).mockImplementation((filename) => 
        `/uploads/videos/${filename}`);
      
      (createVideoMetadataMock as jest.Mock).mockResolvedValue(videoMetadataStub);
      
      // Mock the uploaded file
      mockReq.params = { sectionId: 's1' };
      mockReq.file = {
        filename: 'video1.mp4',
        originalname: 'myvideo.mp4',
        mimetype: 'video/mp4',
        size: 1024000,
        destination: '/uploads/videos',
        path: '/uploads/videos/video1.mp4',
        buffer: Buffer.from([])
      } as Express.Multer.File;

      await uploadVideoController(mockReq, mockRes);

      // Verify extractVideoMetadata was called with correct path
      expect(createVideoMetadataMock).toHaveBeenCalledWith({
        sectionId: 's1',
        steps: [],
        difficulty: 'BEGINNER',
        primaryStyle: 'MAMBO_ON2',
        influences: [],
        durationCounts: 0,
        videoType: 'STEP_BREAKDOWN',
        tags: [],
        fileSize: 1024000,
        durationSeconds: 120,
        filename: 'video1.mp4'
      });
      
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Video uploaded successfully',
          videoMetadata: videoMetadataStub
        })
      );
    });

    it('should return 400 if no file is uploaded', async () => {
      mockReq.params = { sectionId: 's1' };
      mockReq.file = null; // No file uploaded

      await uploadVideoController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'No video file uploaded' });
    });

    it('should return 400 if sectionId param is missing', async () => {
      mockReq.params = {}; // Missing sectionId
      mockReq.file = {
        filename: 'video1.mp4',
        originalname: 'myvideo.mp4',
        mimetype: 'video/mp4',
        size: 1024000,
        destination: '/uploads/videos',
        path: '/uploads/videos/video1.mp4',
        buffer: Buffer.from([])
      } as Express.Multer.File;

      await uploadVideoController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(Array) })
      );
    });

    it('should return 500 if video metadata extraction fails', async () => {
      (extractVideoMetadata as jest.Mock).mockRejectedValue(new Error('FFmpeg error'));
      (getVideoFilePath as jest.Mock).mockImplementation((filename) => 
        `/uploads/videos/${filename}`);
      
      mockReq.params = { sectionId: 's1' };
      mockReq.file = {
        filename: 'video1.mp4',
        originalname: 'myvideo.mp4',
        mimetype: 'video/mp4',
        size: 1024000,
        destination: '/uploads/videos',
        path: '/uploads/videos/video1.mp4',
        buffer: Buffer.from([])
      } as Express.Multer.File;

      await uploadVideoController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });
});
