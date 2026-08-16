import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { requireUser } from '@/lib/user'
import { fetchSection, fetchVideoMetadata, fetchProgress } from '@/lib/api'
import SectionView from '@/components/library/SectionView'

export const metadata: Metadata = { title: 'Lesson' }

export default async function SectionPage({ params }: { params: Promise<{ moduleId: string; sectionId: string }> }) {
  const { token } = await requireUser(['STUDENT', 'INSTRUCTOR', 'ADMIN'])
  const { moduleId, sectionId } = await params

  let section
  try {
    section = await fetchSection(token, moduleId, sectionId)
  } catch {
    notFound()
  }

  let metadata = null
  try {
    metadata = await fetchVideoMetadata(token, moduleId, sectionId)
  } catch {
    /* metadata optional */
  }

  let progress = null
  try {
    progress = await fetchProgress(token, sectionId)
  } catch {
    /* progress optional */
  }

  return (
    <SectionView
      section={section}
      metadata={metadata}
      lastPositionSeconds={progress?.lastPositionSeconds ?? null}
      completed={Boolean(progress?.completedAt)}
    />
  )
}
