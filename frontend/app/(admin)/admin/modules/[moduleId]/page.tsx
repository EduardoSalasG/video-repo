import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { requireUser } from '@/lib/user'
import { fetchModule, deleteModule } from '@/lib/api'
import DeleteButton from '@/components/admin/DeleteButton'

export const metadata: Metadata = { title: 'Edit module' }

export default async function AdminModulePage({ params }: { params: Promise<{ moduleId: string }> }) {
  const { token } = await requireUser(['INSTRUCTOR', 'ADMIN'])
  const { moduleId } = await params
  let modData
  try {
    modData = await fetchModule(token, moduleId)
  } catch {
    notFound()
  }

  const handleDeleteModule = async () => {
    try {
      await deleteModule(token, moduleId)
      redirect('/admin')
    } catch {
      // Error handling could be added here
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold tracking-tight">{modData.title}</h1>
      <div className="flex items-center justify-between">
        <h2 className="mb-4 text-xl font-semibold">Edit module</h2>
        <DeleteButton id={moduleId} onDelete={handleDeleteModule} />
      </div>
      <section className="rounded-2xl bg-surface-raised p-6">
        <h2 className="mb-4 text-xl font-semibold">Sections</h2>
        <ul className="space-y-2">
          {(modData.sections ?? []).map((s) => (
            <li key={s.id} className="flex items-center justify-between rounded-xl bg-surface-raised px-4 py-3">
              <span>{s.title}</span>
              <div className="flex items-center gap-3 text-sm">
                <a href={`/admin/modules/${moduleId}/sections/${s.id}`}>Edit</a>
                {/* TODO: Add DeleteButton for section deletion using deleteSection from API client */}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
