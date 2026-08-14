import { describe, it, expect } from 'vitest';
import {
  createModuleSchema,
  updateModuleSchema,
  moduleQuerySchema,
  moduleIdSchema,
} from '../../src/validators/moduleValidators';

describe('moduleValidators', () => {
  describe('createModuleSchema', () => {
    it('should accept a valid module payload', () => {
      const result = createModuleSchema.parse({
        title: 'Introduction to Salsa',
        description: 'A beginner module',
        orderIndex: 2,
      });
      expect(result.title).toBe('Introduction to Salsa');
      expect(result.orderIndex).toBe(2);
    });

    it('should accept a payload without optional fields', () => {
      const result = createModuleSchema.parse({ title: 'Salsa Basics' });
      expect(result.description).toBeUndefined();
      expect(result.orderIndex).toBeUndefined();
    });

    it('should reject a payload without a title', () => {
      expect(() => createModuleSchema.parse({})).toThrow();
    });

    it('should reject a negative orderIndex', () => {
      expect(() =>
        createModuleSchema.parse({ title: 'Salsa', orderIndex: -1 })
      ).toThrow();
    });
  });

  describe('updateModuleSchema', () => {
    it('should accept partial updates', () => {
      const result = updateModuleSchema.parse({ title: 'Updated Title' });
      expect(result.title).toBe('Updated Title');
      expect(result.description).toBeUndefined();
    });

    it('should accept a null description to clear it', () => {
      const result = updateModuleSchema.parse({ description: null });
      expect(result.description).toBeNull();
    });

    it('should accept an empty object', () => {
      const result = updateModuleSchema.parse({});
      expect(result).toEqual({});
    });

    it('should reject a non-integer orderIndex', () => {
      expect(() =>
        updateModuleSchema.parse({ orderIndex: 1.5 })
      ).toThrow();
    });
  });

  describe('moduleQuerySchema', () => {
    it('should coerce string numbers and apply defaults', () => {
      const result = moduleQuerySchema.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.search).toBeUndefined();
    });

    it('should parse provided query params', () => {
      const result = moduleQuerySchema.parse({
        page: '3',
        limit: '25',
        search: 'bachata',
      });
      expect(result.page).toBe(3);
      expect(result.limit).toBe(25);
      expect(result.search).toBe('bachata');
    });

    it('should reject negative page numbers', () => {
      expect(() => moduleQuerySchema.parse({ page: '-1' })).toThrow();
    });

    it('should reject limits over 100', () => {
      expect(() => moduleQuerySchema.parse({ limit: '200' })).toThrow();
    });
  });

  describe('moduleIdSchema', () => {
    it('should accept a valid id', () => {
      const result = moduleIdSchema.parse({ id: 'abc-123' });
      expect(result.id).toBe('abc-123');
    });

    it('should reject an empty id', () => {
      expect(() => moduleIdSchema.parse({ id: '' })).toThrow();
    });
  });
});