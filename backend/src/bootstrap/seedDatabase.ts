import { AccessLevel, Prisma, PrismaClient, Role } from '@prisma/client';

import { hashPassword as defaultHashPassword } from '../utils/password';

type SeedUser = {
  id: string;
};

type SeedCourse = {
  id: string;
};

export interface SeedDatabaseClient {
  user: {
    upsert(args: Prisma.UserUpsertArgs): Promise<SeedUser>;
  };
  course: {
    findFirst(args: Prisma.CourseFindFirstArgs): Promise<SeedCourse | null>;
    create(args: Prisma.CourseCreateArgs): Promise<SeedCourse>;
  };
  courseUserAccess: {
    upsert(args: Prisma.CourseUserAccessUpsertArgs): Promise<unknown>;
  };
}

export type SeedDatabaseDependencies = {
  prisma: SeedDatabaseClient;
  hashPassword?: (password: string) => Promise<string>;
};

const seedUsers = [
  {
    email: 'admin@dance.com',
    username: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    role: Role.ADMIN,
  },
  {
    email: 'instructor@dance.com',
    username: 'instructor',
    firstName: 'Instructor',
    lastName: 'User',
    role: Role.INSTRUCTOR,
  },
  {
    email: 'eduardo@dance.com',
    username: 'eduardo',
    firstName: 'Eduardo',
    lastName: 'Student',
    role: Role.STUDENT,
  },
] as const;

const seedCourses = [
  {
    name: 'Mambo on2',
    description: 'Mambo On2 NY style',
  },
  {
    name: 'Casino',
    description: 'Casino style salsa',
  },
  {
    name: 'Sensual Bachata',
    description: 'Sensual Bachata style',
  },
  {
    name: 'Modern Bachata',
    description: 'Modern Bachata style',
  },
] as const;

export async function seedDatabase({
  prisma,
  hashPassword = defaultHashPassword,
}: SeedDatabaseDependencies): Promise<void> {
  const passwordHash = await hashPassword('password');
  const [admin] = await Promise.all(
    seedUsers.map((user) =>
      prisma.user.upsert({
        where: { email: user.email },
        update: {},
        create: { ...user, passwordHash },
      })
    )
  );

  for (const courseData of seedCourses) {
    const existingCourse = await prisma.course.findFirst({
      where: { name: courseData.name, isDeleted: false },
    });
    const course =
      existingCourse ?? (await prisma.course.create({ data: courseData }));

    await prisma.courseUserAccess.upsert({
      where: {
        userId_courseId: { userId: admin.id, courseId: course.id },
      },
      update: { accessLevel: AccessLevel.MAINTAIN, grantedBy: admin.id },
      create: {
        userId: admin.id,
        courseId: course.id,
        accessLevel: AccessLevel.MAINTAIN,
        grantedBy: admin.id,
      },
    });
  }
}

export function createSeedDatabaseClient(prisma: PrismaClient): SeedDatabaseClient {
  return prisma;
}
