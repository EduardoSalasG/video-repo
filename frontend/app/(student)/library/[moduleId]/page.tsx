import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireUser } from '@/lib/user'
import { fetchModule } from '@/lib/api'
import SectionItem from '@/components/library/SectionItem'

export const metadata: Metadata = { title: 'Module' }

export default async function ModulePage({ params }: { params: Promise<{ moduleId: string }> }) {
  const { token } = await requireUser(['STUDENT', 'INSTRUCTOR', 'ADMIN'])
  const { moduleId } = await params
  let moduleData
  try {
    moduleData = await fetchModule(token, moduleId)
  } catch {
    notFound()
  }

  return (
    <div className="space-y-6">
      <Link href="/library" className="text-sm text-accent">← Library</Link>
      <h1 className="text-3xl font-semibold tracking-tight">{moduleData.title}</h1>
      {moduleData.description && <p>{moduleData.description}</p>}
      <div className="space-y-2">
        {(moduleData.sections ?? []).map((s) => (
          <SectionItem key={s.id} title={s.title} href={`/library/${moduleData.id}/${s.id}`} completed={false} />
        ))}
      </div>
    </div>
  )
}