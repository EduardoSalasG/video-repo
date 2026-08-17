'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

const STYLES = ['MAMBO_ON2', 'CASINO', 'SENSUAL_BACHATA']
const DIFFICULTIES = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']
const TYPES = ['STEP_BREAKDOWN', 'COMBINATION', 'FULL_PATTERN', 'SHINES_SEQUENCE']

export default function VideoMetadataForm({ moduleId, sectionId, initial }: { moduleId: string; sectionId: string; initial?: { id: string; primaryStyle: string; difficulty: string; videoType: string; tags: string[]; durationCounts?: number } | null }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const form = new FormData(e.currentTarget)
    const body = {
      primaryStyle: String(form.get('primaryStyle')),
      difficulty: String(form.get('difficulty')),
      videoType: String(form.get('videoType')),
      tags: String(form.get('tags') ?? '').split(',').map((t) => t.trim()).filter(Boolean),
      steps: [],
      influences: [],
      durationCounts: Number(form.get('durationCounts') ?? 0),
    }
    const path = `/api/proxy/modules/${moduleId}/sections/${sectionId}/video-metadata`
    const res = await fetch(path, { method: initial ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
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
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Primary style', name: 'primaryStyle', options: STYLES, initial: initial?.primaryStyle },
          { label: 'Difficulty', name: 'difficulty', options: DIFFICULTIES, initial: initial?.difficulty },
          { label: 'Video type', name: 'videoType', options: TYPES, initial: initial?.videoType },
        ].map((f) => (
          <label key={f.name} className="block">
            <span className="mb-1 block text-sm">{f.label}</span>
            <select name={f.name} defaultValue={f.initial} className="w-full rounded-lg border border-ink/15 bg-surface-raised px-3 py-2">
              {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
        ))}
      </div>
      <label className="block">
        <span className="mb-1 block text-sm">Tags (comma-separated)</span>
        <input name="tags" defaultValue={initial?.tags.join(', ')} className="w-full rounded-lg border border-ink/15 bg-surface-raised px-3 py-2" />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm">Duration counts</span>
        <input name="durationCounts" type="number" min={0} defaultValue={initial?.durationCounts ?? 0} className="w-full rounded-lg border border-ink/15 bg-surface-raised px-3 py-2" />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={loading}>{loading ? 'Saving…' : 'Save metadata'}</Button>
    </form>
  )
}
