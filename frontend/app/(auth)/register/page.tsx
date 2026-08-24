import type { Metadata } from 'next'
import Link from 'next/link'
import RegisterForm from '@/components/auth/RegisterForm'

export const metadata: Metadata = { title: 'Create account' }

export default function RegisterPage() {
  return (
    <div className="space-y-6" suppressHydrationWarning={true}>
      <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
      <RegisterForm />
      <p className="text-sm">
        Already have an account? <Link href="/login" className="text-accent">Sign in</Link>
      </p>
    </div>
  )
}