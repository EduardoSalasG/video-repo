import prisma from '../config/database'
import type { AccessLevel } from '@prisma/client'

export interface CourseUserAccessListParams {
  page?: number
  limit?: number
}

export interface CourseUserAccessListResult {
  courseAccess: {
    id: string
    userId: string
    courseId: string
    accessLevel: AccessLevel
    grantedBy: string
    grantedAt: Date
  }[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface CreateCourseUserAccessInput {
  userId: string
  courseId: string
  accessLevel?: AccessLevel
  grantedBy: string
}

export async function findAllCourseUserAccess(
  params: CourseUserAccessListParams = {}
): Promise<CourseUserAccessListResult> {
  const page = params.page ?? 1
  const limit = params.limit ?? 10

  const [courseAccess, total] = await Promise.all([
    prisma.courseUserAccess.findMany({
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.courseUserAccess.count(),
  ])

  return {
    courseAccess: courseAccess.map((access) => ({
      id: access.id,
      userId: access.userId,
      courseId: access.courseId,
      accessLevel: access.accessLevel,
      grantedBy: access.grantedBy,
      grantedAt: access.grantedAt,
    })),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }
}

export async function findCourseUserAccessById(id: string) {
  return prisma.courseUserAccess.findUnique({
    where: { id },
  })
}

export async function findCourseUserAccessByUserAndCourse(
  userId: string,
  courseId: string
) {
  return prisma.courseUserAccess.findFirst({
    where: {
      userId,
      courseId,
    },
  })
}

export async function createCourseUserAccess(
  data: CreateCourseUserAccessInput
) {
  return prisma.courseUserAccess.create({
    data: {
      userId: data.userId,
      courseId: data.courseId,
      accessLevel: data.accessLevel ?? 'READ',
      grantedBy: data.grantedBy,
    },
  })
}

export async function updateCourseUserAccess(
  id: string,
  data: { accessLevel?: AccessLevel }
) {
  return prisma.courseUserAccess.update({
    where: { id },
    data: {
      accessLevel: data.accessLevel,
    },
  })
}

export async function deleteCourseUserAccess(id: string) {
  return prisma.courseUserAccess.delete({
    where: { id },
  })
}
