import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    test: {
      env: {
        ...env,
      },
      // Integration tests share a single database; run files serially to avoid
      // cross-file interference from beforeEach cleanup.
      fileParallelism: false,
    },
  }
})