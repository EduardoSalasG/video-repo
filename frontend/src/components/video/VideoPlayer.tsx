'use client'

import type { VideoMetadata } from '@/types'

export default function VideoPlayer({ src, metadata }: { src: string; metadata?: VideoMetadata | null }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-surface-raised">
      <video controls src={src} className="aspect-video w-full" preload="metadata" />
      {metadata && (
        <div className="flex flex-wrap gap-2 p-4 text-sm">
          <span className="rounded-full bg-ink/10 px-3 py-1">{metadata.difficulty}</span>
          <span className="rounded-full bg-ink/10 px-3 py-1">{metadata.primaryStyle}</span>
          <span className="rounded-full bg-ink/10 px-3 py-1">{metadata.videoType}</span>
          {metadata.durationSeconds && <span className="px-1 py-1">{metadata.durationSeconds}s</span>}
        </div>
      )}
    </div>
  )
}
