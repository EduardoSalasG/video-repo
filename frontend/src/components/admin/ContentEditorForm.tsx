'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import ContentEditor from './ContentEditor'

export default function ContentEditorForm({ moduleId, sectionId, initial }: { moduleId: string; sectionId: string; initial: string }) {
  const router = useRouter()
  const [value, setValue] = useState(initial)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const res = await fetch(`/api/proxy/modules/${moduleId}/sections/${sectionId}/content`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markdownContent: value }),
    })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json().catch(() => null)
      setError(data?.error ?? 'Save failed')
      return
    }
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <ContentEditor value={value} onChange={setValue} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={loading}>{loading ? 'Saving…' : 'Save content'}</Button>
    </form>
  )
}
