import { Request, Response } from 'express'
import prisma from '../config/database'
import { CourseService } from '../services/CourseService'

type AuthenticatedUser = {
  id: string
  role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT'
}

function getAuthenticatedUser(req: Request): AuthenticatedUser | undefined {
  return (req as Request & { user?: AuthenticatedUser }).user
}

export class CourseController {
  static async getAllCourses(req: Request, res: Response): Promise<void> {
    try {
      const user = getAuthenticatedUser(req)
      if (!user) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 12
      const search = req.query.search as string | undefined

      // Admins can see all courses
      if (user.role === 'ADMIN') {
        const result = await CourseService.findAllCoursesPaginated({
          page,
          limit,
          search,
        })
        res.json(result)
        return
      }

      // Get course IDs user has access to
      const userCourseAccess = await prisma.courseUserAccess.findMany({
        where: { userId: user.id },
        select: { courseId: true },
      })

      const courseIds = userCourseAccess.map((access) => access.courseId)

      if (courseIds.length === 0) {
        res.json({
          courses: [],
          pagination: { page, limit, total: 0, pages: 0 },
        })
        return
      }

      const result = await CourseService.findAllCoursesPaginated({
        page,
        limit,
        courseIds,
        search,
      })
      res.json(result)
    } catch (error) {
      console.error('Error in getAllCourses:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  static async getCourseById(req: Request, res: Response): Promise<void> {
    const { id } = req.params
    if (typeof id !== 'string') {
      res.status(400).json({ error: 'Invalid course id' })
      return
    }
    const course = await CourseService.findCourseById(id)
    if (!course) {
      res.status(404).json({ error: 'Course not found' })
      return
    }
    res.json(course)
  }

  static async createCourse(req: Request, res: Response): Promise<void> {
    const { name, description } = req.body
    const course = await CourseService.createCourse({ name, description })
    res.status(201).json(course)
  }

  static async updateCourse(req: Request, res: Response): Promise<void> {
    const { id } = req.params
    if (typeof id !== 'string') {
      res.status(400).json({ error: 'Invalid course id' })
      return
    }
    const { name, description } = req.body
    const course = await CourseService.updateCourse(id, { name, description })
    res.json(course)
  }

  static async deleteCourse(req: Request, res: Response): Promise<void> {
    const { id } = req.params
    if (typeof id !== 'string') {
      res.status(400).json({ error: 'Invalid course id' })
      return
    }
    await CourseService.deleteCourse(id)
    res.status(204).send()
  }
}
