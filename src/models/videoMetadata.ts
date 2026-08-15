import prisma from '../config/database'
import Prisma = require("@prisma/client")

export interface VideoMetadataListParams {
  page?: number
  limit?: number
  search?: string
}

export interface VideoMetadataListResult {
  videoMetadata: {
    id: string
    sectionId: string
    steps: unknown[]
    difficulty: string
    primaryStyle: string
    influences: unknown[]
    durationCounts: number
    videoType: string
    tags: unknown[]
    fileSize: number | null
    durationSeconds: number | null
    filename: string | null
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

export interface CreateVideoMetadataInput {
  sectionId: string
  steps: unknown[]
  difficulty: string
  primaryStyle: string
  influences: unknown[]
  durationCounts: number
  videoType: string
  tags: unknown[]
  fileSize?: number | null
  durationSeconds?: number | null
  filename?: string | null
}

export interface UpdateVideoMetadataInput {
  steps?: unknown[]
  difficulty?: string
  primaryStyle?: string
  influences?: unknown[]
  durationCounts?: number
  videoType?: string
  tags?: unknown[]
  fileSize?: number | null
  durationSeconds?: number | null
  filename?: string | null
}

export async function findAllVideoMetadata(
  params: VideoMetadataListParams = {}
): Promise<VideoMetadataListResult> {
  const page = params.page ?? 1
  const limit = params.limit ?? 10
  const search = params.search

  let where: any = {}
  if (search && search !== '') {
    where = {
      OR: [
        { sectionId: { contains: search, mode: 'insensitive' as const } },
      ],
    }
  }

  const [videoMetadata, total] = await Promise.all([
    prisma.videoMetadata.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.videoMetadata.count({ where }),
  ])

  return {
    videoMetadata: videoMetadata.map((vm) => ({
      id: vm.id,
      sectionId: vm.sectionId,
      steps: vm.steps,
      difficulty: vm.difficulty,
      primaryStyle: vm.primaryStyle,
      influences: vm.influences,
      durationCounts: vm.durationCounts,
      videoType: vm.videoType,
      tags: vm.tags,
      fileSize: vm.fileSize,
      durationSeconds: vm.durationSeconds,
      filename: vm.filename,
      createdAt: vm.createdAt,
      updatedAt: vm.updatedAt,
    })),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }
}

export async function findVideoMetadataById(id: string) {
  return prisma.videoMetadata.findUnique({
    where: { id },
  })
}

export async function findVideoMetadataBySectionId(sectionId: string) {
  return prisma.videoMetadata.findUnique({
    where: { sectionId },
  })
}

export async function createVideoMetadata(data: CreateVideoMetadataInput) {
  return prisma.videoMetadata.create({
    data: {
      sectionId: data.sectionId,
      steps: data.steps as Prisma.InputJsonValue[],
      difficulty: Prisma.Difficulty[data.difficulty.toUpperCase() as keyof typeof Prisma.Difficulty],
      primaryStyle: Prisma.PrimaryStyle[data.primaryStyle.toUpperCase() as keyof typeof Prisma.PrimaryStyle],
      influences: data.influences as Prisma.InputJsonValue[],
      durationCounts: data.durationCounts,
      videoType: Prisma.VideoType[data.videoType.toUpperCase() as keyof typeof Prisma.VideoType],
      tags: data.tags as Prisma.InputJsonValue[],
      fileSize: data.fileSize ?? null,
      durationSeconds: data.durationSeconds ?? null,
      filename: data.filename ?? null,
    },
  })
}

export async function updateVideoMetadata(
  id: string,
  data: UpdateVideoMetadataInput
) {
  return prisma.videoMetadata.update({
    where: { id },
    data: {
      steps: data.steps as Prisma.InputJsonValue[],
      difficulty: Prisma.Difficulty[data.difficulty.toUpperCase() as keyof typeof Prisma.Difficulty],
      primaryStyle: Prisma.PrimaryStyle[data.primaryStyle.toUpperCase() as keyof typeof Prisma.PrimaryStyle],
      influences: data.influences as Prisma.InputJsonValue[],
      durationCounts: data.durationCounts,
      videoType: Prisma.VideoType[() as keyof typeof Prisma.VideoType],
      tags: data.tags as Prisma.InputJsonValue[],
      fileSize: data.fileSize ?? null,
      durationSeconds: data.durationSeconds ?? null,
      filename: data.filename ?? null,
    },
  })
}

export async function deleteVideoMetadata(id: string) {
  return prisma.videoMetadata.delete({ where: { id } })
}