'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { VideoMetadata } from '@/types'
import { getSessionToken } from '@/lib/session'

interface EnrichedResult extends VideoMetadata {
  moduleId?: string
  sectionTitle?: string
  href?: string
}

/**
 * SearchResults – displays the raw video‑metadata returned by /search
 * and enriches each item with the section title and proper link.
 */
export default function SearchResults({
  results,
}: {
  results: VideoMetadata[]
}) {
  const [enriched, setEnriched] = useState<EnrichedResult[]>([])

  useEffect(() => {
    if (!results.length) {
      setEnriched([])
      return
    }

    async function enrich() {
      const token = await getSessionToken()
      if (!token) {
        // No auth – cannot fetch sections; return raw data with missing info.
        setEnriched(
          results.map((r) => ({
            ...r,
            moduleId: undefined,
            sectionTitle: undefined,
            href: undefined,
          }))
        )
        return
      }

      const enrichedPromises = results.map(async (r) => {
        try {
          // Call the proxy endpoint that returns a section by its ID only.
          const res = await fetch(`/api/proxy/section/${r.sectionId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (!res.ok) {
            throw new Error(`Failed to fetch section: ${res.status}`)
          }
          const section = await res.json()
          // section should have moduleId and title
          const href = `/library/${section.moduleId}/${section.id}`
          return {
            ...r,
            moduleId: section.moduleId,
            sectionTitle: section.title,
            href,
          }
        } catch (err) {
          console.warn('Failed to fetch section for', r.sectionId, err)
          return {
            ...r,
            moduleId: undefined,
            sectionTitle: r.sectionId,
            href: undefined,
          }
        }
      })

      const data = await Promise.all(enrichedPromises)
      setEnriched(data)
    }

    enrich()
  }, [results])

  if (!enriched.length) return <p className="text-sm">No results.</p>

  return (
    <ul className="space-y-2">
      {enriched.map((r) => (
        <li key={r.id}>
          {r.href ? (
            <Link
              href={r.href}
              className="flex items-center justify-between rounded-xl bg-surface-raised px-4 py-3"
            >
              <div>
                <span className="font-medium">{r.sectionTitle}</span>
                <span className="block text-sm text-ink/60">
                  {r.tags.length > 0 ? r.tags.join(', ') : '—'}
                </span>
              </div>
              <span className="text-sm">{r.videoType}</span>
            </Link>
          ) : (
            // fallback if we couldn't construct href
            <div className="p-2">
              <span className="font-medium">{r.sectionTitle ?? r.sectionId}</span>
              <span className="block text-sm text-ink/60">
                {r.tags.length > 0 ? r.tags.join(', ') : '—'}
              </span>
              <span className="text-sm">{r.videoType}</span>
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
