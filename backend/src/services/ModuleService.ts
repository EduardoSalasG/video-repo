
import prisma from '../config/database';
import { CourseService } from './CourseService';

export class ModuleService {
  static async findAllModules(params: any = {}) {
    const { page = 1, limit = 10, search, courseId } = params;
    
    const where = {
      isDeleted: false,
      ...(courseId && { courseId }),
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
    };

    const [modules, total] = await Promise.all([
      prisma.module.findMany({
        where,
        orderBy: { orderIndex: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { _count: { select: { sections: true } } },
      }),
      prisma.module.count({ where }),
    ]);

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
    };
  }

  static async findModuleById(id: string) {
    return prisma.module.findUnique({
      where: { id: id, isDeleted: false },
      include: {
        sections: {
          where: { isDeleted: false },
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
    });
  }

  static async createModule(data: { title: string; description?: string; orderIndex?: number; courseId: string }) {
    // Validate course exists
    const course = await CourseService.findCourseById(data.courseId);
    if (!course) {
      throw new Error('Course not found');
    }
    
    return prisma.module.create({
      data: {
        title: data.title,
        description: data.description,
        orderIndex: data.orderIndex ?? 0,
        courseId: data.courseId,
      },
    });
  }

  static async updateModule(id: string, data: { title?: string; description?: string | null; orderIndex?: number; courseId?: string }) {
    // If courseId is being updated, validate it exists
    if (data.courseId) {
      const course = await CourseService.findCourseById(data.courseId);
      if (!course) {
        throw new Error('Course not found');
      }
    }
    
    return prisma.module.update({
      where: { id: id, isDeleted: false },
      data: {
        title: data.title,
        description: data.description,
        orderIndex: data.orderIndex,
        courseId: data.courseId,
      },
    });
  }

  static async deleteModule(id: string) {
    return prisma.module.update({
      where: { id: id, isDeleted: false },
      data: {
        isDeleted: true,
        deletedAt: new Date()
      }
    });
  }
}

