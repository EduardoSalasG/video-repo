import Link from 'next/link'
import type { VideoMetadata } from '@/types'

export default function SearchResults({
  results,
}: {
  results: VideoMetadata[]
}) {
  if (results.length === 0) return <p className="text-sm">No results.</p>
  return (
    <ul className="space-y-2">
      {results.map((r) => (
        <li key={r.id}>
          <Link
            href={`/library/${r.sectionId}`}
            className="flex items-center justify-between rounded-xl bg-surface-raised px-4 py-3"
          >
            <span>
              {r.primaryStyle} · {r.difficulty}
            </span>
            <span className="text-sm">{r.videoType}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
