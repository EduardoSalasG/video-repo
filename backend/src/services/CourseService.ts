import prisma from '../config/database';

export class CourseService {
  static async findAllCourses() {
    return prisma.course.findMany();
  }

  static async findCourseById(id: string) {
    return prisma.course.findUnique({ where: { id } });
  }

  static async createCourse(data: { name: string; description?: string }) {
    return prisma.course.create({ data });
  }

  static async updateCourse(id: string, data: { name?: string; description?: string }) {
    return prisma.course.update({ where: { id }, data });
  }

  static async deleteCourse(id: string) {
    return prisma.course.delete({ where: { id } });
  }
}