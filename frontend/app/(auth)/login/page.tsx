import type { Metadata } from 'next'
import Link from 'next/link'
import LoginForm from '@/components/auth/LoginForm'

export const metadata: Metadata = { title: 'Sign in' }

export default function LoginPage() {
  return (
    <div className="space-y-6" suppressHydrationWarning={true}>
      <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
      <LoginForm />
      <p className="text-sm">
        No account? <Link href="/register" className="text-accent">Create one</Link>
      </p>
    </div>
  )
}