import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { createSeedDatabaseClient, seedDatabase } from '../src/bootstrap/seedDatabase';

const connectionString =
  process.env.DATABASE_URL ?? 'postgresql://postgres:admin@localhost:5433/video_repo';
const prisma = new PrismaClient({ adapter: new PrismaPg(connectionString) });

async function main(): Promise<void> {
  console.log('Seeding database...');
  await seedDatabase({ prisma: createSeedDatabaseClient(prisma) });
  console.log('Seeding finished.');
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
