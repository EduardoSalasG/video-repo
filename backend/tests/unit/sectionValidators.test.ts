import { describe, it, expect } from 'vitest';
import {
  createSectionSchema,
  updateSectionSchema,
  sectionQuerySchema,
  sectionIdSchema,
} from '../../src/validators/sectionValidators';

describe('sectionValidators', () => {
  describe('createSectionSchema', () => {
    it('should accept a valid section payload', () => {
      const result = createSectionSchema.parse({
        moduleId: 'module1',
        title: 'Introduction to Steps',
        description: 'A beginner section',
        orderIndex: 2,
        videoUrl: 'https://example.com/video.mp4',
        markdownContent: '# Steps',
      });
      expect(result.moduleId).toBe('module1');
      expect(result.title).toBe('Introduction to Steps');
      expect(result.orderIndex).toBe(2);
      expect(result.videoUrl).toBe('https://example.com/video.mp4');
      expect(result.markdownContent).toBe('# Steps');
    });

    it('should accept a payload without optional fields', () => {
      const result = createSectionSchema.parse({
        moduleId: 'module1',
        title: 'Salsa Basics',
      });
      expect(result.description).toBeUndefined();
      expect(result.orderIndex).toBeUndefined();
      expect(result.videoUrl).toBeUndefined();
      expect(result.markdownContent).toBeUndefined();
    });

    it('should reject a payload without a title', () => {
      expect(() => createSectionSchema.parse({ moduleId: 'module1' })).toThrow();
    });

    it('should reject a negative orderIndex', () => {
      expect(() =>
        createSectionSchema.parse({ moduleId: 'module1', title: 'Salsa', orderIndex: -1 })
      ).toThrow();
    });

    it('should require moduleId', () => {
      expect(() => createSectionSchema.parse({ title: 'Salsa' })).toThrow();
    });
  });

  describe('updateSectionSchema', () => {
    it('should accept partial updates', () => {
      const result = updateSectionSchema.parse({ title: 'Updated Title' });
      expect(result.title).toBe('Updated Title');
      expect(result.description).toBeUndefined();
      expect(result.orderIndex).toBeUndefined();
      expect(result.videoUrl).toBeUndefined();
      expect(result.markdownContent).toBeUndefined();
    });

    it('should accept a null description to clear it', () => {
      const result = updateSectionSchema.parse({ description: null });
      expect(result.description).toBeNull();
    });

    it('should accept a null videoUrl to clear it', () => {
      const result = updateSectionSchema.parse({ videoUrl: null });
      expect(result.videoUrl).toBeNull();
    });

    it('should accept a null markdownContent to clear it', () => {
      const result = updateSectionSchema.parse({ markdownContent: null });
      expect(result.markdownContent).toBeNull();
    });

    it('should accept an empty object', () => {
      const result = updateSectionSchema.parse({});
      expect(result).toEqual({});
    });

    it('should reject a non-integer orderIndex', () => {
      expect(() =>
        updateSectionSchema.parse({ orderIndex: 1.5 })
      ).toThrow();
    });
  });

  describe('sectionQuerySchema', () => {
    it('should coerce string numbers and apply defaults', () => {
      const result = sectionQuerySchema.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.search).toBeUndefined();
    });

    it('should parse provided query params', () => {
      const result = sectionQuerySchema.parse({
        page: '3',
        limit: '25',
        search: 'bachata',
      });
      expect(result.page).toBe(3);
      expect(result.limit).toBe(25);
      expect(result.search).toBe('bachata');
    });

    it('should reject negative page numbers', () => {
      expect(() => sectionQuerySchema.parse({ page: '-1' })).toThrow();
    });

    it('should reject limits over 100', () => {
      expect(() => sectionQuerySchema.parse({ limit: '200' })).toThrow();
    });
  });

  describe('sectionIdSchema', () => {
    it('should accept a valid id', () => {
      const result = sectionIdSchema.parse({ id: 'abc-123' });
      expect(result.id).toBe('abc-123');
    });

    it('should reject an empty id', () => {
      expect(() => sectionIdSchema.parse({ id: '' })).toThrow();
    });
  });
});