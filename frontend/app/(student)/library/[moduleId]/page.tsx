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
  let module
  try {
    module = await fetchModule(token, moduleId)
  } catch {
    notFound()
  }

  return (
    <div className="space-y-6">
      <Link href="/library" className="text-sm text-accent">← Library</Link>
      <h1 className="text-3xl font-semibold tracking-tight">{module.title}</h1>
      {module.description && <p>{module.description}</p>}
      <div className="space-y-2">
        {(module.sections ?? []).map((s) => (
          <SectionItem key={s.id} title={s.title} href={`/library/${module.id}/${s.id}`} completed={false} />
        ))}
      </div>
    </div>
  )
}