import { z } from 'zod'

export const moduleIdSchema = z.object({
  moduleId: z.string().min(1, 'Module id is required'),
}).strip()

export const sectionIdSchema = z.object({
  sectionId: z.string().min(1, 'Section id is required'),
}).strip()

export const updateContentSchema = z.object({
  markdownContent: z.string().nullable().optional(),
})