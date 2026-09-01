import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import type { PrismaClient } from '@prisma/client';

const execFileAsync = promisify(execFile);

export type DatabaseBootstrapDependencies = {
  waitForDatabase: () => Promise<void>;
  applyPendingMigrations: () => Promise<void>;
  hasDomainData: () => Promise<boolean>;
  seed: () => Promise<void>;
};

export async function bootstrapDatabase({
  waitForDatabase,
  applyPendingMigrations,
  hasDomainData,
  seed,
}: DatabaseBootstrapDependencies): Promise<void> {
  await waitForDatabase();
  await applyPendingMigrations();

  if (!(await hasDomainData())) {
    await seed();
  }
}

export async function waitForDatabase(
  prisma: Pick<PrismaClient, '$queryRawUnsafe'>,
  maxAttempts = 30,
  delayMilliseconds = 1_000
): Promise<void> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await prisma.$queryRawUnsafe('SELECT 1');
      return;
    } catch (error: unknown) {
      lastError = error;
      if (attempt < maxAttempts) {
        await delay(delayMilliseconds);
      }
    }
  }

  throw new Error(
    `Database did not become available after ${maxAttempts} attempts.`,
    { cause: lastError }
  );
}

export async function applyPendingMigrations(): Promise<void> {
  const prismaCli = require.resolve(`prisma/build/index.js`);

  await execFileAsync(process.execPath, [prismaCli, 'migrate', 'deploy'], {
    cwd: process.cwd(),
    env: process.env,
  });
}

export async function hasDomainData(
  prisma: Pick<PrismaClient, 'user' | 'course'>
): Promise<boolean> {
  const [users, courses] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
  ]);

  return users > 0 || courses > 0;
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}
