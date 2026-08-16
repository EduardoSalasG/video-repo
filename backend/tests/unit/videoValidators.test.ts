import { describe, it, expect } from 'vitest';
import {
  createVideoMetadataSchema,
  updateVideoMetadataSchema,
  videoMetadataQuerySchema,
  videoMetadataIdSchema,
} from '../../src/validators/videoValidators';

describe('video metadata validators', () => {
  describe('createVideoMetadataSchema', () => {
    it('should validate valid create video metadata data', () => {
      const validData = {
        sectionId: 's1',
        steps: [{ step: 'basic', count: 4 }],
        difficulty: 'BEGINNER',
        primaryStyle: 'MAMBO_ON2',
        influences: ['afro-cuban'],
        durationCounts: 8,
        videoType: 'STEP_BREAKDOWN',
        tags: ['beginner'],
        fileSize: 1024,
        durationSeconds: 120,
        filename: 'video.mp4',
      };

      const result = createVideoMetadataSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should require sectionId', () => {
      const invalidData = {
        steps: [{ step: 'basic', count: 4 }],
        difficulty: 'BEGINNER',
        primaryStyle: 'MAMBO_ON2',
        influences: ['afro-cuban'],
        durationCounts: 8,
        videoType: 'STEP_BREAKDOWN',
        tags: ['beginner'],
      };

      expect(() => createVideoMetadataSchema.parse(invalidData)).toThrow();
    });

    it('should require at least one step', () => {
      const invalidData = {
        sectionId: 's1',
        steps: [],
        difficulty: 'BEGINNER',
        primaryStyle: 'MAMBO_ON2',
        influences: ['afro-cuban'],
        durationCounts: 8,
        videoType: 'STEP_BREAKDOWN',
        tags: ['beginner'],
      };

      expect(() => createVideoMetadataSchema.parse(invalidData)).toThrow();
    });

    it('should validate difficulty enum', () => {
      const invalidData = {
        sectionId: 's1',
        steps: [{ step: 'basic', count: 4 }],
        difficulty: 'EXPERT', // Invalid
        primaryStyle: 'MAMBO_ON2',
        influences: ['afro-cuban'],
        durationCounts: 8,
        videoType: 'STEP_BREAKDOWN',
        tags: ['beginner'],
      };

      expect(() => createVideoMetadataSchema.parse(invalidData)).toThrow();
    });

    it('should validate primaryStyle enum', () => {
      const invalidData = {
        sectionId: 's1',
        steps: [{ step: 'basic', count: 4 }],
        difficulty: 'BEGINNER',
        primaryStyle: 'HIP_HOP', // Invalid
        influences: ['afro-cuban'],
        durationCounts: 8,
        videoType: 'STEP_BREAKDOWN',
        tags: ['beginner'],
      };

      expect(() => createVideoMetadataSchema.parse(invalidData)).toThrow();
    });

    it('should validate videoType enum', () => {
      const invalidData = {
        sectionId: 's1',
        steps: [{ step: 'basic', count: 4 }],
        difficulty: 'BEGINNER',
        primaryStyle: 'MAMBO_ON2',
        influences: ['afro-cuban'],
        durationCounts: 8,
        videoType: 'TUTORIAL', // Invalid
        tags: ['beginner'],
      };

      expect(() => createVideoMetadataSchema.parse(invalidData)).toThrow();
    });

    it('should allow optional fields to be omitted', () => {
      const validData = {
        sectionId: 's1',
        steps: [{ step: 'basic', count: 4 }],
        difficulty: 'BEGINNER',
        primaryStyle: 'MAMBO_ON2',
        influences: ['afro-cuban'],
        durationCounts: 8,
        videoType: 'STEP_BREAKDOWN',
        tags: ['beginner'],
        // fileSize, durationSeconds, filename are omitted
      };

      const result = createVideoMetadataSchema.parse(validData);
      expect(result.fileSize).toBeUndefined();
      expect(result.durationSeconds).toBeUndefined();
      expect(result.filename).toBeUndefined();
    });
  });

  describe('updateVideoMetadataSchema', () => {
    it('should validate valid update video metadata data', () => {
      const validData = {
        steps: [{ step: 'advanced', count: 8 }],
        difficulty: 'INTERMEDIATE',
        primaryStyle: 'CASINO',
        influences: ['street'],
        durationCounts: 16,
        videoType: 'COMBINATION',
        tags: ['advanced'],
        fileSize: 2048,
        durationSeconds: 300,
        filename: 'video2.mp4',
      };

      const result = updateVideoMetadataSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should allow all fields to be optional', () => {
      const validData = {}; // Empty object should be valid
      const result = updateVideoMetadataSchema.parse(validData);
      expect(result).toEqual({});
    });

    it('should validate difficulty enum when provided', () => {
      const invalidData = {
        difficulty: 'EXPERT', // Invalid
      };

      expect(() => updateVideoMetadataSchema.parse(invalidData)).toThrow();
    });

    it('should allow nullable fields to be set to null', () => {
      const validData = {
        fileSize: null,
        durationSeconds: null,
        filename: null,
      };

      const result = updateVideoMetadataSchema.parse(validData);
      expect(result.fileSize).toBeNull();
      expect(result.durationSeconds).toBeNull();
      expect(result.filename).toBeNull();
    });
  });

  describe('videoMetadataQuerySchema', () => {
    it('should validate query parameters with defaults', () => {
      const result = videoMetadataQuerySchema.parse({});
      expect(result).toEqual({ page: 1, limit: 10, search: undefined });
    });

    it('should parse string numbers to numbers', () => {
      const result = videoMetadataQuerySchema.parse({
        page: '2',
        limit: '20',
        search: 'test',
      });
      expect(result).toEqual({ page: 2, limit: 20, search: 'test' });
    });

    it('should enforce limit max of 100', () => {
      expect(() => videoMetadataQuerySchema.parse({ limit: '101' })).toThrow();
    });

    it('should enforce positive page and limit', () => {
      expect(() => videoMetadataQuerySchema.parse({ page: '0' })).toThrow();
      expect(() => videoMetadataQuerySchema.parse({ limit: '0' })).toThrow();
    });
  });

  describe('videoMetadataIdSchema', () => {
    it('should validate valid id', () => {
      const validData = { id: 'valid-id-123' };
      const result = videoMetadataIdSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should require id', () => {
      expect(() => videoMetadataIdSchema.parse({})).toThrow();
    });

    it('should reject empty id', () => {
      expect(() => videoMetadataIdSchema.parse({ id: '' })).toThrow();
    });
  });
});