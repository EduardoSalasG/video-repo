import { afterAll, describe, expect, it } from 'vitest';

import {
  applyPendingMigrations,
  bootstrapDatabase,
  hasDomainData,
  waitForDatabase,
} from '../../src/bootstrap/databaseBootstrap';
import { createSeedDatabaseClient, seedDatabase } from '../../src/bootstrap/seedDatabase';
import prisma from '../../src/config/database';

async function domainCardinality() {
  const [users, courses, access] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.courseUserAccess.count(),
  ]);

  return { users, courses, access };
}

describe('database bootstrap integration', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('can run twice without changing an initialized database', async () => {
    const before = await domainCardinality();
    const dependencies = {
      waitForDatabase: () => waitForDatabase(prisma, 3, 50),
      applyPendingMigrations,
      hasDomainData: () => hasDomainData(prisma),
      seed: () => seedDatabase({ prisma: createSeedDatabaseClient(prisma) }),
    };

    await bootstrapDatabase(dependencies);
    const afterFirstRun = await domainCardinality();

    await bootstrapDatabase(dependencies);
    const afterSecondRun = await domainCardinality();

    expect(afterSecondRun).toEqual(afterFirstRun);
    if (before.users > 0 || before.courses > 0) {
      expect(afterFirstRun).toEqual(before);
    } else {
      expect(afterFirstRun.users).toBeGreaterThan(0);
      expect(afterFirstRun.courses).toBeGreaterThan(0);
    }
  });
});
