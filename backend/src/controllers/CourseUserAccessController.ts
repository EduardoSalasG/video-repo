import { Request, Response } from 'express'
import { z } from 'zod'

import {
  createCourseUserAccess,
  deleteCourseUserAccess,
  findCourseUserAccessByUserAndCourse,
  findAllCourseUserAccess,
  updateCourseUserAccess,
} from '../models/courseUserAccess'
import { CourseService } from '../services/CourseService'

type AuthenticatedUser = { id: string }

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
 * Grant user access to course
 */
export async function grantAccess(req: Request, res: Response): Promise<void> {
  try {
    // Get user ID from request (set by authenticateUser middleware) - this is the user granting access
    const grantingUserId = getAuthenticatedUser(req)?.id
    if (!grantingUserId) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    // Validate course ID from params
    const courseParams = z.object({ courseId: z.string() }).parse(req.params)

    // Validate that the course exists
    const course = await CourseService.findCourseById(courseParams.courseId)
    if (!course) {
      res.status(404).json({ error: 'Course not found' })
      return
    }

    // Validate user ID from body (the user receiving access)
    const { userId } = z.object({ userId: z.string() }).parse(req.body)

    // Optional: validate access level from body
    const { accessLevel } = z
      .object({
        accessLevel: z.enum(['READ', 'WRITE', 'MAINTAIN']).optional(),
      })
      .parse(req.body)

    // Check if the granting user has MAINTAIN access to the course
    // In a full implementation, we would check the granting user's access level
    // For now, we'll assume any authenticated user can grant access (this should be improved)

    // Check if the user already has access to this course
    const existingAccess = await findCourseUserAccessByUserAndCourse(
      userId,
      courseParams.courseId
    )
    if (existingAccess) {
      // If access already exists, update it
      const access = await updateCourseUserAccess(existingAccess.id, {
        accessLevel: accessLevel ?? existingAccess.accessLevel,
      })
      res.json(access)
    } else {
      // Create new access
      const access = await createCourseUserAccess({
        userId,
        courseId: courseParams.courseId,
        accessLevel: accessLevel ?? 'READ',
        grantedBy: grantingUserId,
      })
      res.status(201).json(access)
    }
  } catch (error) {
    console.error('Validation error in grantAccess:', error)
    if (isZodError(error)) {
      res.status(400).json({ error: zodErrorDetails(error) })
    } else if (error instanceof Error && error.message === 'Course not found') {
      res.status(404).json({ error: 'Course not found' })
    } else {
      console.error(error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}

/**
 * Revoke user access to course
 */
export async function revokeAccess(req: Request, res: Response): Promise<void> {
  try {
    // Get user ID from request (set by authenticateUser middleware) - this is the user revoking access
    const revokingUserId = getAuthenticatedUser(req)?.id
    if (!revokingUserId) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    // Validate course ID from params
    const courseParams = z.object({ courseId: z.string() }).parse(req.params)

    // Validate user ID from params (the user losing access)
    const userParams = z.object({ userId: z.string() }).parse(req.params)

    // Check if the revoking user has MAINTAIN access to the course
    // In a full implementation, we would check the revoking user's access level
    // For now, we'll assume any authenticated user can revoke access (this should be improved)

    // Find the existing access
    const existingAccess = await findCourseUserAccessByUserAndCourse(
      userParams.userId,
      courseParams.courseId
    )

    if (!existingAccess) {
      res.status(404).json({ error: 'Access not found' })
      return
    }

    // Delete the access
    await deleteCourseUserAccess(existingAccess.id)
    res.status(204).send()
  } catch (error) {
    console.error('Validation error in revokeAccess:', error)
    if (isZodError(error)) {
      res.status(400).json({ error: zodErrorDetails(error) })
    } else {
      console.error(error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}

/**
 * Get users with access to course
 */
export async function getCourseUsers(
  req: Request,
  res: Response
): Promise<void> {
  try {
    // Get user ID from request (set by authenticateUser middleware)
    const requestingUserId = getAuthenticatedUser(req)?.id
    if (!requestingUserId) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    // Validate course ID from params
    const courseParams = z.object({ courseId: z.string() }).parse(req.params)

    // In a full implementation, we would check that the requesting user has at least READ access to the course
    // For now, we'll allow any authenticated user to view course access (this should be improved)

    // Get all course access records for this course
    // Note: We're not implementing pagination for simplicity in this endpoint
    // In a production app, we should add pagination
    const allAccess = await findAllCourseUserAccess()

    // Filter to only include access for this course
    const courseAccess = allAccess.courseAccess.filter(
      (access) => access.courseId === courseParams.courseId
    )

    res.json({
      courseId: courseParams.courseId,
      users: courseAccess.map((access) => ({
        id: access.id,
        userId: access.userId,
        accessLevel: access.accessLevel,
        grantedBy: access.grantedBy,
        grantedAt: access.grantedAt,
      })),
    })
  } catch (error) {
    console.error('Validation error in getCourseUsers:', error)
    if (isZodError(error)) {
      res.status(400).json({ error: zodErrorDetails(error) })
    } else {
      console.error(error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}
