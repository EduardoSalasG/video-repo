'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

export default function CompleteButton({ sectionId, completed, onComplete }: { sectionId: string; completed: boolean; onComplete: () => void }) {
  const [done, setDone] = useState(completed)
  const [loading, setLoading] = useState(false)

  async function onClick() {
    setLoading(true)
    await fetch(`/api/progress/${sectionId}/complete`, { method: 'PATCH' }).catch(() => {})
    setDone(true)
    setLoading(false)
    onComplete()
  }

  return (
    <Button variant={done ? 'ghost' : 'primary'} onClick={onClick} disabled={done || loading}>
      {done ? 'Completed ✓' : 'Mark complete'}
    </Button>
  )
}
