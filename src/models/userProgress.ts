import prisma from '../config/database'

export interface UserProgressListParams {
  page?: number
  limit?: number
}

export interface UserProgressListResult {
  progress: {
    id: string
    userId: string
    sectionId: string
    completedAt: Date | null
    lastPositionSeconds: number | null
    updatedAt: Date
  }[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface UpsertUserProgressInput {
  completedAt?: Date | null
  lastPositionSeconds?: number | null
}

export async function upsertUserProgress(
  userId: string,
  sectionId: string,
  data: UpsertUserProgressInput
) {
  return prisma.userProgress.upsert({
    where: {
      userId_sectionId: { userId, sectionId },
    },
    create: {
      userId,
      sectionId,
      completedAt: data.completedAt ?? null,
      lastPositionSeconds: data.lastPositionSeconds ?? null,
    },
    update: {
      completedAt: data.completedAt,
      lastPositionSeconds: data.lastPositionSeconds,
    },
  })
}

export async function getUserProgressBySection(userId: string, sectionId: string) {
  return prisma.userProgress.findUnique({
    where: {
      userId_sectionId: { userId, sectionId },
    },
  })
}

export async function findAllUserProgress(
  userId: string,
  params: UserProgressListParams = {}
): Promise<UserProgressListResult> {
  const page = params.page ?? 1
  const limit = params.limit ?? 10
  const where = { userId }

  const [progress, total] = await Promise.all([
    prisma.userProgress.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.userProgress.count({ where }),
  ])

  return {
    progress: progress.map((p) => ({
      id: p.id,
      userId: p.userId,
      sectionId: p.sectionId,
      completedAt: p.completedAt,
      lastPositionSeconds: p.lastPositionSeconds,
      updatedAt: p.updatedAt,
    })),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }
}