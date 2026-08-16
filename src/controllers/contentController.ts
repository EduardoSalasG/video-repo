import { Request, Response } from 'express'
import { z } from 'zod'
import {
  moduleIdSchema,
  sectionIdSchema,
  updateContentSchema,
} from '../validators/contentValidators'
import {
  findSectionById,
  updateSection,
} from '../models/section'

function isZodError(error: unknown): error is z.ZodError {
  return error instanceof z.ZodError
}

function zodErrorDetails(error: z.ZodError): unknown {
  return (error as z.ZodError & { issues?: unknown }).issues ??
    (error as z.ZodError & { errors?: unknown }).errors
}

function isPrismaNotFound(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { code?: string }).code === 'P2025'
  )
}

/**
 * Get markdown content for a section
 */
export async function getContent(req: Request, res: Response): Promise<void> {
  try {
    const moduleIdParams = moduleIdSchema.parse(req.params)
    const sectionIdParams = sectionIdSchema.parse(req.params)
    
    const section = await findSectionById(sectionIdParams.sectionId, moduleIdParams.moduleId)
    
    if (!section) {
      res.status(404).json({ error: 'Section not found' })
      return
    }
    
    res.json({ markdownContent: section.markdownContent })
  } catch (error) {
    console.error('Validation error in getContent:', error)
    if (isZodError(error)) {
      res.status(400).json({ error: zodErrorDetails(error) })
    } else {
      console.error(error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}

/**
 * Update markdown content for a section
 */
export async function updateContent(req: Request, res: Response): Promise<void> {
  try {
    const moduleIdParams = moduleIdSchema.parse(req.params)
    const sectionIdParams = sectionIdSchema.parse(req.params)
    
    const parsedBody = updateContentSchema.parse(req.body)
    
    const section = await updateSection(sectionIdParams.sectionId, {
      markdownContent: parsedBody.markdownContent,
    }, moduleIdParams.moduleId)
    
    res.json({ markdownContent: section.markdownContent })
  } catch (error) {
    console.error('Validation error in updateContent:', error)
    if (isZodError(error)) {
      res.status(400).json({ error: zodErrorDetails(error) })
    } else if (isPrismaNotFound(error)) {
      res.status(404).json({ error: 'Section not found' })
    } else {
      console.error(error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}