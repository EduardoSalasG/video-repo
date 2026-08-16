import VideoPlayer from '@/components/video/VideoPlayer'
import CompleteButton from './CompleteButton'
import ProgressBar from './ProgressBar'
import type { Section, VideoMetadata } from '@/types'

export default function SectionView({ section, metadata, lastPositionSeconds, completed }: { section: Section; metadata?: VideoMetadata | null; lastPositionSeconds: number | null; completed: boolean }) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">{section.title}</h1>
      {section.description && <p>{section.description}</p>}
      {section.videoUrl && <VideoPlayer src={section.videoUrl} metadata={metadata} />}
      <ProgressBar lastPositionSeconds={lastPositionSeconds} />
      <div className="flex items-center gap-3">
        <CompleteButton sectionId={section.id} completed={completed} onComplete={() => {}} />
      </div>
      {section.markdownContent && (
        <article className="prose prose-slate max-w-none rounded-2xl bg-surface-raised p-6">
          <pre className="whitespace-pre-wrap font-sans">{section.markdownContent}</pre>
        </article>
      )}
    </div>
  )
}
