import Link from 'next/link'
import type { VideoMetadata } from '@/types'

export default function SearchResults({ results, sectionHrefs }: { results: VideoMetadata[]; sectionHrefs?: Map<string, string> }) {
  if (results.length === 0) return <p className="text-sm">No results.</p>
  return (
    <ul className="space-y-2">
      {results.map((r) => {
        const href = sectionHrefs?.get(r.sectionId) ?? `/library/${r.sectionId}`
        return (
          <li key={r.id}>
            <Link href={href} className="flex items-center justify-between rounded-xl bg-surface-raised px-4 py-3">
              <span>{r.primaryStyle} · {r.difficulty}</span>
              <span className="text-sm">{r.videoType}</span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}