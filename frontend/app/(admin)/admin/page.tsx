import type { Metadata } from 'next'
import { requireUser } from '@/lib/user'
import { fetchModules } from '@/lib/api'
import ModuleAdminList from '@/components/admin/ModuleAdminList'
import ModuleForm from '@/components/admin/ModuleForm'

export const metadata: Metadata = { title: 'Admin' }

export default async function AdminPage() {
  const { token } = await requireUser(['INSTRUCTOR', 'ADMIN'])
  const data = await fetchModules(token, { page: 1, limit: 50 })
  const modules = data.modules.map((m) => ({ id: m.id, title: m.title, sectionCount: m.sectionCount ?? 0, href: `/admin/modules/${m.id}` }))

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold tracking-tight">Modules</h1>
      <ModuleAdminList modules={modules} />
      <section className="rounded-2xl bg-surface-raised p-6">
        <h2 className="mb-4 text-xl font-semibold">New module</h2>
        <ModuleForm />
      </section>
    </div>
  )
}
