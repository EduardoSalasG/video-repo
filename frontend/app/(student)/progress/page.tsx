import type { Metadata } from 'next'
import { requireUser } from '@/lib/user'
import { fetchAllProgress } from '@/lib/api'
import { resolveSectionRefs } from '@/lib/links'
import ProgressList from '@/components/progress/ProgressList'

export const metadata: Metadata = { title: 'My Progress' }

export default async function ProgressPage() {
  const { token } = await requireUser(['STUDENT', 'INSTRUCTOR', 'ADMIN'])
  const data = await fetchAllProgress(token, { page: 1, limit: 50 })

  const refs = await resolveSectionRefs(
    token,
    data.progress.map((p) => p.sectionId)
  )

  const items = data.progress.map((p) => {
    const ref = refs.get(p.sectionId)
    return {
      sectionId: p.sectionId,
      completedAt: p.completedAt,
      lastPositionSeconds: p.lastPositionSeconds,
      title: ref?.title,
      href: ref ? `/library/${ref.moduleId}/${ref.sectionId}` : `/library/${p.sectionId}`,
    }
  })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">My Progress</h1>
      <ProgressList items={items} />
    </div>
  )
}