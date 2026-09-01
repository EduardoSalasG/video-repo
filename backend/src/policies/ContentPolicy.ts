import type { User } from '@prisma/client'
import { SectionPolicy } from './SectionPolicy'

/**
 * Content is stored in Section.markdownContent, so its authorization boundary
 * is the section itself rather than a separate content record.
 */
export class ContentPolicy {
  static async read(user: User, sectionId: string): Promise<boolean> {
    return SectionPolicy.read(user, sectionId)
  }

  static async write(user: User, sectionId: string): Promise<boolean> {
    return SectionPolicy.write(user, sectionId)
  }

  static async delete(user: User, sectionId: string): Promise<boolean> {
    return SectionPolicy.delete(user, sectionId)
  }
}
