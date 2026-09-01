import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { createSeedDatabaseClient, seedDatabase } from './bootstrap/seedDatabase';
import prisma from './config/database';

const port = process.env.PORT || 3000

async function startServer(): Promise<void> {
  if (process.env.SEED_DB === 'true') {
    console.log('Seeding database...');
    await seedDatabase({ prisma: createSeedDatabaseClient(prisma) });
    console.log('Seeding finished.');
  }

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
  })
}

startServer().catch((error: unknown) => {
  console.error('Unable to start the server.', error);
  process.exitCode = 1;
});
