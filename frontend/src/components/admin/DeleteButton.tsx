'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

export default function DeleteButton({
  id,
  redirectTo = '/admin',
}: {
  id: string
  redirectTo?: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function onClick() {
    setLoading(true)
    try {
      await fetch(`/api/proxy/modules/${id}`, { method: 'DELETE' })
      router.push(redirectTo)
      router.refresh()
    } catch (err) {
      console.error('Delete failed:', err)
      // You could set an error state here if you want to show a message
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="ghost" onClick={onClick} disabled={loading}>
      {loading ? 'Deleting…' : 'Delete'}
    </Button>
  )
}
