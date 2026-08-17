import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginForm from '@/components/auth/LoginForm'

vi.stubGlobal('fetch', vi.fn(() =>
  Promise.resolve({ ok: true, json: () => Promise.resolve({ user: { id: 'u1', role: 'STUDENT' } }) })
))

describe('LoginForm', () => {
  it('renders email and password fields', () => {
    render(<LoginForm />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('submits credentials and redirects', async () => {
    const push = vi.fn()
    vi.stubGlobal('useRouter', () => ({ push }))
    const { container } = render(<LoginForm />)
    const form = container.querySelector('form')!
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'a@b.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret' } })
    fireEvent.submit(form)
    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/auth/login', expect.anything()))
  })
})
