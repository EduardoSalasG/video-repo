import { z } from 'zod'

export const createVideoMetadataSchema = z.object({
  sectionId: z.string().min(1, 'Section id is required'),
  steps: z.array(z.unknown()).min(1, 'At least one step is required'),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  primaryStyle: z.enum(['MAMBO_ON2', 'CASINO', 'SENSUAL_BACHATA']),
  influences: z.array(z.unknown()),
  durationCounts: z.number().int().nonnegative('Duration counts must be non-negative'),
  videoType: z.enum(['STEP_BREAKDOWN', 'COMBINATION', 'FULL_PATTERN', 'SHINES_SEQUENCE']),
  tags: z.array(z.unknown()),
  fileSize: z.number().int().nonnegative('File size must be non-negative').optional().nullable(),
  durationSeconds: z.number().int().nonnegative('Duration seconds must be non-negative').optional().nullable(),
  filename: z.string().optional().nullable(),
})

export const updateVideoMetadataSchema = z.object({
  steps: z.array(z.unknown()).optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  primaryStyle: z.enum(['MAMBO_ON2', 'CASINO', 'SENSUAL_BACHATA']).optional(),
  influences: z.array(z.unknown()).optional(),
  durationCounts: z.number().int().nonnegative('Duration counts must be non-negative').optional(),
  videoType: z.enum(['STEP_BREAKDOWN', 'COMBINATION', 'FULL_PATTERN', 'SHINES_SEQUENCE']).optional(),
  tags: z.array(z.unknown()).optional(),
  fileSize: z.number().int().nonnegative('File size must be non-negative').optional().nullable(),
  durationSeconds: z.number().int().nonnegative('Duration seconds must be non-negative').optional().nullable(),
  filename: z.string().optional().nullable(),
})

export const videoMetadataQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
})

export const videoMetadataIdSchema = z.object({
  id: z.string().min(1, 'Video metadata id is required'),
})

export const videoMetadataSectionIdSchema = z.object({
  sectionId: z.string().min(1, 'Section id is required'),
}).strip();