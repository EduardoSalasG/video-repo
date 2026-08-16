import type { Metadata } from 'next'
import { requireUser } from '@/lib/user'
import { fetchModules } from '@/lib/api'
import ModuleGrid from '@/components/library/ModuleGrid'

export const metadata: Metadata = { title: 'Library' }

export default async function LibraryPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { token } = await requireUser(['STUDENT', 'INSTRUCTOR', 'ADMIN'])
  const page = Number((await searchParams).page ?? '1')
  const data = await fetchModules(token, { page, limit: 12 })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Library</h1>
      <ModuleGrid modules={data.modules} />
    </div>
  )
}