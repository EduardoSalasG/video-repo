import prisma from '../config/database'

export interface ModuleListParams {
  page?: number
  limit?: number
  search?: string
}

export interface ModuleListResult {
  modules: {
    id: string
    title: string
    description: string | null
    orderIndex: number
    sectionCount: number
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

export interface CreateModuleInput {
  title: string
  description?: string
  orderIndex?: number
}

export interface UpdateModuleInput {
  title?: string
  description?: string | null
  orderIndex?: number
}

export async function findAllModules(
  params: ModuleListParams = {}
): Promise<ModuleListResult> {
  const page = params.page ?? 1
  const limit = params.limit ?? 10
  const search = params.search

  const where = search
    ? {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          {
            description: { contains: search, mode: 'insensitive' as const },
          },
        ],
      }
    : undefined

  const [modules, total] = await Promise.all([
    prisma.module.findMany({
      where,
      orderBy: { orderIndex: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { _count: { select: { sections: true } } },
    }),
    prisma.module.count({ where }),
  ])

  return {
    modules: modules.map((module) => ({
      id: module.id,
      title: module.title,
      description: module.description,
      orderIndex: module.orderIndex,
      sectionCount: module._count.sections,
      createdAt: module.createdAt,
      updatedAt: module.updatedAt,
    })),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }
}

export async function findModuleById(id: string) {
  return prisma.module.findUnique({
    where: { id },
    include: {
      sections: {
        orderBy: { orderIndex: 'asc' },
        select: {
          id: true,
          title: true,
          description: true,
          orderIndex: true,
          videoUrl: true,
          markdownContent: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  })
}

export async function createModule(data: CreateModuleInput) {
  return prisma.module.create({
    data: {
      title: data.title,
      description: data.description,
      orderIndex: data.orderIndex ?? 0,
    },
  })
}

export async function updateModule(id: string, data: UpdateModuleInput) {
  return prisma.module.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      orderIndex: data.orderIndex,
    },
  })
}

export async function deleteModule(id: string) {
  return prisma.module.delete({ where: { id } })
}