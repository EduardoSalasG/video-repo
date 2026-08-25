import { Request, Response } from 'express'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import prisma from '../config/database'
import { searchQuerySchema } from '../validators/searchValidators'

function isZodError(error: unknown): error is z.ZodError {
  return error instanceof z.ZodError
}

function zodErrorDetails(error: z.ZodError): unknown {
  return (error as z.ZodError & { issues?: unknown }).issues ??
    (error as z.ZodError & { errors?: unknown }).errors
}

/**
 * Search video metadata using a keyword and structured filters.
 *
 * Builds a dynamic Prisma `where` clause based on the provided query params:
 * - `search` matches the related section title/description and video tags
 * - `primaryStyle`, `difficulty`, `videoType` filter by the corresponding enums
 * - `courseId` filters by the course that the section's module belongs to
 * - `page`/`limit` control pagination
 */
export async function searchVideos(req: Request, res: Response): Promise<void> {
  try {
    const query = searchQuerySchema.parse(req.query)
    const { search, primaryStyle, difficulty, videoType, courseId, page, limit } = query

    const filters: Prisma.VideoMetadataWhereInput[] = []

    if (search && search !== '') {
      filters.push({
        OR: [
          { section: { title: { contains: search, mode: 'insensitive' as const } } },
          { section: { description: { contains: search, mode: 'insensitive' as const } } },
          { tags: { has: search } },
        ],
      })
    }

    if (primaryStyle) {
      filters.push({ primaryStyle })
    }

    if (difficulty) {
      filters.push({ difficulty })
    }

    if (videoType) {
      filters.push({ videoType })
    }

    // Add courseId filtering: filter by course that the section's module belongs to
    if (courseId) {
      filters.push({
        section: {
          module: {
            courseId: courseId
          }
        }
      })
    }

    const where: Prisma.VideoMetadataWhereInput = filters.length > 0 ? { AND: filters } : {}

    const [videoMetadata, total] = await Promise.all([
      prisma.videoMetadata.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.videoMetadata.count({ where }),
    ])

    res.json({
      videoMetadata,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Validation error in searchVideos:', error)
    if (isZodError(error)) {
      res.status(400).json({ error: zodErrorDetails(error) })
    } else {
      console.error(error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}