import { describe, expect, it, vi } from 'vitest';

import { bootstrapDatabase } from '../../src/bootstrap/databaseBootstrap';

describe('bootstrapDatabase', () => {
  it('waits, migrates, and seeds an empty database before the server starts', async () => {
    const waitForDatabase = vi.fn().mockResolvedValue(undefined);
    const applyPendingMigrations = vi.fn().mockResolvedValue(undefined);
    const hasDomainData = vi.fn().mockResolvedValue(false);
    const seed = vi.fn().mockResolvedValue(undefined);

    await bootstrapDatabase({
      waitForDatabase,
      applyPendingMigrations,
      hasDomainData,
      seed,
    });

    expect(waitForDatabase).toHaveBeenCalledOnce();
    expect(applyPendingMigrations).toHaveBeenCalledOnce();
    expect(hasDomainData).toHaveBeenCalledOnce();
    expect(seed).toHaveBeenCalledOnce();
  });

  it('does not seed a database that already contains domain data', async () => {
    const seed = vi.fn().mockResolvedValue(undefined);

    await bootstrapDatabase({
      waitForDatabase: vi.fn().mockResolvedValue(undefined),
      applyPendingMigrations: vi.fn().mockResolvedValue(undefined),
      hasDomainData: vi.fn().mockResolvedValue(true),
      seed,
    });

    expect(seed).not.toHaveBeenCalled();
  });
});
