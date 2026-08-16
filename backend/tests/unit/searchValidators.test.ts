import { describe, it, expect } from 'vitest'
import { searchQuerySchema } from '../../src/validators/searchValidators'

describe('search query validators', () => {
  describe('searchQuerySchema', () => {
    it('should apply defaults when no query params provided', () => {
      const result = searchQuerySchema.parse({})
      expect(result).toEqual({ page: 1, limit: 10 })
    })

    it('should parse string numbers and accept all filters', () => {
      const result = searchQuerySchema.parse({
        search: 'turns',
        primaryStyle: 'MAMBO_ON2',
        difficulty: 'INTERMEDIATE',
        videoType: 'SHINES_SEQUENCE',
        page: '2',
        limit: '20',
      })
      expect(result).toEqual({
        search: 'turns',
        primaryStyle: 'MAMBO_ON2',
        difficulty: 'INTERMEDIATE',
        videoType: 'SHINES_SEQUENCE',
        page: 2,
        limit: 20,
      })
    })

    it('should accept every valid enum value', () => {
      const result = searchQuerySchema.parse({
        primaryStyle: 'CASINO',
        difficulty: 'ADVANCED',
        videoType: 'FULL_PATTERN',
      })
      expect(result.primaryStyle).toBe('CASINO')
      expect(result.difficulty).toBe('ADVANCED')
      expect(result.videoType).toBe('FULL_PATTERN')
    })

    it('should reject invalid primaryStyle', () => {
      expect(() => searchQuerySchema.parse({ primaryStyle: 'HIP_HOP' })).toThrow()
    })

    it('should reject invalid difficulty', () => {
      expect(() => searchQuerySchema.parse({ difficulty: 'EXPERT' })).toThrow()
    })

    it('should reject invalid videoType', () => {
      expect(() => searchQuerySchema.parse({ videoType: 'TUTORIAL' })).toThrow()
    })

    it('should enforce limit max of 100', () => {
      expect(() => searchQuerySchema.parse({ limit: '101' })).toThrow()
    })

    it('should enforce positive page and limit', () => {
      expect(() => searchQuerySchema.parse({ page: '0' })).toThrow()
      expect(() => searchQuerySchema.parse({ limit: '0' })).toThrow()
    })
  })
})