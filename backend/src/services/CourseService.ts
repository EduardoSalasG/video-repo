import prisma from '../config/database'
import type { Prisma } from '@prisma/client'

export class CourseService {
  static async findAllCourses() {
    return prisma.course.findMany({
      where: { isDeleted: false },
    })
  }

  static async findAllCoursesPaginated(params: {
    page: number
    limit: number
    courseIds?: string[]
    search?: string
  }) {
    const { page = 1, limit = 10, courseIds, search } = params
    const skip = (page - 1) * limit

    const where: Prisma.CourseWhereInput = { isDeleted: false }

    if (courseIds && courseIds.length > 0) {
      where.id = { in: courseIds }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.course.count({ where }),
    ])

    return {
      courses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  static async findAllCoursesByIds(courseIds: string[]) {
    return prisma.course.findMany({
      where: {
        isDeleted: false,
        id: { in: courseIds },
      },
    })
  }

  static async findCourseById(id: string) {
    return prisma.course.findUnique({
      where: { id: id, isDeleted: false },
    })
  }

  static async createCourse(data: { name: string; description?: string }) {
    return prisma.course.create({ data })
  }

  static async updateCourse(
    id: string,
    data: { name?: string; description?: string }
  ) {
    return prisma.course.update({
      where: { id: id, isDeleted: false },
      data,
    })
  }

  static async deleteCourse(id: string) {
    return prisma.course.update({
      where: { id: id, isDeleted: false },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    })
  }
}
