'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

export default function CompleteButton({ sectionId, completed, onComplete }: { sectionId: string; completed: boolean; onComplete?: () => void }) {
  const [done, setDone] = useState(completed)
  const [loading, setLoading] = useState(false)

  async function onClick() {
    setLoading(true)
    await fetch(`/api/proxy/sections/${sectionId}/progress/complete`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }).catch(() => {})
    setDone(true)
    setLoading(false)
    onComplete?.()
  }

  return (
    <Button variant={done ? 'ghost' : 'primary'} onClick={onClick} disabled={done || loading}>
      {done ? 'Completed ✓' : 'Mark complete'}
    </Button>
  )
}