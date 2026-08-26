
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
  // First check if the section exists and is not deleted
  const section = await prisma.section.findUnique({
    where: { id: sectionId, isDeleted: false }
  });
  
  if (!section) {
    throw new Error('Section not found or is deleted');
  }
  
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
  // Get the progress and check if the associated section is not deleted
  const progress = await prisma.userProgress.findUnique({
    where: {
      userId_sectionId: { userId, sectionId },
    },
    include: {
      section: {
        select: {
          isDeleted: true
        }
      }
    }
  });
  
  // If progress exists but section is deleted, return null as if no progress exists
  if (progress && progress.section.isDeleted) {
    return null;
  }
  
  return progress;
}

export async function getProgressById(id: string) {
  // Get the progress and check if the associated section is not deleted
  const progress = await prisma.userProgress.findUnique({
    where: { id },
    include: {
      section: {
        select: {
          isDeleted: true
        }
      }
    }
  });
  
  // If progress exists but section is deleted, return null as if no progress exists
  if (progress && progress.section.isDeleted) {
    return null;
  }
  
  return progress;
}

export async function findAllUserProgress(
  userId: string,
  params: UserProgressListParams = {}
): Promise<UserProgressListResult> {
  const page = params.page ?? 1
  const limit = params.limit ?? 10
  const where = { 
    userId,
    // We need to join with section to filter out deleted sections
    section: {
      isDeleted: false
    }
  }

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
    progress: progress.map(p => ({
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

// Add a function to delete user progress (logic delete)
export async function deleteUserProgress(userId: string, sectionId: string) {
  // First check if the section exists and is not deleted
  const section = await prisma.section.findUnique({
    where: { id: sectionId, isDeleted: false }
  });
  
  if (!section) {
    throw new Error('Section not found or is deleted');
  }
  
  return prisma.userProgress.update({
    where: {
      userId_sectionId: { userId, sectionId }
    },
    data: {
      isDeleted: true,
      deletedAt: new Date()
    }
  });
}

// Add a function to delete user progress by progressId (logic delete)
export async function deleteProgressById(id: string) {
  // First get the progress to check if the associated section is not deleted
  const progress = await prisma.userProgress.findUnique({
    where: { id },
    include: {
      section: {
        select: {
          isDeleted: true
        }
      }
    }
  });
  
  if (!progress) {
    throw new Error('Progress not found');
  }
  
  if (progress.section.isDeleted) {
    throw new Error('Section is deleted');
  }
  
  return prisma.userProgress.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date()
    }
  });
}

