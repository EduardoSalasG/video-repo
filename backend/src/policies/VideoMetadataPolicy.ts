import type { User } from '@prisma/client'
import prisma from '../config/database'
import { CoursePolicy } from './CoursePolicy'

export class VideoMetadataPolicy {
  // Users can read video metadata in sections they have READ access to
  static async read(user: User, videoMetadataId: string): Promise<boolean> {
    if (user.isDeleted) return false
    return await VideoMetadataPolicy.getVideoMetadataSectionIdAndCheckAccess(
      videoMetadataId,
      user,
      'read'
    )
  }

  // Users can create/update video metadata if they have WRITE access to section's course
  static async write(user: User, videoMetadataId: string): Promise<boolean> {
    if (user.isDeleted) return false
    return await VideoMetadataPolicy.getVideoMetadataSectionIdAndCheckAccess(
      videoMetadataId,
      user,
      'write'
    )
  }

  // Users can delete video metadata if they have MAINTAIN access to section's course
  static async delete(user: User, videoMetadataId: string): Promise<boolean> {
    if (user.isDeleted) return false
    return await VideoMetadataPolicy.getVideoMetadataSectionIdAndCheckAccess(
      videoMetadataId,
      user,
      'maintain'
    )
  }

  // Helper method to get video metadata's section ID and check access
  private static async getVideoMetadataSectionIdAndCheckAccess(
    videoMetadataId: string,
    user: User,
    accessType: 'read' | 'write' | 'maintain'
  ): Promise<boolean> {
    // 1. Query the video metadata to get its sectionId
    const videoMetadata = await prisma.videoMetadata.findFirst({
      where: { id: videoMetadataId, isDeleted: false },
      select: { sectionId: true },
    })

    if (!videoMetadata) {
      // Video metadata not found or deleted
      return false
    }

    // 2. Get the section to get its moduleId
    const section = await prisma.section.findFirst({
      where: { id: videoMetadata.sectionId, isDeleted: false },
      select: { moduleId: true },
    })

    if (!section) {
      // Section not found or deleted
      return false
    }

    // 3. Get the module to get its courseId
    const module = await prisma.module.findFirst({
      where: { id: section.moduleId, isDeleted: false },
      select: { courseId: true },
    })

    if (!module) {
      // Module not found or deleted
      return false
    }

    // 4. Based on accessType, check appropriate course policy
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
