import type { User } from '@prisma/client'
import prisma from '../config/database'
import { CoursePolicy } from './CoursePolicy'

export class SectionPolicy {
  // Users can read sections in modules they have READ access to
  static async read(user: User, sectionId: string): Promise<boolean> {
    if (user.isDeleted) return false
    return await SectionPolicy.getSectionModuleIdAndCheckAccess(
      sectionId,
      user,
      'read'
    )
  }

  // Users can create/update sections if they have WRITE access to module's course
  static async write(user: User, sectionId: string): Promise<boolean> {
    if (user.isDeleted) return false
    return await SectionPolicy.getSectionModuleIdAndCheckAccess(
      sectionId,
      user,
      'write'
    )
  }

  // Users can delete sections if they have MAINTAIN access to module's course
  static async delete(user: User, sectionId: string): Promise<boolean> {
    if (user.isDeleted) return false
    return await SectionPolicy.getSectionModuleIdAndCheckAccess(
      sectionId,
      user,
      'maintain'
    )
  }

  // Helper method to get section's module ID and check access
  private static async getSectionModuleIdAndCheckAccess(
    sectionId: string,
    user: User,
    accessType: 'read' | 'write' | 'maintain'
  ): Promise<boolean> {
    // 1. Query the section to get its moduleId
    const section = await prisma.section.findFirst({
      where: { id: sectionId, isDeleted: false },
      select: { moduleId: true },
    })

    if (!section) {
      // Section not found or deleted
      return false
    }

    // 2. Get the module to get its courseId
    const module = await prisma.module.findFirst({
      where: { id: section.moduleId, isDeleted: false },
      select: { courseId: true },
    })

    if (!module) {
      // Module not found or deleted
      return false
    }

    // 3. Based on accessType, check appropriate course policy
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
