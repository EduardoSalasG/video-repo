import { describe, it, expect } from 'vitest';
import {
  progressSectionIdSchema,
  updateProgressSchema,
  markProgressCompleteSchema,
  progressQuerySchema,
} from '../../src/validators/progressValidators';

describe('progressValidators', () => {
  describe('progressSectionIdSchema', () => {
    it('should accept a valid sectionId', () => {
      const result = progressSectionIdSchema.parse({ sectionId: 'abc-123' });
      expect(result.sectionId).toBe('abc-123');
    });

    it('should reject an empty sectionId', () => {
      expect(() => progressSectionIdSchema.parse({ sectionId: '' })).toThrow();
    });

    it('should reject a missing sectionId', () => {
      expect(() => progressSectionIdSchema.parse({})).toThrow();
    });
  });

  describe('updateProgressSchema', () => {
    it('should accept a valid payload', () => {
      const result = updateProgressSchema.parse({
        completedAt: '2024-01-01T00:00:00.000Z',
        lastPositionSeconds: 42,
      });
      expect(result.completedAt).toBeInstanceOf(Date);
      expect(result.lastPositionSeconds).toBe(42);
    });

    it('should accept an empty object', () => {
      const result = updateProgressSchema.parse({});
      expect(result.completedAt).toBeUndefined();
      expect(result.lastPositionSeconds).toBeUndefined();
    });

    it('should accept null values to clear fields', () => {
      const result = updateProgressSchema.parse({
        completedAt: null,
        lastPositionSeconds: null,
      });
      expect(result.completedAt).toBeNull();
      expect(result.lastPositionSeconds).toBeNull();
    });

    it('should reject a negative lastPositionSeconds', () => {
      expect(() =>
        updateProgressSchema.parse({ lastPositionSeconds: -1 })
      ).toThrow();
    });

    it('should reject a non-integer lastPositionSeconds', () => {
      expect(() =>
        updateProgressSchema.parse({ lastPositionSeconds: 1.5 })
      ).toThrow();
    });
  });

  describe('markProgressCompleteSchema', () => {
    it('should accept an empty body', () => {
      const result = markProgressCompleteSchema.parse({});
      expect(result.completedAt).toBeUndefined();
    });

    it('should accept a provided completedAt date', () => {
      const result = markProgressCompleteSchema.parse({
        completedAt: '2024-01-01T00:00:00.000Z',
      });
      expect(result.completedAt).toBeInstanceOf(Date);
    });

    it('should reject an invalid date', () => {
      expect(() => markProgressCompleteSchema.parse({ completedAt: 'not-a-date' })).toThrow();
    });
  });

  describe('progressQuerySchema', () => {
    it('should apply defaults', () => {
      const result = progressQuerySchema.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should coerce string numbers', () => {
      const result = progressQuerySchema.parse({ page: '2', limit: '25' });
      expect(result.page).toBe(2);
      expect(result.limit).toBe(25);
    });

    it('should reject negative page numbers', () => {
      expect(() => progressQuerySchema.parse({ page: '-1' })).toThrow();
    });

    it('should reject limits over 100', () => {
      expect(() => progressQuerySchema.parse({ limit: '200' })).toThrow();
    });
  });
});