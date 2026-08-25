import { z } from 'zod'

export const createModuleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  orderIndex: z.number().int().nonnegative().optional(),
})

export const updateModuleSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().nullable().optional(),
  orderIndex: z.number().int().nonnegative().optional(),
})

export const moduleQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
})

export const moduleIdSchema = z.object({
  id: z.string().min(1, 'Module id is required'),
})

export const courseIdSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
})

export const courseModuleIdsSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  moduleId: z.string().min(1, 'Module ID is required'),
})