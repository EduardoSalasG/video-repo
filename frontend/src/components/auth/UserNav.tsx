import Link from 'next/link'
import LogoutButton from './LogoutButton'
import type { User } from '@/types'

export default function UserNav({ user }: { user: User }) {
  return (
    <div className="flex items-center gap-4 text-sm">
      <span>{user.firstName} {user.lastName}</span>
      {user.role !== 'STUDENT' && (
        <Link href="/admin" className="text-accent">Admin</Link>
      )}
      <LogoutButton />
    </div>
  )
}