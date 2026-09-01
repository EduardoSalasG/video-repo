import { User } from '../models'
import prisma from '../config/database'
import { CoursePolicy } from './CoursePolicy'

export class ModulePolicy {
  // Users can read modules in courses they have READ access to
  static async read(user: User, moduleId: string): Promise<boolean> {
    if (user.isDeleted) return false

    // Placeholder implementation - would query module and then check course access
    // In real implementation, this would:
    // 1. Get module by moduleId
    // 2. Get courseId from module
    // 3. Check if user has read access to that course

    // For now, delegate to a helper that would do the DB lookup
    return await ModulePolicy.getModuleCourseIdAndCheckAccess(
      moduleId,
      user,
      'read'
    )
  }

  // Users can create/update modules if they have WRITE access to course
  static async write(user: User, moduleId: string): Promise<boolean> {
    if (user.isDeleted) return false
    return await ModulePolicy.getModuleCourseIdAndCheckAccess(
      moduleId,
      user,
      'write'
    )
  }

  // Users can delete modules if they have MAINTAIN access to course (or admin)
  static async delete(user: User, moduleId: string): Promise<boolean> {
    if (user.isDeleted) return false
    return await ModulePolicy.getModuleCourseIdAndCheckAccess(
      moduleId,
      user,
      'maintain'
    )
  }

  // Helper method to get module's course ID and check access
  private static async getModuleCourseIdAndCheckAccess(
    moduleId: string,
    user: User,
    accessType: 'read' | 'write' | 'maintain'
  ): Promise<boolean> {
    // 1. Query the module to get its courseId
    const module = await prisma.module.findFirst({
      where: { id: moduleId, isDeleted: false },
      select: { courseId: true },
    })

    if (!module) {
      // Module not found or deleted
      return false
    }

    // 2. Based on accessType, check appropriate course policy
    switch (accessType) {
      case 'read':
        return await CoursePolicy.read(user, module.courseId)
      case 'write':
        return await CoursePolicy.write(user, module.courseId)
      case 'maintain':
        return await CoursePolicy.maintainResource(user, module.courseId)
      default:
        return false
    }
  }
}
