'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function SectionForm({ moduleId, id, initial }: { moduleId: string; id?: string; initial?: { title: string; description?: string | null; orderIndex?: number; videoUrl?: string | null } }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const form = new FormData(e.currentTarget)
    // Parse orderIndex safely
    const orderIndexRaw = form.get('orderIndex')
    let orderIndex: number
    if (orderIndexRaw === null || orderIndexRaw === undefined) {
      orderIndex = 0
    } else {
      const parsed = parseInt(String(orderIndexRaw), 10)
      orderIndex = isNaN(parsed) ? 0 : parsed
    }
    const body = JSON.stringify({
      title: String(form.get('title')),
      description: String(form.get('description') ?? ''),
      orderIndex,
      videoUrl: String(form.get('videoUrl') ?? ''),
    })
    const path = id ? `/api/proxy/modules/${moduleId}/sections/${id}` : `/api/proxy/modules/${moduleId}/sections`
    const res = await fetch(path, { method: id ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json().catch(() => null)
      console.error('SectionForm save error:', data)
      const errorMessage = data?.error ?? 'Save failed'
      setError(errorMessage)
      return
    }
    router.push(`/admin/modules/${moduleId}`)
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input label="Title" name="title" defaultValue={initial?.title} required />
      <label className="block">
        <span className="mb-1 block text-sm">Description</span>
        <textarea name="description" defaultValue={initial?.description ?? ''} className="w-full rounded-lg border border-ink/15 bg-surface-raised px-3 py-2" rows={3} />
      </label>
      <Input label="Order index" name="orderIndex" type="number" min={0} defaultValue={initial?.orderIndex ?? 0} />
      <Input label="Video URL" name="videoUrl" defaultValue={initial?.videoUrl ?? ''} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={loading}>{loading ? 'Saving…' : id ? 'Save changes' : 'Create section'}</Button>
    </form>
  )
}
