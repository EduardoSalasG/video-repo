'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

export default function DeleteButton({ id, onDelete }: { id: string; onDelete: () => void }) {
  const [loading, setLoading] = useState(false)

  async function onClick() {
    setLoading(true)
    try {
      await fetch(`/api/proxy/modules/${id}`, { method: 'DELETE' })
      onDelete()
    } catch {
      // Error handling could be added here
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
