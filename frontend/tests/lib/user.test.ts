import { describe, it, expect, vi } from 'vitest'

const fetchMe = vi.fn()
vi.mock('@/lib/api', () => ({ fetchMe: (...a: unknown[]) => fetchMe(...a) }))
vi.mock('next/headers', () => ({ cookies: vi.fn() }))

import { hasRole } from '@/lib/user'

describe('user helpers', () => {
  it('hasRole grants instructor access to instructor', () => {
    expect(hasRole('INSTRUCTOR', ['INSTRUCTOR', 'ADMIN'])).toBe(true)
  })
  it('hasRole denies student access to instructor area', () => {
    expect(hasRole('STUDENT', ['INSTRUCTOR', 'ADMIN'])).toBe(false)
  })
})