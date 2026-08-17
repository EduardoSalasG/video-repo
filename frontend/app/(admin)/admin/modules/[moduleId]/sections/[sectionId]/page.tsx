import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { requireUser } from '@/lib/user'
import { fetchSection, fetchContent, fetchVideoMetadata } from '@/lib/api'
import SectionForm from '@/components/admin/SectionForm'
import ContentEditorForm from '@/components/admin/ContentEditorForm'
import VideoMetadataForm from '@/components/admin/VideoMetadataForm'
import VideoUpload from '@/components/admin/VideoUpload'

export const metadata: Metadata = { title: 'Edit section' }

export default async function EditSectionPage({ params }: { params: Promise<{ moduleId: string; sectionId: string }> }) {
  const { token } = await requireUser(['INSTRUCTOR', 'ADMIN'])
  const { moduleId, sectionId } = await params

  let section
  try {
    section = await fetchSection(token, moduleId, sectionId)
  } catch {
    notFound()
  }

  let content: string | null = null
  try {
    content = (await fetchContent(token, moduleId, sectionId)).markdownContent
  } catch { /* no content yet */ }

  let metadata = null
  try {
    metadata = await fetchVideoMetadata(token, moduleId, sectionId)
  } catch { /* no metadata yet */ }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">{section.title}</h1>
      <section className="rounded-2xl bg-surface-raised p-6">
        <h2 className="mb-4 text-xl font-semibold">Details</h2>
        <SectionForm moduleId={moduleId} id={section.id} initial={section} />
      </section>
      <section className="rounded-2xl bg-surface-raised p-6">
        <h2 className="mb-4 text-xl font-semibold">Lesson content</h2>
        <ContentEditorForm moduleId={moduleId} sectionId={sectionId} initial={content ?? ''} />
      </section>
      <section className="rounded-2xl bg-surface-raised p-6">
        <h2 className="mb-4 text-xl font-semibold">Video</h2>
        <VideoUpload moduleId={moduleId} sectionId={sectionId} />
      </section>
      <section className="rounded-2xl bg-surface-raised p-6">
        <h2 className="mb-4 text-xl font-semibold">Video metadata</h2>
        <VideoMetadataForm moduleId={moduleId} sectionId={sectionId} initial={metadata} />
      </section>
    </div>
  )
}
