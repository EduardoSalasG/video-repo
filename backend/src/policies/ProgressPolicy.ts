import { User } from '../models';

export class ProgressPolicy {
  // Users can read their own progress
  static async read(user: User, progressId: string): Promise<boolean> {
    if (user.isDeleted) return false;
    // In real implementation, would check that the progress belongs to the user
    // For now, allowing users to read their own progress
    return true; // Simplified - would actually check ownership
  }

  // Users can create/update their own progress
  static async write(user: User, progressId: string): Promise<boolean> {
    if (user.isDeleted) return false;
    // In real implementation, would check that the progress belongs to the user
    // For now, allowing users to write their own progress
    return true; // Simplified - would actually check ownership
  }

  // Users can delete their own progress
  static async delete(user: User, progressId: string): Promise<boolean> {
    if (user.isDeleted) return false;
    // In real implementation, would check that the progress belongs to the user
    // For now, allowing users to delete their own progress
    return true; // Simplified - would actually check ownership
  }
}
