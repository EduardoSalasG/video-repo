import { z } from 'zod'

export const searchQuerySchema = z.object({
  search: z.string().optional(),
  primaryStyle: z.enum(['MAMBO_ON2', 'CASINO', 'SENSUAL_BACHATA', 'MODERN_BACHATA']).optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  videoType: z.enum(['STEP_BREAKDOWN', 'COMBINATION', 'FULL_PATTERN', 'SHINES_SEQUENCE']).optional(),
  courseId: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
})