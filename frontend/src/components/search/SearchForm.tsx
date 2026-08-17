'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const styles = ['MAMBO_ON2', 'CASINO', 'SENSUAL_BACHATA']
const difficulties = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']
const types = ['STEP_BREAKDOWN', 'COMBINATION', 'FULL_PATTERN', 'SHINES_SEQUENCE']

export default function SearchForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [search, setSearch] = useState(params.get('search') ?? '')
  const [style, setStyle] = useState(params.get('primaryStyle') ?? '')
  const [difficulty, setDifficulty] = useState(params.get('difficulty') ?? '')
  const [type, setType] = useState(params.get('videoType') ?? '')

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const qs = new URLSearchParams()
    if (search.trim()) qs.set('search', search.trim())
    if (style) qs.set('primaryStyle', style)
    if (difficulty) qs.set('difficulty', difficulty)
    if (type) qs.set('videoType', type)
    router.push(`/search?${qs.toString()}`)
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 rounded-xl bg-surface-raised p-4">
      <div>
        <label htmlFor="search" className="mb-1 block text-sm font-medium text-ink">
          Search lessons…
        </label>
        <input
          id="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-ink/15 bg-surface px-3 py-2"
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="style" className="mb-1 block text-sm font-medium text-ink">
            Style
          </label>
          <select
            id="style"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="w-full rounded-lg border border-ink/15 bg-surface px-3 py-2"
          >
            <option value="">All styles</option>
            {styles.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="difficulty" className="mb-1 block text-sm font-medium text-ink">
            Difficulty
          </label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full rounded-lg border border-ink/15 bg-surface px-3 py-2"
          >
            <option value="">All difficulties</option>
            {difficulties.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="type" className="mb-1 block text-sm font-medium text-ink">
            Type
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-lg border border-ink/15 bg-surface px-3 py-2"
          >
            <option value="">All types</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button type="submit" className="w-full rounded-lg bg-accent px-4 py-2 font-medium text-white">
        Search
      </button>
    </form>
  )
}