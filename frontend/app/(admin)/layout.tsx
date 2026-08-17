import Link from 'next/link'
import { requireUser } from '@/lib/user'
import UserNav from '@/components/auth/UserNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireUser(['INSTRUCTOR', 'ADMIN'])
  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-10 border-b border-ink/10 bg-surface/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/admin" className="font-semibold">Admin</Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/admin">Modules</Link>
            <Link href="/library">Library</Link>
          </nav>
          <UserNav user={user} />
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  )
}
