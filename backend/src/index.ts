import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { createSeedDatabaseClient, seedDatabase } from './bootstrap/seedDatabase';
import {
  applyPendingMigrations,
  bootstrapDatabase,
  hasDomainData,
  waitForDatabase,
} from './bootstrap/databaseBootstrap';
import prisma from './config/database';

const port = process.env.PORT || 3000

async function startServer(): Promise<void> {
  await bootstrapDatabase({
    waitForDatabase: () => waitForDatabase(prisma),
    applyPendingMigrations,
    hasDomainData: () => hasDomainData(prisma),
    seed: () => seedDatabase({ prisma: createSeedDatabaseClient(prisma) }),
  });

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
  })
}

startServer().catch((error: unknown) => {
  console.error('Unable to start the server.', error);
  process.exitCode = 1;
});
