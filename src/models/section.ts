import prisma from '../config/database'

export interface SectionListParams {
  page?: number
  limit?: number
  search?: string
}

export interface SectionListResult {
  sections: {
    id: string
    moduleId: string
    title: string
    description: string | null
    orderIndex: number
    videoUrl: string | null
    markdownContent: string | null
    createdAt: Date
    updatedAt: Date
  }[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface CreateSectionInput {
  moduleId: string
  title: string
  description?: string
  orderIndex?: number
  videoUrl?: string
  markdownContent?: string
}

export interface UpdateSectionInput {
  title?: string
  description?: string | null
  orderIndex?: number
  videoUrl?: string | null
  markdownContent?: string | null
}

export async function findAllSections(
  moduleId: string,
  params: SectionListParams = {}
): Promise<SectionListResult> {
  const page = params.page ?? 1
  const limit = params.limit ?? 10
  const search = params.search

  const where = {
    moduleId,
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            {
              description: { contains: search, mode: 'insensitive' as const },
            },
          ],
        }
      : {}),
  }

  const [sections, total] = await Promise.all([
    prisma.section.findMany({
      where,
      orderBy: { orderIndex: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.section.count({ where }),
  ])

  return {
    sections: sections.map((section) => ({
      id: section.id,
      moduleId: section.moduleId,
      title: section.title,
      description: section.description,
      orderIndex: section.orderIndex,
      videoUrl: section.videoUrl,
      markdownContent: section.markdownContent,
      createdAt: section.createdAt,
      updatedAt: section.updatedAt,
    })),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }
}

export async function findSectionById(id: string, moduleId: string) {
  return prisma.section.findUnique({
    where: { id, moduleId },
  })
}

export async function createSection(data: CreateSectionInput) {
  return prisma.section.create({
    data: {
      moduleId: data.moduleId,
      title: data.title,
      description: data.description,
      orderIndex: data.orderIndex ?? 0,
      videoUrl: data.videoUrl,
      markdownContent: data.markdownContent,
    },
  })
}

export async function updateSection(id: string, data: UpdateSectionInput, moduleId: string) {
  return prisma.section.update({
    where: { id, moduleId },
    data: {
      title: data.title,
      description: data.description,
      orderIndex: data.orderIndex,
      videoUrl: data.videoUrl,
      markdownContent: data.markdownContent,
    },
  })
}

export async function deleteSection(id: string, moduleId: string) {
  return prisma.section.delete({ where: { id, moduleId } })
}