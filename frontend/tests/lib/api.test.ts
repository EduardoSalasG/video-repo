import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiFetch, fetchModules } from '@/lib/api'

const mockFetch = vi.fn()

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch)
  mockFetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({ modules: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } }),
  })
})

describe('apiFetch', () => {
  it('adds Authorization header from token param', async () => {
    await apiFetch('/modules', { token: 'abc', method: 'GET' })
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/modules'),
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer abc' }) })
    )
  })

  it('throws on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({ error: 'nope' }) })
    await expect(apiFetch('/modules', { token: 'abc' })).rejects.toThrow(/401|nope/)
  })
})

describe('fetchModules', () => {
  it('returns modules', async () => {
    const res = await fetchModules('tok', { page: 1, limit: 10 })
    expect(res.modules).toEqual([])
  })
})