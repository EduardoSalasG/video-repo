import type { Metadata } from 'next'
import { requireUser } from '@/lib/user'
import SectionForm from '@/components/admin/SectionForm'

export const metadata: Metadata = { title: 'New section' }

export default async function NewSectionPage({ params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = await params
  await requireUser(['INSTRUCTOR', 'ADMIN'])
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">New section</h1>
      <SectionForm moduleId={moduleId} />
    </div>
  )
}
