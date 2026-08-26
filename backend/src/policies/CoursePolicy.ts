import { User } from '../models';

export class CoursePolicy {
  // Only admins can create courses
  static async create(user: User): Promise<boolean> {
    return user.role === 'ADMIN' && !user.isDeleted;
  }

  // Users can read courses they have access to (through CourseUserAccess or if they're the creator?)
  static async read(user: User, courseId: string): Promise<boolean> {
    if (user.isDeleted) return false;
    
    // Admins can read all courses
    if (user.role === 'ADMIN') return true;
    
    // Check if user has explicit access to this course
    // This would require querying the CourseUserAccess table
    // For now, we'll implement a simplified version
    // In a real implementation, this would query the database
    
    // Placeholder implementation - to be replaced with actual DB query
    // For now, let's assume we have a method to check course access
    return await this.hasCourseAccess(user.id, courseId);
  }

  // Only admins can update courses
  static async update(user: User, courseId: string): Promise<boolean> {
    return user.role === 'ADMIN' && !user.isDeleted;
  }

  // Only admins can delete courses (logic delete)
  static async delete(user: User, courseId: string): Promise<boolean> {
    return user.role === 'ADMIN' && !user.isDeleted;
  }

  // Users can maintain courses (grant/revoke access) if they have MAINTAIN access
  static async maintain(user: User, courseId: string): Promise<boolean> {
    // For now, only admins can maintain access
    // In future, this could be extended to instructors with MAINTAIN access level
    return user.role === 'ADMIN' && !user.isDeleted;
  }

  // Helper method to check if user has access to a course
  // This would be implemented with actual database queries in a real implementation
  private static async hasCourseAccess(userId: string, courseId: string): Promise<boolean> {
    // Placeholder - in real implementation, this would query CourseUserAccess table
    // For now, returning false to force proper implementation
    return false;
  }
}
