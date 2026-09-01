import { Request, Response } from 'express'
import { z } from 'zod'
import prisma from '../config/database'
import { moduleQuerySchema } from '../validators/moduleValidators'

type AuthenticatedUser = {
  id: string
  role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT'
}

function getAuthenticatedUser(req: Request): AuthenticatedUser | undefined {
  return (req as Request & { user?: AuthenticatedUser }).user
}

function isZodError(error: unknown): error is z.ZodError {
  return error instanceof z.ZodError
}

function zodErrorDetails(error: z.ZodError): unknown {
  return (
    (error as z.ZodError & { issues?: unknown }).issues ??
    (error as z.ZodError & { errors?: unknown }).errors
  )
}

/**
 * Get all modules accessible to the current user
 */
export async function getUserModules(
  req: Request,
  res: Response
): Promise<void> {
  try {
    // Get user ID and role from request (set by authenticateUser middleware)
    const user = getAuthenticatedUser(req)
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    // Validate query parameters
    const query = moduleQuerySchema.parse(req.query)

    let courseIds: string[] = []

    // Admins have access to all courses
    if (user.role === 'ADMIN') {
      const allCourses = await prisma.course.findMany({
        where: { isDeleted: false },
        select: { id: true },
      })
      courseIds = allCourses.map((c: { id: string }) => c.id)
    } else {
      // Get all course IDs that the user has access to
      const userCourseAccess = await prisma.courseUserAccess.findMany({
        where: {
          userId: user.id,
        },
        select: {
          courseId: true,
        },
      })

      courseIds = userCourseAccess.map(
        (access: { courseId: string }) => access.courseId
      )
    }

    // If user has no course access, return empty result
    if (courseIds.length === 0) {
      res.json({
        modules: [],
        pagination: {
          page: query.page,
          limit: query.limit,
          total: 0,
          pages: 0,
        },
      })
      return
    }

    // Get modules for the courses the user has access to
    const [modules, total] = await Promise.all([
      prisma.module.findMany({
        where: {
          isDeleted: false,
          courseId: {
            in: courseIds,
          },
          ...(query.search
            ? {
                OR: [
                  {
                    title: {
                      contains: query.search,
                      mode: 'insensitive' as const,
                    },
                  },
                  {
                    description: {
                      contains: query.search,
                      mode: 'insensitive' as const,
                    },
                  },
                ],
              }
            : {}),
        },
        orderBy: { orderIndex: 'asc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        include: { _count: { select: { sections: true } } },
      }),
      prisma.module.count({
        where: {
          isDeleted: false,
          courseId: {
            in: courseIds,
          },
          ...(query.search
            ? {
                OR: [
                  {
                    title: {
                      contains: query.search,
                      mode: 'insensitive' as const,
                    },
                  },
                  {
                    description: {
                      contains: query.search,
                      mode: 'insensitive' as const,
                    },
                  },
                ],
              }
            : {}),
        },
      }),
    ])

    res.json({
      modules: modules.map((module) => ({
        id: module.id,
        title: module.title,
        description: module.description,
        orderIndex: module.orderIndex,
        sectionCount: module._count.sections,
        createdAt: module.createdAt,
        updatedAt: module.updatedAt,
      })),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        pages: Math.ceil(total / query.limit),
      },
    })
  } catch (error) {
    console.error('Validation error in getUserModules:', error)
    if (isZodError(error)) {
      res.status(400).json({ error: zodErrorDetails(error) })
    } else {
      console.error(error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}

/**
 * Get a specific module by ID (if user has access to it)
 */
export async function getUserModuleById(
  req: Request,
  res: Response
): Promise<void> {
  try {
    // Get user from request (set by authenticateUser middleware)
    const user = getAuthenticatedUser(req)
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    // Validate module ID from params
    const params = z.object({ moduleId: z.string() }).parse(req.params)

    // Get the module
    const module = await prisma.module.findUnique({
      where: { id: params.moduleId, isDeleted: false },
      include: { _count: { select: { sections: true } } },
    })

    if (!module) {
      res.status(404).json({ error: 'Module not found' })
      return
    }

    // Admins can inspect the complete catalogue without an explicit course grant.
    if (user.role === 'ADMIN') {
      res.json({
        id: module.id,
        title: module.title,
        description: module.description,
        orderIndex: module.orderIndex,
        sectionCount: module._count.sections,
        createdAt: module.createdAt,
        updatedAt: module.updatedAt,
      })
      return
    }

    // Check if user has access to the module's course
    const courseAccess = await prisma.courseUserAccess.findFirst({
      where: {
        userId: user.id,
        courseId: module.courseId,
        // In a real implementation, we might check access level here
        // For reading modules, we need at least READ access to the course
      },
    })

    if (!courseAccess) {
      res.status(403).json({ error: 'Forbidden: Insufficient permissions' })
      return
    }

    res.json({
      id: module.id,
      title: module.title,
      description: module.description,
      orderIndex: module.orderIndex,
      sectionCount: module._count.sections,
      createdAt: module.createdAt,
      updatedAt: module.updatedAt,
    })
  } catch (error) {
    console.error('Validation error in getUserModuleById:', error)
    if (isZodError(error)) {
      res.status(400).json({ error: zodErrorDetails(error) })
    } else {
      console.error(error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}
