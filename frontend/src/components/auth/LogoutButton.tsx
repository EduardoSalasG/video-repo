'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

export default function LogoutButton() {
  const router = useRouter()
  async function onLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }
  return (
    <Button variant="ghost" onClick={onLogout}>
      Sign out
    </Button>
  )
}