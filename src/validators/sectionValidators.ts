import { z } from 'zod'

export const createSectionSchema = z.object({
  moduleId: z.string().min(1, 'Module id is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  orderIndex: z.number().int().nonnegative().optional(),
  videoUrl: z.string().optional(),
  markdownContent: z.string().optional(),
})

export const updateSectionSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().nullable().optional(),
  orderIndex: z.number().int().nonnegative().optional(),
  videoUrl: z.string().nullable().optional(),
  markdownContent: z.string().nullable().optional(),
})

export const sectionQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  orderBy: z.enum(['title', 'createdAt', 'orderIndex']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

export const sectionIdSchema = z.object({
  id: z.string().min(1, 'Section id is required'),
})