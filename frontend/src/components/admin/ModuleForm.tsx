'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function ModuleForm({ id, initial }: { id?: string; initial?: { title: string; description?: string | null } }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const form = new FormData(e.currentTarget)
    const body = JSON.stringify({
      title: String(form.get('title')),
      description: String(form.get('description') ?? ''),
      ...(id ? {} : { orderIndex: 0 }),
    })
    const path = id ? `/api/proxy/modules/${id}` : '/api/proxy/modules'
    const res = await fetch(path, { method: id ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json().catch(() => null)
      setError(data?.error ?? 'Save failed')
      return
    }
    router.push('/admin')
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input label="Title" name="title" defaultValue={initial?.title} required />
      <label className="block">
        <span className="mb-1 block text-sm">Description</span>
        <textarea name="description" defaultValue={initial?.description ?? ''} className="w-full rounded-lg border border-ink/15 bg-surface-raised px-3 py-2" rows={3} />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={loading}>{loading ? 'Saving…' : id ? 'Save changes' : 'Create module'}</Button>
    </form>
  )
}
