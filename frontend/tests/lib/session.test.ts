import { describe, it, expect, vi, afterEach } from 'vitest'

// Run in jsdom-like environment: validate pure helpers that don't touch Next's cookies()
vi.mock('next/headers', () => ({ cookies: vi.fn() }))

import { SESSION_COOKIE } from '@/lib/session'

describe('session', () => {
  afterEach(() => vi.clearAllMocks())

  it('exposes the cookie name', () => {
    expect(SESSION_COOKIE).toBe('video_repo_token')
  })
})