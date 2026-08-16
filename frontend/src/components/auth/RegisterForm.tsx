'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function RegisterForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const form = new FormData(e.currentTarget)
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.get('email'),
        username: form.get('username'),
        firstName: form.get('firstName'),
        lastName: form.get('lastName'),
        password: form.get('password'),
      }),
    })
    const data = await res.json().catch(() => null)
    setLoading(false)
    if (!res.ok) {
      setError(data?.error ?? 'Registration failed')
      return
    }
    router.push('/library')
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-sm space-y-4">
      <Input label="Email" name="email" type="email" required autoComplete="email" />
      <Input label="Username" name="username" required autoComplete="username" />
      <Input label="First name" name="firstName" required autoComplete="given-name" />
      <Input label="Last name" name="lastName" required autoComplete="family-name" />
      <Input label="Password" name="password" type="password" required autoComplete="new-password" />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Creating account…' : 'Create account'}
      </Button>
    </form>
  )
}