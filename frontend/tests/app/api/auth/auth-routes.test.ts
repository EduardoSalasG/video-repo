import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ApiError } from '@/lib/http'

vi.mock('@/lib/api', () => ({ login: vi.fn(), register: vi.fn() }))
vi.mock('@/lib/session', () => ({ setSessionCookie: vi.fn() }))

import { login, register } from '@/lib/api'
import { POST as loginPOST } from '../../../../app/api/auth/login/route'
import { POST as registerPOST } from '../../../../app/api/auth/register/route'

function jsonRequest(body: unknown): Request {
  return new Request('http://localhost/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/auth/login', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when the backend rejects credentials', async () => {
    vi.mocked(login).mockRejectedValue(new ApiError(401, 'Invalid email or password'))

    const res = await loginPOST(
      jsonRequest({ email: 'user@example.com', password: 'wrong-password' })
    )

    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ error: 'Invalid email or password' })
  })
})

describe('POST /api/auth/register', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when the backend rejects registration', async () => {
    vi.mocked(register).mockRejectedValue(new ApiError(401, 'Email already in use'))

    const res = await registerPOST(
      jsonRequest({
        email: 'user@example.com',
        username: 'user',
        firstName: 'Jane',
        lastName: 'Doe',
        password: 'password',
      })
    )

    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ error: 'Email already in use' })
  })
})