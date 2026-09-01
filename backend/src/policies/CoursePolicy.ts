import { User } from '../models'
import prisma from '../config/database'

export class CoursePolicy {
  // Only admins can create courses
  static async create(user: User): Promise<boolean> {
    return user.role === 'ADMIN' && !user.isDeleted
  }

  // Users can read courses they have access to (through CourseUserAccess or if they're the creator?)
  static async read(user: User, courseId: string): Promise<boolean> {
    if (user.isDeleted) return false

    // Admins can read all courses
    if (user.role === 'ADMIN') return true

    // Check if user has explicit access to this course.
    return await CoursePolicy.hasCourseAccess(user.id, courseId)
  }

  // Users with WRITE or MAINTAIN access can update courses (and create modules/sections)
  static async write(user: User, courseId: string): Promise<boolean> {
    if (user.isDeleted) return false

    // Admins can write to all courses
    if (user.role === 'ADMIN') return true

    // Check if user has WRITE or MAINTAIN access to this course.
    const access = await prisma.courseUserAccess.findFirst({
      where: {
        userId: user.id,
        courseId: courseId,
        accessLevel: { in: ['WRITE', 'MAINTAIN'] },
      },
    })

    return !!access
  }

  // Only admins can update courses (course metadata)
  static async update(user: User, _courseId: string): Promise<boolean> {
    return user.role === 'ADMIN' && !user.isDeleted
  }

  // Only admins can delete courses (logic delete)
  static async delete(user: User, _courseId: string): Promise<boolean> {
    return user.role === 'ADMIN' && !user.isDeleted
  }

  // Users can maintain courses (grant/revoke access) if they have MAINTAIN access
  static async maintain(user: User, courseId: string): Promise<boolean> {
    return CoursePolicy.maintainResource(user, courseId)
  }

  // Users with MAINTAIN access can delete child resources (modules, sections, etc.)
  static async maintainResource(
    user: User,
    courseId: string
  ): Promise<boolean> {
    if (user.isDeleted) return false

    // Admins can maintain all resources
    if (user.role === 'ADMIN') return true

    // Check if user has MAINTAIN access to this course
    const access = await prisma.courseUserAccess.findFirst({
      where: {
        userId: user.id,
        courseId: courseId,
        accessLevel: 'MAINTAIN',
      },
    })

    return !!access
  }

  // Helper method to check whether a user has any access to a course.
  private static async hasCourseAccess(
    userId: string,
    courseId: string
  ): Promise<boolean> {
    // Check if user has any access record to this course
    const access = await prisma.courseUserAccess.findFirst({
      where: {
        userId: userId,
        courseId: courseId,
      },
    })

    // Return true if access record exists (any access level grants read access)
    return !!access
  }
}
