import type { Request, Response } from 'express'
import { z } from 'zod'
import { findSectionById, updateSection } from '../models/section'
import { ModuleService } from '../services/ModuleService'
import { updateContentSchema } from '../validators/contentValidators'

const nestedContentParamsSchema = z
  .object({
    courseId: z.string().min(1, 'Course id is required'),
    moduleId: z.string().min(1, 'Module id is required'),
    sectionId: z.string().min(1, 'Section id is required'),
  })
  .strip()

function isZodError(error: unknown): error is z.ZodError {
  return error instanceof z.ZodError
}

function isPrismaNotFound(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { code?: string }).code === 'P2025'
  )
}

async function validateModuleBelongsToCourse(
  moduleId: string,
  courseId: string
): Promise<void> {
  const module = await ModuleService.findModuleById(moduleId)
  if (!module) {
    throw new Error('Module not found')
  }
  if (module.courseId !== courseId) {
    throw new Error('Module does not belong to the specified course')
  }
}

function sendError(res: Response, error: unknown, operation: string): void {
  console.error(`Validation error in ${operation}:`, error)
  if (isZodError(error)) {
    res.status(400).json({ error: error.issues })
  } else if (isPrismaNotFound(error)) {
    res.status(404).json({ error: 'Section not found' })
  } else {
    res
      .status(500)
      .json({
        error: error instanceof Error ? error.message : 'Internal server error',
      })
  }
}

export async function getContent(req: Request, res: Response): Promise<void> {
  try {
    const params = nestedContentParamsSchema.parse(req.params)
    await validateModuleBelongsToCourse(params.moduleId, params.courseId)

    const section = await findSectionById(params.sectionId, params.moduleId)
    if (!section) {
      res.status(404).json({ error: 'Section not found' })
      return
    }

    res.json({ markdownContent: section.markdownContent })
  } catch (error) {
    sendError(res, error, 'getContent')
  }
}

export async function updateContent(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const params = nestedContentParamsSchema.parse(req.params)
    const data = updateContentSchema.parse(req.body)
    await validateModuleBelongsToCourse(params.moduleId, params.courseId)

    const section = await updateSection(
      params.sectionId,
      { markdownContent: data.markdownContent },
      params.moduleId
    )
    res.json({ markdownContent: section.markdownContent })
  } catch (error) {
    sendError(res, error, 'updateContent')
  }
}
