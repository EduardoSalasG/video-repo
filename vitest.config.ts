import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Integration tests share a single database; run files serially to avoid
    // cross-file interference from beforeEach cleanup.
    fileParallelism: false,
  },
});