
import prisma from '../config/database';

export class CourseService {
  static async findAllCourses() {
    return prisma.course.findMany({
      where: { isDeleted: false }
    });
  }

  static async findCourseById(id: string) {
    return prisma.course.findUnique({ 
      where: { id: id, isDeleted: false } 
    });
  }

  static async createCourse(data: { name: string; description?: string }) {
    return prisma.course.create({ data });
  }

  static async updateCourse(id: string, data: { name?: string; description?: string }) {
    return prisma.course.update({ 
      where: { id: id, isDeleted: false },
      data 
    });
  }

  static async deleteCourse(id: string) {
    return prisma.course.update({ 
      where: { id: id, isDeleted: false },
      data: { 
        isDeleted: true, 
        deletedAt: new Date() 
      }
    });
  }
}

