import { z } from 'zod'

export const progressSectionIdSchema = z.object({
  sectionId: z.string().min(1, 'Section id is required'),
})

export const updateProgressSchema = z.object({
  completedAt: z.coerce.date().optional().nullable(),
  lastPositionSeconds: z
    .number()
    .int('Last position seconds must be an integer')
    .nonnegative('Last position seconds must be non-negative')
    .optional()
    .nullable(),
})

export const markProgressCompleteSchema = z.object({
  completedAt: z.coerce.date().optional(),
})

export const progressQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
})